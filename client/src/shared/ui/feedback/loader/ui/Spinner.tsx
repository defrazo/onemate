import { cn } from '@/shared/lib/utils';

export const Spinner = ({ className }: { className?: string }) => {
	return (
		<div
			className={cn(
				'animate-spin rounded-full border-4 border-(--accent-default) border-t-(--border-color)',
				className
			)}
		/>
	);
};
