import { UserInfo } from '@/entities/user-profile';

import { ProfileMenu } from './components/navigation';

export const ProfileNav = () => {
	return (
		<div className="flex h-fit w-full flex-col gap-4">
			<UserInfo className="core-base rounded-xl p-3" />
			<ProfileMenu />
		</div>
	);
};
