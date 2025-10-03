import { useSearchParams } from 'react-router-dom';

import { useDeviceType, usePageTitle } from '@/shared/lib/hooks';
import { ContactsTab, OverviewTab, PersonalTab, SecureTab } from '@/widgets/user-profile';
import { JSX, useEffect } from 'react';
import { useStore } from '@/app/providers';

const AccountProfilePage = () => {
	usePageTitle('Профиль');

	const { modalStore } = useStore();
	const device = useDeviceType();
	const [searchParams] = useSearchParams();

	const currentTab = searchParams.get('tab') || 'preview';
	const tabComponents: Record<string, JSX.Element> = {
		overview: <OverviewTab />,
		personal: <PersonalTab />,
		contacts: <ContactsTab />,
		secure: <SecureTab />,
	};

	const targetTab = tabComponents[currentTab];

	useEffect(() => {
		if (!targetTab) return;
		device === 'mobile' ? modalStore.setModal(targetTab, 'sheet') : modalStore.closeModal();
	}, [device, targetTab, modalStore]);

	return device !== 'mobile' ? <div className="w-full max-w-2xl">{targetTab}</div> : null;
};

export default AccountProfilePage;
