import { cn } from '@/shared/lib/utils';

interface PreloaderProps {
	className?: string;
}

const Preloader = ({ className }: PreloaderProps) => {
	return (
		<div
			className={cn(
				'aspect-square animate-spin items-center justify-center rounded-full border-4 border-[var(--color-primary)] border-t-gray-500',
				className
			)}
		></div>
	);
};

export default Preloader;
