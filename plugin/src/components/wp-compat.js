/* eslint-disable @wordpress/no-unsafe-wp-apis -- Experimental aliases are referenced only as fallbacks for WordPress versions that predate the stable exports. */
/**
 * Runtime compatibility layer for `@wordpress/components`.
 *
 * The package is externalized from WordPress core, so the exports available at
 * runtime depend on the installed WordPress version. Several components were
 * only recently promoted from an `__experimental*` export to a stable one.
 * These helpers resolve to whichever name the running core provides.
 */
import {
	Text as StableText,
	Heading as StableHeading,
	VStack as StableVStack,
	Grid as StableGrid,
	ConfirmDialog as StableConfirmDialog,
	NavigatorProvider as StableNavigatorProvider,
	NavigatorScreen as StableNavigatorScreen,
	NavigatorButton as StableNavigatorButton,
	NavigatorBackButton as StableNavigatorBackButton,
	__experimentalText,
	__experimentalHeading,
	__experimentalVStack,
	__experimentalGrid,
	__experimentalConfirmDialog,
	__experimentalNavigatorProvider,
	__experimentalNavigatorScreen,
	__experimentalNavigatorButton,
	__experimentalNavigatorBackButton,
} from '@wordpress/components';

export const Text = StableText || __experimentalText;
export const Heading = StableHeading || __experimentalHeading;
export const VStack = StableVStack || __experimentalVStack;
export const Grid = StableGrid || __experimentalGrid;
export const ConfirmDialog = StableConfirmDialog || __experimentalConfirmDialog;
export const NavigatorProvider =
	StableNavigatorProvider || __experimentalNavigatorProvider;
export const NavigatorScreen =
	StableNavigatorScreen || __experimentalNavigatorScreen;
export const NavigatorButton =
	StableNavigatorButton || __experimentalNavigatorButton;
export const NavigatorBackButton =
	StableNavigatorBackButton || __experimentalNavigatorBackButton;
