import { cn } from '@/shared/lib/utils';

interface PreloaderProps {
	className?: string;
}

const Preloader = ({ className }: PreloaderProps) => {
	return (
		<div
			className={cn(
				'aspect-square animate-spin items-center justify-center rounded-full border-4 border-solid border-(--accent-default) border-t-(--border-color)',
				className
			)}
		/>
	);
};

export default Preloader;
