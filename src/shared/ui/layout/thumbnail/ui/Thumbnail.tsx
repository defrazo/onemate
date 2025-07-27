import { cn } from '@/shared/lib/utils';

interface ThumbnailProps {
	src: string;
	alt: string;
	title?: string;
	className?: string;
	onClick?: () => void;
}

const Thumbnail = ({ src, alt, title, className, onClick }: ThumbnailProps) => {
	return (
		<div className={cn('overflow-hidden rounded-full', className)} onClick={onClick}>
			<img alt={alt} className="aspect-square size-full object-cover" src={src} title={title} />
		</div>
	);
};

export default Thumbnail;
