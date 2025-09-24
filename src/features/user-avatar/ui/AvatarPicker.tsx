import { useStore } from '@/app/providers';
import { AVATAR_OPTIONS } from '@/shared/lib/constants';
import { useDeviceType, useModalBack } from '@/shared/lib/hooks';
import { cn } from '@/shared/lib/utils';
import { Divider } from '@/shared/ui';
import { PersonalTab } from '@/widgets/user-profile';

export const AvatarPicker = () => {
	const { modalStore, notifyStore, userProfileStore } = useStore();
	const device = useDeviceType();
	useModalBack(<PersonalTab />);

	const handleSelect = (src: string) => {
		userProfileStore.updateAvatar(src);
		device === 'mobile' ? modalStore.setModal(<PersonalTab />, 'sheet') : modalStore.closeModal();
		notifyStore.setNotice('Аватар обновлен!', 'success');
	};

	return (
		<div className="flex flex-col rounded-xl px-2 pb-2 md:p-4">
			<h1 className="core-header">Выберите аватар</h1>
			<Divider margY="sm" />
			<div className="grid grid-cols-4 gap-2 px-2 pb-2 md:w-lg md:p-0">
				{AVATAR_OPTIONS.map((src, idx) => (
					<img
						key={src}
						alt={`Аватар ${idx}`}
						className={cn(
							'aspect-square rounded-full object-cover ring-[var(--accent-hover)]',
							'transition-transform duration-500',
							'hover:z-10 hover:scale-[1.3] hover:ring-2',
							'cursor-pointer'
						)}
						src={src}
						onClick={() => handleSelect(src)}
					/>
				))}
			</div>
		</div>
	);
};
