import { cn } from '@/shared/lib/utils';

export const Spinner = ({ className }: { className?: string }) => {
	return (
		<div
			className={cn(
				'animate-spin rounded-full border-4 border-(--accent-primary) border-t-(--border-primary)',
				className
			)}
		/>
	);
};
