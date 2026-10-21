import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import { cn } from '@/shared/lib/utils';
import { Thumbnail } from '@/shared/ui';

export const UserAvatar = observer(({ className }: { className?: string }) => {
	const { userProfileStore, userStore } = useStore();

	return (
		<Thumbnail
			alt={userStore.username}
			className={cn('size-full', className)}
			isLoading={!userProfileStore.isReady}
			src={userProfileStore.avatar}
		/>
	);
});
