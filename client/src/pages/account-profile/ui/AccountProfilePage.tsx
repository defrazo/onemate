import { Suspense, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

import { useStore } from '@/app/providers';
import { accountSettingsTabs, isAccountSettingsTab, type TabId } from '@/features/account-settings';
import { usePageTitle, useResponsive } from '@/shared/lib/hooks';

export const AccountProfilePage = () => {
	usePageTitle('Профиль');

	const { isMobile } = useResponsive();
	const [searchParams, setSearchParams] = useSearchParams();

	const { modalStore } = useStore();

	const tab = searchParams.get('tab');
	const currentTab: TabId = isAccountSettingsTab(tab) ? tab : 'overview';

	const Tab = accountSettingsTabs[currentTab];

	useEffect(() => {
		if (isAccountSettingsTab(tab)) return;

		setSearchParams(
			(prev) => {
				const params = new URLSearchParams(prev);
				params.set('tab', 'overview');
				return params;
			},
			{ replace: true }
		);
	}, [tab, setSearchParams]);

	useEffect(() => {
		if (isMobile)
			modalStore.setModal(
				<Suspense fallback={null}>
					<Tab />
				</Suspense>,
				'sheet'
			);
		else modalStore.closeModal();
	}, [isMobile, Tab, modalStore]);

	return !isMobile ? (
		<div className="w-full max-w-2xl">
			<Suspense fallback={null}>
				<Tab />
			</Suspense>
		</div>
	) : null;
};
