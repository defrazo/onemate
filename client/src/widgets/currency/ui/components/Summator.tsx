import { useRef } from 'react';
import { IconCalculator, IconCopy, IconPlus } from '@tabler/icons-react';
import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import { useCopy } from '@/shared/lib/hooks';
import { formatFixed } from '@/shared/lib/utils';
import { Button, Select, ViewHeader } from '@/shared/ui';

import { formatSummatorSummary, sumCurrencies } from '../../lib/sum';
import { MAX_ROWS } from '../../model/constants';
import type { CurrencyAmount, SummatorState } from '../../model/types';
import { SummatorRow } from './SummatorRow';

interface SummatorProps {
	value: SummatorState;
	onChange: (value: SummatorState) => void;
	onBack: () => void;
}

export const Summator = observer(({ value, onChange, onBack }: SummatorProps) => {
	const copy = useCopy();

	const { currencyStore } = useStore();

	const newRowId = useRef<string | null>(null);

	const total = sumCurrencies(value.rows, value.target, currencyStore.ratesList);
	const formatted = total === null ? null : formatFixed(total, 2);

	const updateRow = (id: string, patch: Partial<CurrencyAmount>) => {
		onChange({ ...value, rows: value.rows.map((row) => (row.id === id ? { ...row, ...patch } : row)) });
	};

	const removeRow = (id: string) => {
		onChange({ ...value, rows: value.rows.filter((row) => row.id !== id) });
	};

	const addRow = () => {
		if (value.rows.length >= MAX_ROWS) return;

		const id = crypto.randomUUID();
		newRowId.current = id;

		onChange({ ...value, rows: [...value.rows, { id, amount: '', code: currencyStore.baseCode }] });
	};

	const focusNewRow = (element: HTMLInputElement | null) => {
		if (!element || !newRowId.current) return;

		element.focus();
		element.scrollIntoView({ block: 'nearest' });
		newRowId.current = null;
	};

	const copyTotal = () => {
		if (total === null) return;

		const summary = formatSummatorSummary(value.rows, value.target, total);

		void copy(summary, 'Сводка скопирована');
	};

	return (
		<div className="flex min-h-0 min-w-0 flex-1 flex-col gap-2">
			<ViewHeader className="mb-2" icon={IconCalculator} title="Сумматор валют" onBack={onBack} />
			<div className="flex min-h-0 flex-1 scrollbar-none flex-col gap-2 overflow-y-auto">
				{value.rows.map((row, idx) => (
					<SummatorRow
						key={row.id}
						index={idx}
						inputRef={row.id === newRowId.current ? focusNewRow : undefined}
						options={currencyStore.currencyOptions}
						row={row}
						onChange={updateRow}
						onRemove={removeRow}
					/>
				))}
			</div>
			<Button
				className="h-6.5 shrink-0 justify-start rounded-md p-1 text-sm text-(--text-tertiary) hover:text-(--accent-primary)"
				disabled={value.rows.length >= MAX_ROWS}
				leftIcon={<IconPlus className="-mr-1 size-3.5" />}
				padding="none"
				title={value.rows.length >= MAX_ROWS ? 'Максимум 20 строк' : undefined}
				variant="custom"
				onClick={addRow}
			>
				<span className="trim">Добавить валюту</span>
			</Button>
			<div className="flex shrink-0 items-end gap-1 border-t border-(--border-primary) px-1 pt-3">
				<span className="ml-auto shrink-0 font-medium text-(--text-tertiary)">Итого:</span>
				<div className="mr-1.5 ml-2 flex min-w-0 items-end">
					{formatted === null ? (
						<span className="truncate text-xs text-(--status-error)" title="Не удалось рассчитать итог">
							Не удалось рассчитать итог
						</span>
					) : (
						<span
							className="trim min-w-0 truncate pb-1.5 text-xl font-semibold text-(--accent-primary) tabular-nums"
							title={formatted}
						>
							{formatted}
						</span>
					)}
				</div>
				<div className="w-27 shrink-0">
					<Select
						align="start"
						className="h-7 text-sm"
						listPlacement="end"
						listWidth={240}
						options={currencyStore.currencyOptions}
						selectedLabel="value"
						value={value.target}
						variant="tone"
						onChange={(target) => onChange({ ...value, target })}
					/>
				</div>
				<Button
					centerIcon={<IconCopy className="size-4" />}
					className="mb-0.5 size-6 shrink-0 opacity-70 transition-opacity hover:opacity-100"
					padding="none"
					title="Копировать сумму"
					variant="icon"
					onClick={copyTotal}
				/>
			</div>
		</div>
	);
});
