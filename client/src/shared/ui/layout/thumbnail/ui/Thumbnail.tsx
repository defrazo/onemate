import { cn } from '@/shared/lib/utils';
import { PreloaderMini } from '@/shared/ui/feedback';

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
		<div className={cn('flex items-center justify-center overflow-hidden rounded-full', className)}>
			{isLoading ? (
				<PreloaderMini />
			) : (
				<img
					alt={alt}
					className="no-touch-callout aspect-square size-full object-cover"
					decoding="async"
					loading="lazy"
					src={src}
					title={title}
					onClick={onClick}
					onContextMenu={(e) => e.preventDefault()}
				/>
			)}
		</div>
	);
};

export default Thumbnail;
