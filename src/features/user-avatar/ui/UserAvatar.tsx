import { observer } from 'mobx-react-lite';

import { userStore } from '@/entities/user';
import { userProfileStore } from '@/entities/user-profile';
import { AVATAR_OPTIONS } from '@/shared/lib/constants';
import { cn } from '@/shared/lib/utils';
import { Thumbnail } from '@/shared/ui';

interface UserAvatarProps {
	className?: string;
}

const UserAvatar = observer(({ className }: UserAvatarProps) => {
	const { avatarUrl } = userProfileStore.profile ?? {};
	const { username } = userStore.user ?? {};

	return (
		<Thumbnail
			alt={username || 'Пользователь'}
			className={cn('size-full', className)}
			src={avatarUrl || AVATAR_OPTIONS[0]}
		/>
	);
});

export default UserAvatar;
