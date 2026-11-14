import { useEffect } from 'react';
import {
	autoUpdate,
	flip,
	offset,
	shift,
	useClick,
	useDismiss,
	useFloating,
	useInteractions,
	useRole,
} from '@floating-ui/react';
import { IconGauge } from '@tabler/icons-react';
import { observer } from 'mobx-react-lite';

import { Button, LoadingState } from '@/shared/ui';

import type { AssistantStore } from '../../model/assistant.store';
import { LIMITS } from '../../model/constants';

const formatNumber = (value: number) => value.toLocaleString('ru-RU');

export const Limits = observer(({ store }: { store: AssistantStore }) => {
	useEffect(() => () => store.setLimitsOpen(false), [store]);

	const { refs, floatingStyles, context } = useFloating({
		open: store.limitsOpen,
		onOpenChange: store.setLimitsOpen,
		placement: 'bottom-end',
		strategy: 'fixed',
		whileElementsMounted: autoUpdate,
		middleware: [offset(6), flip({ padding: 8 }), shift({ padding: 8 })],
	});

	const { getReferenceProps, getFloatingProps } = useInteractions([
		useClick(context),
		useDismiss(context),
		useRole(context, { role: 'dialog' }),
	]);

	const data = store.limits;
	const today = new Date().toISOString().slice(0, 10);

	const metrics = [
		{
			label: 'Запросы',
			periodStart: data?.daily_requests_local?.period_start,
			used: data?.daily_requests_local?.used ?? null,
			limit: LIMITS.requests,
			partial: false,
		},
		{
			label: 'Токены',
			periodStart: data?.daily_tokens.period_start,
			used: data?.daily_tokens.used ?? null,
			limit: LIMITS.tokens,
			partial: (data?.daily_tokens.unmeasured_attempts ?? 0) > 0,
		},
	].map(({ label, periodStart, ...metric }) => {
		const date = new Date(periodStart ?? '');
		const valid = Number.isFinite(date.getTime());
		const current = valid && date.toISOString().slice(0, 10) === today;
		const period = valid
			? date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', timeZone: 'UTC' })
			: null;

		return {
			...metric,
			label: current ? `${label} сегодня` : period ? `${label} за ${period}` : label,
			outdated: !current,
		};
	});

	return (
		<>
			<Button
				{...getReferenceProps()}
				ref={refs.setReference}
				aria-label="Лимиты Mate AI"
				centerIcon={<IconGauge className="size-4" />}
				className="size-7 rounded-md"
				padding="none"
				variant="iconSurface"
			/>
			{store.limitsOpen && (
				<div
					{...getFloatingProps()}
					ref={refs.setFloating}
					aria-label="Лимиты Mate AI"
					className="z-100 flex max-h-[calc(100dvh-1rem)] w-68 max-w-[calc(100vw-1rem)] flex-col gap-2 overflow-y-auto rounded-lg border border-(--border-primary) bg-(--bg-secondary) p-3 text-sm text-(--text-primary) shadow-lg"
					style={floatingStyles}
				>
					<div className="flex w-fit min-w-0 items-center gap-2">
						<span className="font-semibold select-none">Лимиты Mate AI</span>
						{!data && store.limitsLoading && <LoadingState className="mr-auto" size="xs" />}
					</div>
					{metrics.map(({ label, used, limit, partial }) => {
						const formattedUsed = used === null ? '–' : `${partial ? '≥ ' : ''}${formatNumber(used)}`;
						const progress = used === null ? 0 : Math.min(100, Math.max(0, (used / limit) * 100));

						return (
							<div key={label}>
								<div className="mb-1.5 flex items-center justify-between gap-2 text-xs">
									<span>{label}</span>
									<span className="shrink-0 text-(--text-secondary) tabular-nums">
										{formattedUsed} / {formatNumber(limit)}
									</span>
								</div>
								<div
									aria-label={label}
									aria-valuemax={limit}
									aria-valuemin={0}
									aria-valuenow={used === null ? undefined : Math.min(limit, Math.max(0, used))}
									aria-valuetext={
										used === null
											? 'Нет данных'
											: `${partial ? 'Не менее ' : ''}${formatNumber(used)} / ${formatNumber(limit)}`
									}
									className="h-1.5 overflow-hidden rounded-full bg-(--tone-strong-hover)"
									role="progressbar"
								>
									<div
										className="h-full rounded-full bg-(--accent-primary)"
										style={{ width: `${progress}%` }}
									/>
								</div>
							</div>
						);
					})}
					{data && (store.limitsError || metrics.some(({ outdated }) => outdated)) && (
						<span className="text-xs text-(--text-disabled)" role="status">
							{store.limitsError
								? 'Не удалось обновить · данные могут быть устаревшими'
								: store.limitsLoading
									? 'Обновляем данные…'
									: 'Данные за предыдущий период'}
						</span>
					)}
					{!data && !store.limitsLoading && store.limitsError && (
						<span className="text-xs text-(--status-error)/70" role="alert">
							Не удалось обновить
						</span>
					)}
				</div>
			)}
		</>
	);
});
