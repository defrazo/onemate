import type { Dispatch, SetStateAction } from 'react';

import { IconChecked, IconCopy, IconTrash, IconUnchecked } from '@/shared/assets/icons';
import { useCopy, useDeviceType, useOrientation } from '@/shared/lib/hooks';
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
	const device = useDeviceType();
	const ortientation = useOrientation();
	const copy = useCopy();

	return (
		<div className="grid-rows-[auto, 1fr] grid grid-cols-3 items-center gap-2">
			<div className="col-span-3 min-h-6 text-center text-sm 2xl:text-base">{rangeState}</div>
			<Button
				active={hasWeekendInRange(range) && includeWeekends}
				className="w-full text-xs xl:text-sm"
				disabled={!hasWeekendInRange(range)}
				leftIcon={
					device === 'desktop' && ortientation === 'landscape' ? (
						includeWeekends ? (
							<IconChecked className="size-4" />
						) : (
							<IconUnchecked className="size-4" />
						)
					) : null
				}
				onClick={() => setIncludeWeekends((prev) => !prev)}
			>
				Выходные
			</Button>
			<Button
				className="w-full text-xs xl:text-sm"
				disabled={!range[0] || !range[1]}
				leftIcon={device === 'desktop' && ortientation === 'landscape' ? <IconCopy className="size-4" /> : null}
				onClick={() => copy(rangeState, 'Период скопирован!')}
			>
				Скопировать
			</Button>
			<Button
				className="w-full text-xs hover:enabled:bg-[var(--status-error)] xl:text-sm"
				disabled={!range[0]}
				leftIcon={
					device === 'desktop' && ortientation === 'landscape' ? <IconTrash className="size-4" /> : null
				}
				onClick={() => setRange([null, null])}
			>
				Сбросить
			</Button>
		</div>
	);
};
