import { cn } from '@/shared/lib/utils';

interface AvatarProps {
	src: string;
	alt: string;
	className?: string;
	onClick?: () => void;
}

const Avatar = ({ src, alt, className, onClick }: AvatarProps) => {
	return (
		<div className={cn('overflow-hidden rounded-full', className)} onClick={onClick}>
			<img alt={alt} className="aspect-square size-full object-cover" src={src} />
		</div>
	);
};

export default Avatar;
