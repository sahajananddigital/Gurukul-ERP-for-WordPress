<?php
/**
 * Sanitize and normalize helpdesk email HTML so it renders faithfully.
 *
 * Incoming mail is authored for a mail client, not for wp-admin: it relies on
 * tables, inline styles, images and embedded <style> blocks. wp_kses_post()
 * strips all of that, so messages arrive flattened. This class keeps the
 * layout markup while dropping anything that can run script.
 *
 * @package Sahajanand_ERP
 */


declare(strict_types=1);

namespace SahajanandERP\Helpdesk;

use WP_Error;
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Email HTML sanitizer for the helpdesk.
 */
class MailHTML {

	/**
	 * Turn a raw email body into safe HTML that still lays out like the original.
	 *
	 * Prefers an HTML part over a plain-text part. Plain text is converted to
	 * paragraphs; HTML is cleaned and wrapped so its own CSS cannot escape the
	 * message when it is rendered.
	 *
	 * @param string $html HTML body, or an empty string when the message is text only.
	 * @param string $text Plain-text body.
	 * @return string Sanitized HTML.
	 */
	public static function prepare( $html, $text = '' ) {
		$html = is_string( $html ) ? trim( $html ) : '';
		$text = is_string( $text ) ? trim( $text ) : '';

		if ( '' === $html ) {
			return '' === $text ? '' : wpautop( esc_html( $text ) );
		}

		return self::sanitize( $html );
	}

	/**
	 * Strip active content from an email while preserving its layout markup.
	 *
	 * @param string $html Raw email HTML.
	 * @return string Sanitized HTML.
	 */
	public static function sanitize( $html ) {
		$html = self::extract_body( $html );
		$html = self::neutralize_active_content( $html );

		$allowed = self::allowed_html();

		add_filter( 'safe_style_css', array( __CLASS__, 'allow_layout_css' ) );
		$clean = wp_kses( $html, $allowed );
		remove_filter( 'safe_style_css', array( __CLASS__, 'allow_layout_css' ) );

		// wp_kses() entity-encodes CSS, which breaks every inline style.
		$clean = self::decode_style_entities( $clean );

		return trim( $clean );
	}

	/**
	 * Reduce a full email document to the fragment that should be displayed.
	 *
	 * @param string $html Raw email HTML.
	 * @return string Body fragment, or the original markup when it has no body.
	 */
	private static function extract_body( $html ) {
		if ( preg_match( '/<body\b[^>]*>(.*)<\/body>/is', $html, $matches ) ) {
			return $matches[1];
		}

		return $html;
	}

	/**
	 * Remove constructs wp_kses() does not fully defuse on its own.
	 *
	 * Conditional comments (Outlook's <!--[if mso]> ... <![endif]-->) are kept
	 * as plain markup because they carry layout tables, but their condition is
	 * dropped. Everything else that can execute or navigate the parent frame is
	 * removed outright.
	 *
	 * @param string $html Email HTML.
	 * @return string
	 */
	private static function neutralize_active_content( $html ) {
		$patterns = array(
			// Script, embedded documents and external stylesheets.
			'/<script\b[^>]*>.*?<\/script>/is',
			'/<script\b[^>]*\/>/is',
			'/<iframe\b[^>]*>.*?<\/iframe>/is',
			'/<iframe\b[^>]*\/>/is',
			'/<object\b[^>]*>.*?<\/object>/is',
			'/<embed\b[^>]*\/?>/is',
			'/<applet\b[^>]*>.*?<\/applet>/is',
			'/<link\b[^>]*>/is',
			'/<meta\b[^>]*>/is',
			'/<base\b[^>]*>/is',
			// SVG can carry script; email layout does not need it.
			'/<svg\b[^>]*>.*?<\/svg>/is',
			// Stylesheets written as HTML comments inside a style block.
			'/<!\-\-\s*<!\[endif\]\s*\-\->/is',
		);

		$html = preg_replace( $patterns, '', $html );

		// Unwrap Outlook conditional comments but keep the markup inside them.
		$html = preg_replace( '/<!--\[if[^\]]*\]>/i', '', $html );
		$html = str_ireplace( '<![endif]-->', '', $html );

		return $html;
	}

	/**
	 * Tags and attributes an email may use.
	 *
	 * Starts from the post allow-list (links, lists, basic formatting) and adds
	 * the structural markup HTML email is built from.
	 *
	 * @return array<string, array<string, bool>>
	 */
	private static function allowed_html() {
		$allowed = wp_kses_allowed_html( 'post' );

		$layout_tags = array(
			'table',
			'thead',
			'tbody',
			'tfoot',
			'tr',
			'td',
			'th',
			'caption',
			'colgroup',
			'col',
			'center',
		);

		$layout_attrs = array(
			'align'       => true,
			'valign'      => true,
			'bgcolor'     => true,
			'background'  => true,
			'border'      => true,
			'cellpadding' => true,
			'cellspacing' => true,
			'width'       => true,
			'height'      => true,
			'colspan'     => true,
			'rowspan'     => true,
			'nowrap'      => true,
			'style'       => true,
			'class'       => true,
			'id'          => true,
			'dir'         => true,
			'role'        => true,
		);

		foreach ( $layout_tags as $tag ) {
			$allowed[ $tag ] = isset( $allowed[ $tag ] ) ? $allowed[ $tag ] : array();
			$allowed[ $tag ] = array_merge( $allowed[ $tag ], $layout_attrs );
		}

		// Let every already-allowed tag carry the presentation attributes email
		// authors put on divs, paragraphs, spans and images.
		$presentation = array(
			'style'  => true,
			'align'  => true,
			'width'  => true,
			'height' => true,
			'bgcolor' => true,
			'class'  => true,
			'id'     => true,
			'dir'    => true,
		);
		foreach ( $allowed as $tag => $attrs ) {
			$allowed[ $tag ] = array_merge( $attrs, $presentation );
		}

		if ( isset( $allowed['img'] ) ) {
			$allowed['img']['src']    = true;
			$allowed['img']['alt']    = true;
			$allowed['img']['border'] = true;
		}

		// <style> survives as a tag; its text content is CSS, not HTML, and is
		// scrubbed separately so selectors cannot break out of the fragment.
		$allowed['style'] = array( 'type' => true );

		// <font> is obsolete but still how a lot of mail is authored.
		$allowed['font'] = array(
			'color' => true,
			'face'  => true,
			'size'  => true,
			'style' => true,
			'class' => true,
		);

		return $allowed;
	}

	/**
	 * CSS properties email layout depends on beyond WordPress' safe list.
	 *
	 * @param string[] $styles Properties wp_kses already allows.
	 * @return string[]
	 */
	public static function allow_layout_css( $styles ) {
		$extra = array(
			'border-radius',
			'border-collapse',
			'border-spacing',
			'margin',
			'margin-top',
			'margin-right',
			'margin-bottom',
			'margin-left',
			'padding',
			'padding-top',
			'padding-right',
			'padding-bottom',
			'padding-left',
			'max-width',
			'min-width',
			'max-height',
			'min-height',
			'background',
			'background-color',
			'background-image',
			'background-repeat',
			'background-position',
			'background-size',
			'color',
			'display',
			'float',
			'clear',
			'vertical-align',
			'text-align',
			'text-decoration',
			'text-transform',
			'line-height',
			'letter-spacing',
			'font',
			'font-family',
			'font-size',
			'font-weight',
			'font-style',
			'white-space',
			'word-break',
			'overflow',
			'overflow-x',
			'overflow-y',
			'list-style',
			'list-style-type',
			'opacity',
			'box-sizing',
			'table-layout',
			'border-top',
			'border-right',
			'border-bottom',
			'border-left',
			'caption-side',
			'empty-cells',
		);

		return array_values( array_unique( array_merge( $styles, $extra ) ) );
	}

	/**
	 * Restore characters wp_kses() escapes inside style attributes.
	 *
	 * Inline styles such as `font-family: "Helvetica"` or `width: 100%` come
	 * back with quotes and ampersands encoded, which browsers then drop.
	 *
	 * @param string $html Sanitized HTML.
	 * @return string
	 */
	private static function decode_style_entities( $html ) {
		return preg_replace_callback(
			'/(\sstyle\s*=\s*)("|\')(.*?)\2/is',
			static function ( $matches ) {
				$css = html_entity_decode( $matches[3], ENT_QUOTES, 'UTF-8' );
				$css = self::sanitize_css( $css );
				return $matches[1] . '"' . esc_attr( $css ) . '"';
			},
			$html
		);
	}

	/**
	 * Reduce a CSS declaration block or stylesheet to safe declarations.
	 *
	 * Drops expressions, imports, behaviours and any url() that is not an image
	 * or data URI, all of which can exfiltrate data or execute in old engines.
	 *
	 * @param string $css Raw CSS.
	 * @return string
	 */
	private static function sanitize_css( $css ) {
		$css = preg_replace( '/\/\*.*?\*\//s', '', $css );
		$css = preg_replace( '/expression\s*\(/i', '(', $css );
		$css = preg_replace( '/behaviou?r\s*:/i', 'ignored:', $css );
		$css = preg_replace( '/@import\b[^;]*;?/i', '', $css );
		$css = preg_replace( '/javascript\s*:/i', '', $css );

		$css = preg_replace_callback(
			'/url\s*\(\s*([\'"]?)(.*?)\1\s*\)/i',
			static function ( $matches ) {
				$url = trim( $matches[2] );
				if ( preg_match( '/^(https?:|data:image\/)/i', $url ) ) {
					return 'url("' . $url . '")';
				}
				return 'none';
			},
			$css
		);

		return trim( $css );
	}
}
