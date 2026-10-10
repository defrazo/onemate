import { Button } from '@/shared/ui';

export const CopyButton = ({ onClick }: { onClick: () => void }) => {
	return (
		<Button
			className="h-9 text-sm not-md:w-full md:h-7 lg:ml-auto"
			title="Скопировать"
			type="button"
			variant="ghost"
			onClick={onClick}
		>
			Скопировать результат
		</Button>
	);
};
