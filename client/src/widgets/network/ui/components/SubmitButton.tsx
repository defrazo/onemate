import { Button } from '@/shared/ui';

export const SubmitButton = ({ title, isLoading }: { title: string; isLoading: boolean }) => {
	return (
		<Button
			className="h-9 min-w-36 text-sm not-md:w-full md:h-7"
			disabled={isLoading}
			loading={isLoading}
			loadingText="Проверяем..."
			title={title}
			type="submit"
			variant="accent"
		>
			Проверить
		</Button>
	);
};
