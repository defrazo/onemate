import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import { useResponsive } from '@/shared/lib/hooks';
import { Button, Thumbnail } from '@/shared/ui';

import { PersonalTab } from '../../PersonalTab';
import { AvatarPicker } from '.';

export const AvatarSection = observer(() => {
	const { isMobile, isTablet } = useResponsive();

	const { modalStore, userProfileStore } = useStore();

	const handleOpen = () => {
		modalStore.setModal(<AvatarPicker />, isMobile && !isTablet ? 'sheet' : undefined, {
			back: () => modalStore.setModal(<PersonalTab />, 'sheet'),
		});
	};

	return (
		<div className="flex items-center gap-2 md:w-1/5 md:flex-col">
			<Thumbnail
				alt="avatar"
				className="size-28 cursor-pointer ring-(--accent-primary-hover) hover:ring-2 md:size-fit"
				isLoading={!userProfileStore.isReady}
				src={userProfileStore.avatar}
				title="Сменить аватар"
				onClick={handleOpen}
			/>
			<Button className="mx-auto h-9 w-1/2 md:h-8 md:w-full" onClick={handleOpen}>
				Изменить
			</Button>
		</div>
	);
});
