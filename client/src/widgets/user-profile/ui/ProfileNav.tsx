import { ProfileChip, ProfileMenu } from './components/navigation';

export const ProfileNav = () => {
	return (
		<div className="flex h-fit w-full flex-col gap-4">
			<ProfileChip />
			<ProfileMenu />
		</div>
	);
};
