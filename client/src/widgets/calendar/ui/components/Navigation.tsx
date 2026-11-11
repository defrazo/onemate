import { IconCalendarCheck, IconCalendarWeek, IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import { cn } from '@/shared/lib/utils';
import { Button, LoadingState, Tooltip } from '@/shared/ui';

import { formatMonthTitle } from '../../lib/calendar';

export const Navigation = observer(() => {
	const { calendarStore: store } = useStore();

	const productionActive = store.productionActive;

	const productionLabel =
		store.productionStatus === 'loading'
			? 'Отменить загрузку производственного календаря'
			: store.productionStatus === 'error'
				? 'Не удалось загрузить производственный календарь'
				: productionActive
					? 'Выключить производственный календарь РФ'
					: 'Включить производственный календарь РФ';

	return (
		<div className="relative flex h-8 min-w-0 shrink-0 items-center justify-center px-14">
			{store.productionFetching && (
				<span
					aria-label="Загрузка производственного календаря"
					className="pointer-events-none absolute top-1/2 right-1 z-10 -translate-y-1/2 rounded-full bg-(--bg-secondary)"
					role="status"
				>
					<LoadingState size="xs" />
				</span>
			)}
			<Button
				centerIcon={
					<IconChevronLeft className="size-5 transition-opacity group-hover:opacity-100 xl:size-4 xl:opacity-0" />
				}
				className="group mr-3 size-6 shrink-0 rounded-md"
				padding="none"
				title="Предыдущий месяц"
				variant="iconSurface"
				onClick={store.prevMonth}
			/>
			<Tooltip content="Текущий месяц">
				<Button
					aria-label="Перейти к текущему месяцу"
					className="trim mx-auto font-semibold hover:text-(--accent-primary-hover)"
					padding="none"
					variant="custom"
					onClick={store.goToCurrentMonth}
				>
					{formatMonthTitle(store.currentMonth)}
				</Button>
			</Tooltip>
			<Button
				centerIcon={
					<IconChevronRight className="size-5 transition-opacity group-hover:opacity-100 xl:size-4 xl:opacity-0" />
				}
				className="group ml-3 size-6 shrink-0 rounded-md"
				padding="none"
				title="Следующий месяц"
				variant="iconSurface"
				onClick={store.nextMonth}
			/>
			<Tooltip className="absolute top-1/2 right-8 -translate-y-1/2" content="Включить калькулятор дат">
				<Button
					active={store.isControlsOpen}
					centerIcon={<IconCalendarWeek className="size-4" />}
					className="size-6 rounded-md aria-pressed:bg-(--tone-strong) aria-pressed:text-(--accent-primary)"
					padding="none"
					title="Калькулятор дат"
					variant="iconSurface"
					onClick={store.toggleControls}
				/>
			</Tooltip>
			<Tooltip
				className="absolute top-1/2 right-0 -translate-y-1/2"
				content={
					<div>
						<p>{productionLabel}</p>
						{store.productionLimitation && <p>{store.productionLimitation}</p>}
					</div>
				}
			>
				<Button
					active={productionActive}
					aria-busy={store.productionStatus === 'loading'}
					aria-label={productionLabel}
					centerIcon={<IconCalendarCheck className="size-4" />}
					className={cn(
						'size-6 rounded-md aria-pressed:bg-(--tone-strong) aria-pressed:text-(--accent-secondary)',
						store.productionStatus === 'error' && 'text-(--status-error)/50'
					)}
					padding="none"
					title={productionLabel}
					variant="iconSurface"
					onClick={store.toggleProduction}
				/>
			</Tooltip>
		</div>
	);
});
