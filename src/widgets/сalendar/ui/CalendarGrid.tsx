import { isSameDay, isToday } from 'date-fns';

import { WEEKDAYS_RU_SHORT } from '@/shared/lib/constants';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui';

import { generateCalendarDays, getDateFromDay, isInRange } from '../lib';
import type { DateRange } from '../model';

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
									'aspect-square rounded-full border border-solid border-transparent p-1 font-mono leading-4',
									today && 'border-[var(--accent-default)]',
									start && isSameDay(date, start) && 'border-[var(--accent-active)]',
									end && isSameDay(date, end) && 'border-[var(--accent-active)]',
									inRange && 'border-[var(--accent-active)]'
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
