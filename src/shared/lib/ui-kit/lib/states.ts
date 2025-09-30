import { cn } from '@/shared/lib/utils';

export const states: Record<string, string> = {
	active: cn('bg-[var(--status-success)]', 'text-[var(--color-primary)]'),
	disabled: cn(
		'border-[var(--color-disabled)] bg-[var(--bg-tertiary)] text-[var(--color-disabled)]',
		'pointer-events-none cursor-not-allowed opacity-60'
	),
	error: cn('text-[var(--status-error)] border-[var(--status-error)]', 'animate-pulse'),
	loading: cn('cursor-wait opacity-80'),
};
