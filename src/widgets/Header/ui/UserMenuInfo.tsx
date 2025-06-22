import { UserAvatar, userStore } from '@/entities/user';
import { cn } from '@/shared/lib/utils';

interface UserMenuInfoProps {
	className?: string;
}

export const UserMenuInfo = ({ className }: UserMenuInfoProps) => {
	return (
		<div className={cn('grid grid-cols-[auto_1fr] grid-rows-2 items-center gap-x-4', className)}>
			<UserAvatar className="row-span-2 size-13" />
			<div>{userStore.username}</div>
			<div>{userStore.user?.email}</div>
		</div>
	);
};
