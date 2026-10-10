import { useState } from 'react';

import { useStore } from '@/app/providers';
import { AVATAR_ENTRIES, type AvatarId } from '@/shared/assets/images/avatars';
import { useResponsive } from '@/shared/lib/hooks';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui';

import { PersonalTab } from '../../PersonalTab';

export const AvatarPicker = () => {
	const { isMobile } = useResponsive();

	const { modalStore, notifyStore, userProfileStore } = useStore();

	const [isLoading, setIsLoading] = useState(false);
	const [selectedAvatar, setSelectedAvatar] = useState<AvatarId | null>(null);

	const canSaveAvatar = selectedAvatar || selectedAvatar === userProfileStore.avatarId;

	const applyAvatar = async () => {
		if (!canSaveAvatar) return;

		setIsLoading(true);

		try {
			const avatarUrl = AVATAR_ENTRIES.find(([id]) => id === selectedAvatar)?.[1];
			if (!avatarUrl) return;

			await userProfileStore.updateAvatar(avatarUrl);

			isMobile ? modalStore.setModal(<PersonalTab />, 'sheet') : modalStore.closeModal();
			notifyStore.setNotice('Аватар обновлен', 'success');
		} catch {
			notifyStore.setNotice('Что-то пошло не так', 'error');
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="flex min-w-80 flex-col rounded-xl md:-mt-5.5 md:w-88 lg:w-98 xl:w-120">
			<h2 className="font-semibold md:text-lg">Выберите аватар</h2>
			<div className="mt-2 flex flex-wrap justify-between gap-1 md:gap-2">
				{AVATAR_ENTRIES.map(([id, src], idx) => (
					<img
						key={id}
						alt={`Аватар ${idx}`}
						className={cn(
							'aspect-square size-20 cursor-pointer rounded-full object-cover transition-transform hover:scale-[1.15] xl:size-28',
							selectedAvatar === id && 'ring-3 ring-(--accent-primary)'
						)}
						src={src}
						onClick={() => setSelectedAvatar(id)}
					/>
				))}
				<Button
					className="mx-auto mt-2 h-8 w-full xl:mt-4 xl:w-52"
					disabled={isLoading || !canSaveAvatar}
					loading={isLoading}
					loadingText="Сохранение..."
					variant="accent"
					onClick={applyAvatar}
				>
					Применить аватар
				</Button>
			</div>
		</div>
	);
};
