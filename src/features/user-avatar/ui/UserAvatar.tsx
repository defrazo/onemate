import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import { cn } from '@/shared/lib/utils';
import { Thumbnail } from '@/shared/ui';

interface UserAvatarProps {
	className?: string;
}

const UserAvatar = ({ className }: UserAvatarProps) => {
	const { userProfileStore, userStore } = useStore();

	return (
		<Thumbnail
			alt={userStore.username}
			className={cn('size-full', className)}
			isLoading={!userProfileStore.isReady}
			src={userProfileStore.avatar}
		/>
	);
};

export default observer(UserAvatar);
