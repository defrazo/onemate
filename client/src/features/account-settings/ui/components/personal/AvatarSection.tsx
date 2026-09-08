import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import { useDeviceType } from '@/shared/lib/hooks';
import { Button, Thumbnail } from '@/shared/ui';

import { PersonalTab } from '../..';
import { AvatarPicker } from '.';

export const AvatarSection = observer(() => {
	const device = useDeviceType();

	const { modalStore, userProfileStore } = useStore();

	const handleOpen = (): void => {
		modalStore.setModal(<AvatarPicker />, device === 'mobile' ? 'sheet' : undefined, {
			back: () => modalStore.setModal(<PersonalTab />, 'sheet'),
		});
	};

	return (
		<div className="flex items-center gap-2 md:w-1/5 lg:flex-col">
			<Thumbnail
				alt="avatar"
				className="size-28 cursor-pointer ring-(--accent-hover) hover:ring-2 md:size-fit"
				isLoading={!userProfileStore.isReady}
				src={userProfileStore.avatar}
				title="Сменить аватар"
				onClick={handleOpen}
			/>
			<Button className="core-elements mx-auto h-8 w-1/2 lg:w-full" onClick={handleOpen}>
				Изменить
			</Button>
		</div>
	);
});
