import { useEffect, useRef } from '@wordpress/element';

const WPEditor = ( { id, value, onChange, placeholder, style } ) => {
	const editorRef = useRef( null );

	useEffect( () => {
		// Small delay to ensure DOM is ready and window.wp.editor is loaded
		const initEditor = () => {
			if ( window.wp && window.wp.editor ) {
				window.wp.editor.remove( id ); // Clean up any existing instance first
				window.wp.editor.initialize( id, {
					tinymce: {
						wpautop: true,
						plugins: 'charmap colorpicker directionality fullscreen hr image lists media paste tabfocus textcolor wordpress wpautoresize wpdialogs wpeditimage wpemoji wpgallery wplink wptextpattern wpview',
						toolbar1: 'bold italic underline strikethrough | bullist numlist | blockquote hr | alignleft aligncenter alignright | link unlink | fullscreen',
						toolbar2: 'formatselect forecolor | pastetext removeformat | undo redo',
						setup: ( editor ) => {
							editor.on( 'change keyup', () => {
								editor.save();
								onChange( editor.getContent() );
							} );
						},
					},
					quicktags: true,
				} );
			}
		};

		const timeout = setTimeout( initEditor, 100 );

		return () => {
			clearTimeout( timeout );
			if ( window.wp && window.wp.editor ) {
				window.wp.editor.remove( id );
			}
		};
	}, [ id ] );

	// We can update the content dynamically if value changes from outside (e.g. inserting saved replies)
	useEffect( () => {
		if ( window.tinymce && window.tinymce.get( id ) ) {
			const editor = window.tinymce.get( id );
			if ( editor.getContent() !== value ) {
				editor.setContent( value );
			}
		}
	}, [ value, id ] );

	return (
		<div style={ style }>
			<textarea id={ id } ref={ editorRef } defaultValue={ value } style={{ width: '100%', minHeight: '150px' }} placeholder={ placeholder } />
		</div>
	);
};

export default WPEditor;
