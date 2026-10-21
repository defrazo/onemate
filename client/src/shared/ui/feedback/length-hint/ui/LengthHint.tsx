import { cn } from '@/shared/lib/utils';

export const LengthHint = ({ value, max }: { value: string; max: number }) => {
	const length = value.trim().length;
	const isInvalid = length > max;

	return (
		<span
			className={cn(
				'ml-auto text-xs opacity-70',
				isInvalid ? 'text-(--status-error)' : 'text-(--text-secondary)'
			)}
		>
			{length} / {max} символов
		</span>
	);
};
