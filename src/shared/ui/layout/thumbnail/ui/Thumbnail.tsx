import { cn } from '@/shared/lib/utils';
import { Preloader } from '@/shared/ui/feedback';

interface ThumbnailProps {
	src: string;
	alt: string;
	title?: string;
	isLoading?: boolean;
	className?: string;
	onClick?: () => void;
}

const Thumbnail = ({ src, alt, title, isLoading, className, onClick }: ThumbnailProps) => {
	return (
		<div
			className={cn('flex items-center justify-center overflow-hidden rounded-full', className)}
			onClick={onClick}
		>
			{isLoading ? (
				<Preloader className="size-6 border-3 border-t-[var(--color-secondary)]" />
			) : (
				<img alt={alt} className="aspect-square size-full object-cover" src={src} title={title} />
			)}
		</div>
	);
};

export default Thumbnail;
