import { Button } from '@/shared/ui';

export const CopyButton = ({ onClick }: { onClick: () => void }) => {
	return (
		<Button className="ml-auto h-7 text-sm" title="Скопировать" type="button" variant="ghost" onClick={onClick}>
			Скопировать результат
		</Button>
	);
};
