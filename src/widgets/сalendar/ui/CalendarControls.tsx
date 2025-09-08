import type { Dispatch, SetStateAction } from 'react';

import { IconChecked, IconCopy, IconTrash, IconUnchecked } from '@/shared/assets/icons';
import { useCopy } from '@/shared/lib/hooks';
import { Button } from '@/shared/ui';

import { hasWeekendInRange } from '../lib';
import type { DateRange } from '../model';

interface CalendarControlsProps {
	range: DateRange;
	rangeState: string;
	includeWeekends: boolean;
	setIncludeWeekends: Dispatch<SetStateAction<boolean>>;
	setRange: Dispatch<SetStateAction<DateRange>>;
}

export const CalendarControls = ({
	range,
	rangeState,
	includeWeekends,
	setIncludeWeekends,
	setRange,
}: CalendarControlsProps) => {
	const copy = useCopy();

	return (
		<div className="grid-rows-[auto, 1fr] grid grid-cols-3 items-center gap-2">
			<div className="col-span-3 text-center">{rangeState}</div>
			<Button
				active={hasWeekendInRange(range) && includeWeekends}
				className="w-full text-sm"
				disabled={!hasWeekendInRange(range)}
				leftIcon={includeWeekends ? <IconChecked className="size-4" /> : <IconUnchecked className="size-4" />}
				onClick={() => setIncludeWeekends((prev) => !prev)}
			>
				Выходные
			</Button>
			<Button
				className="w-full text-sm"
				disabled={!range[0] || !range[1]}
				leftIcon={<IconCopy className="size-4" />}
				onClick={() => copy(rangeState, 'Диапазон скопирован!')}
			>
				Скопировать
			</Button>
			<Button
				className="w-full text-sm hover:enabled:bg-[var(--status-error)]"
				disabled={!range[0]}
				leftIcon={<IconTrash className="size-4" />}
				onClick={() => setRange([null, null])}
			>
				Сбросить
			</Button>
		</div>
	);
};
