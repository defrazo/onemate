import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import { useDeviceType } from '@/shared/lib/hooks';
import { Button, Thumbnail } from '@/shared/ui';

import { AvatarPicker } from '.';

export const AvatarSection = observer(() => {
	const device = useDeviceType();

	const { modalStore, userProfileStore } = useStore();

	const handleOpen = (): void => modalStore.setModal(<AvatarPicker />, device === 'mobile' ? 'sheet' : undefined);

	return (
		<div className="flex flex-col items-center gap-2 md:w-1/5">
			<Thumbnail
				alt="avatar"
				className="size-1/2 cursor-pointer ring-(--accent-hover) hover:ring-2 md:size-fit"
				isLoading={!userProfileStore.isReady}
				src={userProfileStore.avatar}
				title="Сменить аватар"
				onClick={handleOpen}
			/>
			<Button className="core-elements h-8 w-full" onClick={handleOpen}>
				Изменить
			</Button>
		</div>
	);
});
