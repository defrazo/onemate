import { cn } from '@/shared/lib/utils';

interface DividerProps {
	className?: string;
	variant?: 'default' | 'custom';
	direction?: 'X' | 'Y';
	margY?: 'none' | 'xs' | 'sm' | 'md' | 'lg';
	margX?: 'none' | 'xs' | 'sm' | 'md' | 'lg';
}

export const Divider = ({
	className,
	variant = 'default',
	direction = 'X',
	margY = 'none',
	margX = 'none',
}: DividerProps) => {
	const variants = {
		default: 'bg-(--border-primary)',
		custom: '',
	};

	const directions = {
		X: 'h-px w-full',
		Y: 'w-px self-stretch',
	};

	const marginsY = {
		xs: 'my-1',
		sm: 'my-2',
		md: 'my-4',
		lg: 'my-6',
		none: 'my-0',
	};

	const marginsX = {
		xs: 'mx-1',
		sm: 'mx-2',
		md: 'mx-4',
		lg: 'mx-6',
		none: 'mx-0',
	};

	return (
		<div
			className={cn(
				'shrink-0',
				directions[direction],
				variants[variant],
				marginsY[margY],
				marginsX[margX],
				className
			)}
			role="separator"
		/>
	);
};
