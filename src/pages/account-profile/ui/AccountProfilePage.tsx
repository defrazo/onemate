import { useSearchParams } from 'react-router-dom';

import { usePageTitle } from '@/shared/lib/hooks';
import { ContactsTab, OverviewTab, PersonalTab, SecureTab } from '@/widgets/user-profile';

const AccountProfilePage = () => {
	usePageTitle('Профиль');

	const [searchParams] = useSearchParams();
	const currentTab = searchParams.get('tab') || 'preview';

	return (
		<div className="w-full max-w-2xl">
			{currentTab === 'overview' && <OverviewTab />}
			{currentTab === 'personal' && <PersonalTab />}
			{currentTab === 'contacts' && <ContactsTab />}
			{currentTab === 'secure' && <SecureTab />}
		</div>
	);
};

export default AccountProfilePage;
