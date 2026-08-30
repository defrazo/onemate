import { isSameDay, isToday } from 'date-fns';

import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui';

import { generateCalendarDays, getDateFromDay, isInRange } from '../lib';
import type { DateRange } from '../model';

const WEEKDAYS_RU_SHORT = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'] as const;

interface CalendarGridProps {
	currentDate: Date;
	range: DateRange;
	handleDayClick: (day: number) => void;
}

export const CalendarGrid = ({ currentDate, range, handleDayClick }: CalendarGridProps) => {
	const [start, end] = range;
	const calendarDays = generateCalendarDays(currentDate);

	const weeks: (number | null)[][] = [];
	for (let i = 0; i < calendarDays.length; i += 7) weeks.push(calendarDays.slice(i, i + 7));

	return (
		<div className="flex flex-1 flex-col justify-between gap-0.5">
			<div className="grid grid-cols-7 justify-items-center">
				{WEEKDAYS_RU_SHORT.map((day) => (
					<div key={day} className="flex items-center text-base">
						{day}
					</div>
				))}
			</div>
			{weeks.map((week, wIdx) => (
				<div key={wIdx} className="grid grid-cols-7 justify-items-center">
					{week.map((day, idx) => {
						if (!day) return <div key={idx} />;

						const date = getDateFromDay(currentDate, day);
						const today = isToday(date);
						const inRange = isInRange(date, range);

						return (
							<Button
								key={idx}
								className={cn(
									'aspect-square size-6 rounded-full border border-solid border-transparent p-1 font-mono leading-4',
									today && 'border-(--accent-default)',
									start && isSameDay(date, start) && 'border-(--accent-active)',
									end && isSameDay(date, end) && 'border-(--accent-active)',
									inRange && 'border-(--accent-active)'
								)}
								size="custom"
								variant="custom"
								onClick={() => handleDayClick(day)}
							>
								{day}
							</Button>
						);
					})}
				</div>
			))}
		</div>
	);
};
