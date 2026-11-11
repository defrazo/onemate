import { useId } from 'react';
import { IconCopy } from '@tabler/icons-react';
import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import { useCopy } from '@/shared/lib/hooks';
import { Button, Checkbox, Input, SegmentedControl } from '@/shared/ui';

import { MAX_DAY_COUNT } from '../../lib/calculation';
import { formatCalendarDate } from '../../lib/format';
import type { CalendarMode } from '../../model/types';

const modes: { value: CalendarMode; label: string }[] = [
	{ value: 'period', label: 'Период' },
	{ value: 'after', label: 'Через N' },
	{ value: 'until', label: 'До даты' },
];

export const Controls = observer(() => {
	const copy = useCopy();

	const { calendarStore: store } = useStore();

	const calculation = store.calculation;
	const result = store.result;
	const countError = store.countError;
	const afterEnd = store.afterEnd;

	const countId = useId();
	const errorId = `${countId}-error`;

	const hint =
		store.mode === 'period'
			? `Выберите дату ${store.range[0] ? 'конца' : 'начала'} периода`
			: store.mode === 'until'
				? 'Выберите целевую дату'
				: 'Введите количество дней';

	return (
		<div className="flex min-w-0 flex-col text-sm">
			<SegmentedControl className="mb-1.5 w-full" options={modes} value={store.mode} onChange={store.setMode} />
			<div aria-live="polite" className="flex min-h-7 min-w-0 items-center justify-center gap-2">
				{store.mode === 'after' ? (
					<>
						<span className="shrink-0 text-sm text-(--text-secondary)">
							{formatCalendarDate(store.afterStart, store.today)} +
						</span>
						<Input
							aria-describedby={countError ? errorId : undefined}
							aria-label="Количество дней"
							className="number-no-spinner h-6 w-11 shrink-0 px-2 text-center text-sm"
							error={countError}
							fullWidth={false}
							id={countId}
							inputMode="numeric"
							max={MAX_DAY_COUNT}
							min={0}
							padding="none"
							step={1}
							type="number"
							value={store.dayCount}
							variant="ghost"
							onChange={(event) => store.setDayCount(event.target.value)}
						/>
						<span className="shrink-0 text-sm text-(--text-secondary)">дн.</span>
						{countError ? (
							<span className="text-xs text-(--status-error)" id={errorId} role="alert">
								Целое число: 0–{MAX_DAY_COUNT}
							</span>
						) : store.productionLimitation ? (
							<span className="text-xs text-(--status-error)" role="alert">
								{store.productionLimitation}
							</span>
						) : afterEnd && store.dayCount !== '' ? (
							<span className="min-w-0 text-sm text-(--text-secondary)">
								={' '}
								<span className="text-(--text-primary)">
									{formatCalendarDate(afterEnd, store.today)}
								</span>
							</span>
						) : null}
					</>
				) : calculation ? (
					<span className="min-w-0 text-center text-sm text-(--text-secondary)">
						{calculation.prefix && (
							<>
								{calculation.prefix}
								{store.mode === 'period' ? ' – ' : ' '}
							</>
						)}
						<span className="font-medium text-(--text-primary)">{calculation.value}</span>
						{calculation.suffix && ` ${calculation.suffix}`}
					</span>
				) : (
					<span className="min-w-0 text-center text-sm text-(--text-secondary)">
						{store.productionLimitation ?? hint}
					</span>
				)}
				{result && (
					<Button
						centerIcon={<IconCopy className="size-4" />}
						className="shrink-0"
						padding="none"
						title="Скопировать результат"
						variant="icon"
						onClick={() => copy(result, 'Результат скопирован')}
					/>
				)}
			</div>
			<div className="flex min-w-0 items-center justify-between gap-2">
				<Checkbox
					checked={store.includeWeekends}
					className="text-xs text-(--text-secondary)"
					label="Учитывать выходные"
					size="sm"
					onChange={store.setIncludeWeekends}
				/>
				<Button
					className="text-xs text-(--text-secondary) hover:text-(--danger)"
					padding="none"
					variant="custom"
					onClick={store.resetSelection}
				>
					{store.hasSelection ? 'Сбросить' : 'Отмена'}
				</Button>
			</div>
		</div>
	);
});
