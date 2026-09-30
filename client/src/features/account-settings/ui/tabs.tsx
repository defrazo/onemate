import { type ComponentType, lazy } from 'react';

export const accountSettingsTabs = {
	overview: lazy(() => import('./OverviewTab').then((module) => ({ default: module.OverviewTab }))),
	personal: lazy(() => import('./PersonalTab').then((module) => ({ default: module.PersonalTab }))),
	contacts: lazy(() => import('./ContactsTab').then((module) => ({ default: module.ContactsTab }))),
	secure: lazy(() => import('./SecureTab').then((module) => ({ default: module.SecureTab }))),
	interface: lazy(() => import('./InterfaceTab').then((module) => ({ default: module.InterfaceTab }))),
} satisfies Record<string, ComponentType>;

export type TabId = keyof typeof accountSettingsTabs;

export const isAccountSettingsTab = (value: string | null): value is TabId => {
	return value !== null && Object.prototype.hasOwnProperty.call(accountSettingsTabs, value);
};
