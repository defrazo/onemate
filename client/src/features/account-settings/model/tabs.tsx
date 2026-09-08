import { type ComponentType } from 'react';

import { ContactsTab, OverviewTab, PersonalTab, SecureTab } from '../ui';

export const accountSettingsTabs = {
	overview: OverviewTab,
	personal: PersonalTab,
	contacts: ContactsTab,
	secure: SecureTab,
} satisfies Record<string, ComponentType>;

export type TabId = keyof typeof accountSettingsTabs;

export const isAccountSettingsTab = (value: string | null): value is TabId => {
	return value !== null && value in accountSettingsTabs;
};
