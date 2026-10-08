import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui';

interface SegmentedControlOption<T extends string> {
	value: T;
	label: string;
}

interface SegmentedControlProps<T extends string> {
	value: T;
	options: SegmentedControlOption<T>[];
	onChange: (value: T) => void;
	className?: string;
}

export const SegmentedControl = <T extends string>({
	value,
	options,
	onChange,
	className,
}: SegmentedControlProps<T>) => {
	return (
		<div className={cn('flex h-7 rounded-lg bg-(--bg-tertiary) p-0.5', className)}>
			{options.map((option) => {
				const active = value === option.value;

				return (
					<Button
						key={option.value}
						active={active}
						className={cn(
							'flex-1 rounded-md text-sm transition-colors',
							active
								? 'bg-(--accent-primary-muted) text-(--accent-primary)'
								: 'text-(--text-secondary) hover:text-(--accent-primary)'
						)}
						type="button"
						variant="custom"
						onClick={() => onChange(option.value)}
					>
						{option.label}
					</Button>
				);
			})}
		</div>
	);
};
