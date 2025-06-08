import { AVATAR_OPTIONS } from '@/shared/lib/constants';
import { appStore } from '@/shared/store/appStore';

interface AvatarPickerProps {
	className?: string;
	current?: string;
	onSelect: (src: string) => void;
	onClick?: () => void;
}

const AvatarPicker = ({ onSelect }: AvatarPickerProps) => {
	return (
		<div className="flex flex-col items-center gap-4">
			<h2 className="text-2xl">Выберите аватар</h2>
			<div className="grid grid-cols-4 gap-4 md:w-lg md:p-4">
				{AVATAR_OPTIONS.map((src) => (
					<img
						key={src}
						className="aspect-square cursor-pointer rounded-full object-cover ring-[var(--accent-hover)] transition-transform duration-500 hover:scale-[1.3] hover:ring-2"
						src={src}
						onClick={() => {
							onSelect(src);
							appStore.closeModal();
						}}
					/>
				))}
			</div>
		</div>
	);
};

export default AvatarPicker;
