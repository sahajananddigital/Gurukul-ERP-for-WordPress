/**
 * Renders a stored email body the way a mail client would.
 *
 * Email HTML is authored against its own stylesheet, so dropping it straight
 * into the admin page both breaks the layout and lets its CSS restyle the
 * whole screen. A sandboxed, script-less iframe gives the message its own
 * document; the frame grows to the message height so there is no nested scroll.
 */
import { useEffect, useRef } from '@wordpress/element';

/**
 * Baseline stylesheet applied inside the frame.
 *
 * Resets only the document around the message. It never overrides inline
 * styles, so an email's own design wins, while unstyled plain-text mail still
 * reads at a sensible size.
 */
const FRAME_CSS = [
	'html,body{margin:0;padding:0;}',
	'body{font:14px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;color:#1d2327;word-wrap:break-word;overflow-wrap:anywhere;}',
	'img{max-width:100%;height:auto;}',
	'table{max-width:100%;}',
	'a{color:#2271b1;}',
].join( '' );

/**
 * Build the standalone document the iframe renders.
 *
 * @param {string} html Sanitized email HTML.
 * @return {string} Full document.
 */
const buildSrcDoc = ( html ) =>
	'<!doctype html><html><head><meta charset="utf-8">' +
	'<base target="_blank">' +
	`<style>${ FRAME_CSS }</style>` +
	'</head><body>' +
	( html || '' ) +
	'</body></html>';

/**
 * @param {{ html: string }} props
 */
const EmailBody = ( { html } ) => {
	const frameRef = useRef( null );

	useEffect( () => {
		const frame = frameRef.current;
		if ( ! frame ) {
			return undefined;
		}

		const fit = () => {
			const doc = frame.contentDocument;
			if ( ! doc || ! doc.body ) {
				return;
			}
			const height = Math.max(
				doc.body.scrollHeight,
				doc.documentElement ? doc.documentElement.scrollHeight : 0
			);
			frame.style.height = `${ height }px`;
		};

		frame.addEventListener( 'load', fit );

		// Images settle after the document load and change the height.
		const doc = frame.contentDocument;
		if ( doc ) {
			doc.querySelectorAll( 'img' ).forEach( ( img ) => {
				img.addEventListener( 'load', fit );
			} );
		}

		fit();

		return () => frame.removeEventListener( 'load', fit );
	}, [ html ] );

	return (
		<iframe
			ref={ frameRef }
			className="erp-email-body"
			title="Email"
			sandbox=""
			referrerPolicy="no-referrer"
			srcDoc={ buildSrcDoc( html ) }
			style={ {
				width: '100%',
				border: 0,
				display: 'block',
				minHeight: '48px',
			} }
		/>
	);
};

export default EmailBody;
