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
			onContextMenu={(e) => e.preventDefault()}
		>
			{isLoading ? (
				<Preloader className="size-6 border-3 border-t-[var(--border-alt)]" />
			) : (
				<img
					alt={alt}
					className="no-touch-callout aspect-square size-full object-cover"
					src={src}
					title={title}
				/>
			)}
		</div>
	);
};

export default Thumbnail;
