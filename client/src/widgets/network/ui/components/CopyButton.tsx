import { Button } from '@/shared/ui';

export const CopyButton = ({ onClick }: { onClick: () => void }) => {
	return (
		<Button
			className="ml-auto h-7 rounded-lg px-3 text-sm"
			size="custom"
			title="Скопировать"
			type="button"
			variant="ghost"
			onClick={onClick}
		>
			Скопировать результат
		</Button>
	);
};
