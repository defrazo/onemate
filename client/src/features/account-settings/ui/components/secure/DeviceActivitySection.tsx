import {
	IconClock,
	IconCopy,
	IconDeviceDesktop,
	IconDeviceMobile,
	IconMapPin,
	IconPointFilled,
	IconServer,
} from '@tabler/icons-react';
import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import { useCopy } from '@/shared/lib/hooks';
import { fullDate } from '@/shared/lib/utils';
import { Button, Divider, LoadingState, NoContent, Tooltip } from '@/shared/ui';

export const DeviceActivitySection = observer(() => {
	const copy = useCopy();

	const { deviceActivityStore: store, notifyStore } = useStore();

	const handleCopySession = () => {
		const activity = store.currentActivity;
		if (!activity) return;

		const location = [activity.city, activity.region].filter(Boolean).join(', ');

		const text = [
			'Текущая сессия',
			'',
			`Устройство: ${activity.browser} · ${activity.is_mobile ? 'Мобильное устройство' : 'Компьютер'}`,
			`Местоположение: ${location}`,
			`IP-адрес: ${activity.ip_address}`,
			`Вход: ${fullDate(activity.created_at)}`,
		].join('\n');

		copy(text, 'Данные сессии скопированы');
	};

	const handleClearActivity = async (): Promise<void> => {
		if (store.activityLog.length === 0) {
			notifyStore.setNotice('История активности пуста', 'info');
			return;
		}

		try {
			await store.deleteLogAuth();
			notifyStore.setNotice('История активности очищена', 'success');
		} catch {
			notifyStore.setNotice('Что-то пошло не так', 'error');
		}
	};

	return (
		<section className="flex flex-col gap-4 lg:flex-row xl:gap-0">
			<div className="flex flex-col gap-2.5 select-none xl:w-[45%]">
				<h3 className="text-xs text-(--text-secondary)">Это устройство</h3>
				{!store.isReady ? (
					<LoadingState />
				) : (
					<div className="flex flex-col xl:min-w-0 xl:flex-1 xl:justify-between">
						<div className="flex items-center xl:gap-3">
							<div className="flex min-w-0 items-center gap-2">
								<div className="flex size-15 shrink-0 items-center justify-center rounded-xl bg-(--status-success-muted) text-(--status-success) xl:size-10">
									{store.isMobile ? (
										<IconDeviceMobile className="size-9 xl:size-5.5" />
									) : (
										<IconDeviceDesktop className="size-9 xl:size-5.5" />
									)}
								</div>
								<div className="flex min-w-0 flex-col">
									<div className="flex gap-2 xl:hidden">
										<span className="text-sm text-(--text-disabled)">Текущая сессия</span>
										<Button
											centerIcon={<IconCopy className="size-4" />}
											padding="none"
											type="button"
											variant="icon"
											onClick={handleCopySession}
										/>
									</div>
									<div className="flex items-center gap-1">
										<span className="text-sm font-semibold">{store.browser}</span>
										<IconPointFilled className="size-3 animate-pulse text-(--status-success)" />
									</div>
									<span className="hidden text-xs text-(--text-disabled) xl:block">
										Текущая сессия
									</span>
									<div className="flex gap-3 text-sm xl:hidden">
										<div className="flex min-w-0 items-center gap-1">
											<IconMapPin className="size-3.5 shrink-0" />
											<span className="truncate">{store.city}</span>
										</div>
										<div className="flex items-center gap-1 text-(--text-secondary)">
											<IconServer className="size-3.5 shrink-0" />
											<span className="font-mono">{store.ip}</span>
										</div>
									</div>
								</div>
							</div>
							<Button
								className="mr-4 hidden flex-1 text-xs active:scale-90 xl:block"
								padding="sm"
								type="button"
								variant="tone"
								onClick={handleCopySession}
							>
								Скопировать
							</Button>
						</div>
						<div className="hidden min-w-0 items-center justify-between pr-4 xl:flex">
							<div className="flex max-w-1/2 min-w-0 flex-col">
								<span className="text-xs text-(--text-disabled)">Местоположение</span>
								<Tooltip content={store.region}>
									<span className="truncate text-sm font-medium">{store.city}</span>
								</Tooltip>
							</div>
							<div className="flex flex-col">
								<span className="text-xs text-(--text-disabled)">IP-адрес</span>
								<span className="font-mono text-sm">{store.ip}</span>
							</div>
						</div>
					</div>
				)}
			</div>
			<Divider className="hidden xl:block" direction="Y" />
			<div className="group flex flex-1 flex-col gap-1 select-none xl:ml-2">
				<div className="flex items-center justify-between xl:ml-2">
					<h3 className="text-xs font-medium text-(--text-secondary)">История</h3>
					<Button
						className="text-xs text-(--text-secondary) transition-[color,opacity] group-hover:opacity-100 hover:text-(--danger) xl:opacity-0"
						padding="none"
						variant="custom"
						onClick={handleClearActivity}
					>
						Очистить
					</Button>
				</div>
				{!store.isReady ? (
					<LoadingState />
				) : (
					<div className="core-scrollbar max-h-23 overflow-y-auto overscroll-contain">
						<div className="flex flex-col gap-1">
							{store.activityLog.length === 0 && (
								<NoContent description="Записи появятся здесь" title="История пуста" />
							)}
							{store.activityLog.map(
								({ id, city, region, browser, is_mobile, ip_address, created_at }, idx) => (
									<div
										key={id}
										className="flex items-center gap-2 rounded-lg px-2 py-1 transition-colors hover:bg-(--tone)"
									>
										<span className="w-fit shrink-0 font-mono text-[10px] text-(--text-disabled)">
											{String(idx + 1).padStart(2, '0')}
										</span>
										<div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-(--tone)">
											{is_mobile ? (
												<IconDeviceMobile className="size-5 text-(--accent-primary)" />
											) : (
												<IconDeviceDesktop className="size-5 text-(--accent-primary)" />
											)}
										</div>
										<div className="grid min-w-0 flex-1 grid-cols-[minmax(0,1fr)_auto] gap-x-2">
											<span className="w-fit max-w-full truncate text-sm font-medium">
												{browser}
											</span>
											<div className="flex items-center gap-1 text-(--text-disabled)">
												<IconClock className="size-3 shrink-0" />
												<span className="text-xs">{fullDate(created_at)}</span>
											</div>
											<Tooltip content={region}>
												<span className="max-w-full truncate text-xs text-(--text-secondary)">
													{city}
												</span>
											</Tooltip>
											<div className="flex items-center gap-1 text-(--text-secondary)">
												<IconServer className="size-3 shrink-0" />
												<span className="font-mono text-xs text-(--text-secondary)">
													{ip_address}
												</span>
											</div>
										</div>
									</div>
								)
							)}
						</div>
					</div>
				)}
			</div>
		</section>
	);
});
