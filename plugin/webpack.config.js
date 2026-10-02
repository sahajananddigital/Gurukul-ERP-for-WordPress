/**
 * Webpack configuration for WP ERP
 * This is handled by @wordpress/scripts, but we can customize if needed
 */
const defaultConfig = require( '@wordpress/scripts/config/webpack.config' );

/**
 * Replace runtime `require("react")` calls with the window.React global.
 *
 * @wordpress/dataviews -> @wordpress/ui -> @base-ui/react and @ariakit/react
 * ship esbuild-bundled CJS chunks that call `require("react")` through an
 * esbuild-style `__require.call(void 0, ...)` shim. Webpack cannot statically
 * extract that call (see the "Critical dependency" warnings), and there is no
 * CommonJS `require` on the admin page, so evaluating it throws
 * "Cannot find module 'react'" and aborts the whole bundle before any module
 * body runs — leaving the ERP admin page blank.
 *
 * Loader-level rewrites don't help because webpack re-emits the wrapper after
 * loaders run, so we patch the final emitted asset instead. `window.React` is
 * always present because `react` is a declared dependency in index.asset.php.
 */
class ExternalizeReactRequirePlugin {
	apply( compiler ) {
		compiler.hooks.thisCompilation.tap( 'ExternalizeReactRequire', ( compilation ) => {
			compilation.hooks.processAssets.tap(
				{
					name: 'ExternalizeReactRequire',
					stage: compilation.constructor.PROCESS_ASSETS_STAGE_OPTIMIZE_INLINE,
				},
				( assets ) => {
					for ( const name of Object.keys( assets ) ) {
						if ( ! name.endsWith( '.js' ) ) {
							continue;
						}
						const source = assets[ name ].source();
						const fixed = source.replace(
							/[A-Za-z_$][\w$]*\.__require\.call\(\s*(?:void 0|undefined)\s*,\s*(['"])react\1\s*\)/g,
							'window.React'
						);
						if ( fixed !== source ) {
							compilation.updateAsset(
								name,
								new compiler.webpack.sources.RawSource( fixed )
							);
						}
					}
				}
			);
		} );
	}
}

module.exports = {
	...defaultConfig,
	plugins: [ ...( defaultConfig.plugins || [] ), new ExternalizeReactRequirePlugin() ],
};