import { forwardRef, useState } from 'react';
import copy from 'copy-to-clipboard';
import {
	addMonths,
	differenceInCalendarDays,
	eachDayOfInterval,
	format,
	getDay,
	getDaysInMonth,
	isAfter,
	isBefore,
	isSameDay,
	isToday,
	isWeekend,
	isWithinInterval,
	startOfMonth,
	subMonths,
} from 'date-fns';
import { ru } from 'date-fns/locale';

import { IconChecked, IconCopy, IconTrash, IconUnchecked } from '@/shared/assets/icons';
import { cn } from '@/shared/lib/utils';
import { notifyStore } from '@/shared/stores';
import { Button } from '@/shared/ui';

interface CalendarWidgetProps {
	className?: string;
}

const CalendarWidget = forwardRef<HTMLDivElement, CalendarWidgetProps>((props, ref) => {
	const [currentDate, setCurrentDate] = useState(new Date());
	const [includeWeekends, setIncludeWeekends] = useState(true);
	const [startDate, setStartDate] = useState<Date | null>(null);
	const [endDate, setEndDate] = useState<Date | null>(null);
	const [isActive, setIsActive] = useState<boolean>(false);
	const startOfCurrentMonth = startOfMonth(currentDate);
	const startWeekday = (getDay(startOfCurrentMonth) + 6) % 7; // понедельник = 0
	const daysInMonth = getDaysInMonth(currentDate);

	const rawDaysArray = Array.from({ length: 42 }, (_, i) => {
		const day = i - startWeekday + 1;
		return day > 0 && day <= daysInMonth ? day : null;
	});

	// Проверяем, вся ли последняя неделя пустая (все 7 элементов === null)
	const lastWeek = rawDaysArray.slice(-7);
	const isLastWeekEmpty = lastWeek.every((day) => day === null);

	// Если да — обрезаем массив на 7 элементов
	const daysArray = isLastWeekEmpty ? rawDaysArray.slice(0, -7) : rawDaysArray;
	const handlePrev = () => setCurrentDate(subMonths(currentDate, 1));
	const handleNext = () => setCurrentDate(addMonths(currentDate, 1));

	// Форматирование месяца
	function formatMonthTitle(date: Date): string {
		return new Intl.DateTimeFormat('ru-RU', {
			month: 'long',
			year: 'numeric',
		}).format(date);
	}

	// Вычисления для диапазона
	const rangeWithWeekend =
		startDate && endDate
			? includeWeekends
				? differenceInCalendarDays(endDate, startDate) + 1
				: eachDayOfInterval({ start: startDate, end: endDate }).filter((d) => !isWeekend(d)).length
			: 0;

	const formattedRange =
		startDate && endDate
			? `С ${format(startDate, 'd MMMM', { locale: ru })} по ${format(endDate, 'd MMMM', { locale: ru })}`
			: '';

	const handleCopy = () => {
		if (startDate && endDate) {
			let text = `${formattedRange}: ${rangeWithWeekend} дней`;

			if (hasWeekendInRange() && includeWeekends) {
				text += ' (вкл. выходные)';
			} else if (hasWeekendInRange() && !includeWeekends) {
				text += ' (без выходных)';
			}

			copy(text);

			notifyStore.setSuccess('✅ Диапазон скопирован!');
		}
	};

	const handleDayClick = (day: number) => {
		const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);

		// Если нет начальной даты или диапазон завершён — начинаем заново
		if (!startDate || (startDate && endDate)) {
			setStartDate(clickedDate);
			setEndDate(null);
		} else if (startDate && !endDate) {
			// Второй клик — создаём диапазон в любом порядке
			if (isSameDay(clickedDate, startDate)) {
				setStartDate(clickedDate);
				setEndDate(null);
			} else {
				const earlier = isBefore(clickedDate, startDate) ? clickedDate : startDate;
				const later = isAfter(clickedDate, startDate) ? clickedDate : startDate;
				setStartDate(earlier);
				setEndDate(later);
			}
		}
	};

	const isInRange = (date: Date) => {
		return startDate && endDate && isWithinInterval(date, { start: startDate, end: endDate });
	};

	// Функция для проверки, есть ли выходные в диапазоне
	const hasWeekendInRange = () => {
		if (!startDate || !endDate) return false;
		return eachDayOfInterval({ start: startDate, end: endDate }).some((date) => isWeekend(date));
	};

	const handleIncludeWeekendsChange = () => {
		// Меняем состояние чекбокса
		setIncludeWeekends(!includeWeekends);
		setIsActive(!isActive);

		// Пересчитываем диапазон, если даты выбраны
		if (startDate && endDate) {
			const newRangeWithWeekend = !includeWeekends
				? differenceInCalendarDays(endDate, startDate) + 1
				: eachDayOfInterval({ start: startDate, end: endDate }).filter((d) => !isWeekend(d)).length;
			console.log('New Range with Weekends: ', newRangeWithWeekend);
		}
	};

	const canToggleWeekends = Boolean(startDate && endDate && hasWeekendInRange());

	return (
		<div
			ref={ref}
			{...props}
			className={cn(
				'core-card core-base flex flex-1 flex-col gap-2 shadow-[var(--shadow)] select-none',
				props.className
			)}
		>
			<span className="core-header">Календарь</span>
			<div className="flex h-full w-full flex-col justify-between gap-2">
				<div className="core-border flex h-full flex-col rounded-xl bg-transparent py-2">
					<div className="flex items-center justify-center">
						<Button size="sm" variant="custom" onClick={handlePrev}>
							❮
						</Button>
						<div className="mx-4 cursor-default text-base font-semibold capitalize md:text-lg">
							{formatMonthTitle(currentDate)}
						</div>
						<Button size="sm" variant="custom" onClick={handleNext}>
							❯
						</Button>
					</div>
					<div className="grid h-full grid-cols-7 justify-items-center gap-0.5">
						{['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((day) => (
							<div key={day} className="flex items-center">
								{day}
							</div>
						))}

						{daysArray.map((day, idx) => {
							if (!day) return <div key={idx}></div>;

							const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
							const selected =
								(startDate && isSameDay(date, startDate)) || (endDate && isSameDay(date, endDate));
							const inRange = isInRange(date);
							const today = isToday(date);

							return (
								<Button
									key={idx}
									className={cn(
										'aspect-square rounded-full bg-transparent text-sm text-[var(--color-primary)] transition-all md:p-1',
										inRange && 'bg-[var(--accent-default)] text-[var(--accent-text)]',
										today &&
											!selected &&
											'bg-[var(--accent-default)] text-[var(--accent-text)] ring-inset',
										today && inRange && 'ring-1 ring-[var(--status-info)]',
										startDate &&
											isSameDay(date, startDate) &&
											'bg-[var(--accent-default)] text-[var(--accent-text)]',
										endDate &&
											isSameDay(date, endDate) &&
											'bg-[var(--accent-default)] text-[var(--accent-text)]'
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
				</div>
				<div className="grid grid-cols-3 grid-rows-2 items-center gap-2">
					<div className="col-span-3">
						<div className="text-center">
							{startDate && endDate ? (
								<>
									{formattedRange}:<strong> {rangeWithWeekend} дней </strong>
									{hasWeekendInRange() && (includeWeekends ? '(вкл. выходные)' : '(без выходных)')}
								</>
							) : (
								'Пожалуйста, задайте диапазон дат'
							)}
						</div>
					</div>
					<Button
						active={canToggleWeekends && includeWeekends}
						className="core-elements w-full rounded-xl text-xs"
						disabled={!canToggleWeekends}
						leftIcon={!isActive ? <IconChecked className="size-4" /> : <IconUnchecked className="size-4" />}
						onClick={handleIncludeWeekendsChange}
					>
						{'Выходные'}
					</Button>
					<Button
						className="core-elements w-full text-xs"
						disabled={startDate && endDate ? false : true}
						leftIcon={<IconCopy className="size-4" />}
						onClick={handleCopy}
					>
						Скопировать
					</Button>
					<Button
						className="core-elements w-full text-xs enabled:hover:bg-[var(--status-error)]"
						disabled={startDate ? false : true}
						leftIcon={<IconTrash className="size-4" />}
						onClick={() => {
							setStartDate(null);
							setEndDate(null);
						}}
					>
						Сбросить
					</Button>
				</div>
			</div>
		</div>
	);
});

export default CalendarWidget;
