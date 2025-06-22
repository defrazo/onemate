import { cn } from '@/shared/lib/utils';

interface DividerProps {
	className?: string;
	variant?: 'default' | 'custom';
	padY?: 'none' | 'sm' | 'md' | 'lg';
	padX?: 'none' | 'sm' | 'md' | 'lg';
}

const Divider = ({ className, variant = 'default', padY = 'none', padX = 'none' }: DividerProps) => {
	const base = 'h-px flex-1';

	const variants = {
		default: 'bg-[var(--bg-tertiary)]',
		custom: '',
	};

	const paddingsY = {
		sm: 'py-2',
		md: 'py-4',
		lg: 'py-6',
		none: 'py-0',
	};

	const paddingsX = {
		sm: 'px-2',
		md: 'px-4',
		lg: 'px-6',
		none: 'py-0',
	};

	return (
		<div className={cn('flex', paddingsY[padY], paddingsX[padX])}>
			<hr className={cn(base, variants[variant], className)} />
		</div>
	);
};

export default Divider;
