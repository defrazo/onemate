import { UserInfo } from '@/entities/user-profile';

import { ProfileMenu } from './components/navigation';

export const ProfileNav = () => {
	return (
		<div className="core-gap flex h-fit w-full flex-col">
			<UserInfo className="core-surface-contrast bg-(--bg-secondary) p-3" />
			<ProfileMenu />
		</div>
	);
};
