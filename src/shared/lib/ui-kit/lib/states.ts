import { cn } from '@/shared/lib/utils';

export const states: Record<string, string> = {
	active: 'bg-[var(--accent-hover)] text-[var(--accent-text)]',
	disabled: cn('bg-[var(--bg-tertiary)] text-[var(--color-disabled)]', 'pointer-events-none opacity-30'),
	error: cn('border-[var(--status-error)] text-[var(--status-error)]', 'animate-pulse'),
	loading: 'cursor-wait opacity-80',
};
