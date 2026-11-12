import { IconX } from '@tabler/icons-react';
import type { Ref } from 'react';

import { Button, Input, Select } from '@/shared/ui';

import { isAmountInput } from '../../lib/sum';
import type { CurrencyAmount } from '../../model/types';

interface SummatorRowProps {
	row: CurrencyAmount & { id: string };
	index: number;
	options: { value: string; label: string; icon?: string | React.ReactNode; disabled?: boolean }[];
	inputRef?: Ref<HTMLInputElement>;
	onChange: (id: string, patch: Partial<CurrencyAmount>) => void;
	onRemove: (id: string) => void;
}

export const SummatorRow = ({ row, index, options, inputRef, onChange, onRemove }: SummatorRowProps) => (
	<div className="core-tone flex shrink-0 items-start gap-1 rounded-lg border border-(--border-contrast)/15 p-1">
		<div className="min-w-0 flex-1">
			<Input
				ref={inputRef}
				aria-label={`Сумма ${index + 1}`}
				className="h-8 min-w-0 border-none bg-transparent text-right text-sm"
				inputMode="decimal"
				placeholder="0"
				value={row.amount}
				onChange={(event) => {
					if (isAmountInput(event.target.value)) onChange(row.id, { amount: event.target.value });
				}}
			/>
		</div>
		<div className="w-27 shrink-0">
			<Select
				align="start"
				className="h-8 text-sm"
				listPlacement="end"
				listWidth={240}
				options={options}
				value={row.code}
				variant="tone"
				onChange={(code) => onChange(row.id, { code })}
			/>
		</div>
		<Button
			aria-label={`Удалить строку ${index + 1}`}
			centerIcon={<IconX className="size-4" />}
			className="mt-1 size-6 shrink-0"
			padding="none"
			title="Удалить строку"
			variant="icon"
			onClick={() => onRemove(row.id)}
		/>
	</div>
);
