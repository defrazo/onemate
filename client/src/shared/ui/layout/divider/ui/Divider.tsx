import { cn } from '@/shared/lib/utils';

interface DividerProps {
	className?: string;
	variant?: 'default' | 'custom';
	margY?: 'none' | 'sm' | 'md' | 'lg';
	margX?: 'none' | 'sm' | 'md' | 'lg';
}

const Divider = ({ className, variant = 'default', margY = 'none', margX = 'none' }: DividerProps) => {
	const base = 'h-px';

	const variants = {
		default: 'bg-(--border-color)',
		custom: '',
	};

	const marginsY = {
		sm: 'my-2',
		md: 'my-4',
		lg: 'my-6',
		none: 'my-0',
	};

	const marginsX = {
		sm: 'mx-2',
		md: 'mx-4',
		lg: 'mx-6',
		none: 'mx-0',
	};

	return (
		<div className={cn(marginsY[margY], marginsX[margX], 'w-full')}>
			<hr className={cn('border-none', base, variants[variant], className)} />
		</div>
	);
};

export default Divider;
