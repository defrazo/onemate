import { useState } from 'react';

import { useStore } from '@/app/providers';
import { AVATAR_ENTRIES, AvatarId } from '@/shared/assets/images/avatars';
import { useDeviceType, useModalBack } from '@/shared/lib/hooks';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui';
import { PersonalTab } from '@/widgets/user-profile';

export const AvatarPicker = () => {
	const device = useDeviceType();

	const { modalStore, notifyStore, userProfileStore } = useStore();

	useModalBack(<PersonalTab />);

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

			device === 'mobile' ? modalStore.setModal(<PersonalTab />, 'sheet') : modalStore.closeModal();
			notifyStore.setNotice('Аватар обновлен!', 'success');
		} catch {
			notifyStore.setNotice('Что-то пошло не так', 'error');
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="-mt-6 flex w-120 flex-col rounded-xl pb-2 md:pb-0">
			<h2 className="text-lg font-semibold">Выберите аватар</h2>
			<div className="my-2 flex flex-wrap justify-between gap-2">
				{AVATAR_ENTRIES.map(([id, src], idx) => (
					<img
						key={id}
						alt={`Аватар ${idx}`}
						className={cn(
							'aspect-square size-15 cursor-pointer rounded-full object-cover transition hover:scale-[1.15] xl:size-28',
							selectedAvatar === id && 'ring-3 ring-(--color-accent)'
						)}
						src={src}
						onClick={() => setSelectedAvatar(id)}
					/>
				))}
				<Button
					className={cn(
						'mx-auto mt-2 h-8 w-full hover:shadow-(--shadow) xl:w-52',
						canSaveAvatar && 'active-btn'
					)}
					disabled={isLoading || !canSaveAvatar}
					loading={isLoading}
					onClick={applyAvatar}
				>
					Применить аватар
				</Button>
			</div>
		</div>
	);
};
