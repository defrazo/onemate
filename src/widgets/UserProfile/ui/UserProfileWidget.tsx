import { observer } from 'mobx-react-lite';

import { profileStore } from '../model/profileStore';
import { ProfileContacts, ProfileInfo, ProfilePreview, ProfileSecure } from '.';

const UserProfileWidget = () => {
	return (
		<div className="mb-2 w-full max-w-2xl">
			{profileStore.activeTab === 'profile' && <ProfilePreview />}
			{profileStore.activeTab === 'info' && <ProfileInfo />}
			{profileStore.activeTab === 'contacts' && <ProfileContacts />}
			{profileStore.activeTab === 'secure' && <ProfileSecure />}
		</div>
	);
};

export default observer(UserProfileWidget);
