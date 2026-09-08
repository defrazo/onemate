import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

import { useStore } from '@/app/providers';
import { accountSettingsTabs, isAccountSettingsTab, type TabId } from '@/features/account-settings';
import { useDeviceType, usePageTitle } from '@/shared/lib/hooks';

export const AccountProfilePage = () => {
	const device = useDeviceType();

	usePageTitle('Профиль');

	const { modalStore } = useStore();

	const [searchParams, setSearchParams] = useSearchParams();

	const tab = searchParams.get('tab');
	const currentTab: TabId = isAccountSettingsTab(tab) ? tab : 'overview';

	const Tab = accountSettingsTabs[currentTab];

	useEffect(() => {
		if (!isAccountSettingsTab(tab)) {
			const params = new URLSearchParams(searchParams);
			params.set('tab', 'overview');

			setSearchParams(params, { replace: true });
		}
	}, [tab]);

	const content = <Tab />;

	useEffect(() => {
		device === 'mobile' ? modalStore.setModal(content, 'sheet') : modalStore.closeModal();
	}, [device, currentTab]);

	return device !== 'mobile' ? <div className="w-full max-w-2xl">{content}</div> : null;
};
