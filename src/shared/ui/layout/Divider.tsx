import { cn } from '@/shared/lib/utils';

interface DividerProps {
	className?: string;
	variant?: 'default' | 'custom';
}

const Divider = ({ className, variant = 'default' }: DividerProps) => {
	const base = 'h-px flex-1';

	const variants = {
		default: 'bg-[var(--bg-tertiary)]',
		custom: '',
	};

	return (
		<div className="flex py-2">
			<hr className={cn(base, variants[variant], className)} />
		</div>
	);
};

export default Divider;
