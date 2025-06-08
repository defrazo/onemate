import { observer } from 'mobx-react-lite';

import { userProfileStore } from '@/entities/userProfile';
import { AVATAR_OPTIONS } from '@/shared/lib/constants';
import { Avatar } from '@/shared/ui';

import { userStore } from '../model';

interface UserAvatarProps {
	className?: string;
}

const UserAvatar = observer(({ className }: UserAvatarProps) => {
	const { avatarUrl } = userProfileStore.profile ?? {};
	const { username } = userStore.user ?? {};

	return (
		<Avatar
			alt={username || 'Пользователь'}
			className={`size-full ${className}`}
			src={avatarUrl || AVATAR_OPTIONS[0]}
		/>
	);
});

export default UserAvatar;
