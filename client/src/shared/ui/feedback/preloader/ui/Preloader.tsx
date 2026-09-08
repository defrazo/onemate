import { cn } from '@/shared/lib/utils';

export const Preloader = ({ className }: { className?: string }) => {
	return (
		<div
			className={cn(
				'aspect-square animate-spin items-center justify-center rounded-full border-4 border-solid border-(--accent-default) border-t-(--border-color)',
				className
			)}
		/>
	);
};
