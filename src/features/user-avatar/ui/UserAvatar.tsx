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
	const { avatar_url } = userProfileStore.profile ?? {};
	const { username } = userStore ?? {};

	return (
		<Thumbnail
			alt={username || 'Пользователь'}
			className={cn('size-full', className)}
			src={avatar_url || AVATAR_OPTIONS[0]}
		/>
	);
});

export default UserAvatar;
