import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import { IconDesktop, IconPhone } from '@/shared/assets/icons';
import { fullDate } from '@/shared/lib/utils';
import { Button, Divider, ErrorFallback, Tooltip } from '@/shared/ui';

const DeviceActivityOverview = () => {
	const { deviceActivityStore: store, notifyStore } = useStore();

	if (!store.isReady) return <ErrorFallback onRetry={() => store.restart()} />;

	const handleClearActivity = () => {
		try {
			store.deleteLogAuth();
			notifyStore.setNotice('История активности очищена!', 'success');
		} catch (error: any) {
			notifyStore.setNotice(error.message || 'Произошла ошибка при очистке истории', 'error');
		}
	};

	return (
		<div className="flex w-full flex-col gap-4 text-sm lg:flex-row">
			<div className="flex flex-col">
				<h3 className="text-(--color-secondary) opacity-70">Текущее устройство:</h3>
				<div className="flex h-full items-center gap-2">
					{store.isMobile ? (
						<IconPhone className="size-30 text-(--color-disabled)" />
					) : (
						<IconDesktop className="size-30 text-(--color-disabled)" />
					)}
					<div className="flex h-full flex-1 flex-col justify-evenly">
						<span className="font-semibold text-(--accent-default)">{store.browser}</span>
						<div className="flex flex-col">
							Местоположение:
							<Tooltip className="flex items-center" content={store.region}>
								<span className="text-(--accent-default)">{store.city}</span>
							</Tooltip>
						</div>
						<div className="flex gap-2">
							IP-адрес:
							<span className="text-(--accent-default)">{store.ip}</span>
						</div>
					</div>
				</div>
			</div>
			<div className="h-px w-full bg-(--border-color) md:h-auto md:w-px md:self-stretch" />
			<div className="flex max-h-40 flex-1 flex-col">
				<div className="mb-1 flex items-center justify-between gap-2">
					<h3 className="text-(--color-secondary) opacity-70">История активности:</h3>
					<Button
						className="py-0.5 text-sm text-(--color-secondary) opacity-70 hover:text-(--status-error)"
						disabled={store.activityLog.length === 0}
						size="custom"
						variant="custom"
						onClick={handleClearActivity}
					>
						Очистить
					</Button>
				</div>
				<div className="hide-scrollbar flex flex-1 flex-col overflow-y-auto overscroll-contain pr-1">
					{store.activityLog.length === 0 && (
						<span className="flex h-full items-center justify-center text-(--color-disabled)">
							История пуста
						</span>
					)}
					{store.activityLog.map(({ id, city, region, browser, is_mobile, ip_address, created_at }, idx) => (
						<div key={id} className="snap-start">
							<div className="flex gap-2">
								<div className="flex w-4 justify-center text-xs text-(--color-disabled)">{idx + 1}</div>
								{is_mobile ? (
									<IconPhone className="size-15 py-1 text-(--color-disabled)" />
								) : (
									<IconDesktop className="size-15 text-(--color-disabled)" />
								)}
								<div className="flex flex-1 flex-col">
									<div className="flex gap-2">
										<span className="font-semibold text-(--accent-default)">{browser}</span>
										<span className="text-(--color-disabled)">({fullDate(created_at)})</span>
									</div>
									<div className="flex gap-2">
										IP-адрес:<span className="text-(--accent-default)"> {ip_address}</span>
									</div>
									<Tooltip className="flex items-center" content={region}>
										<span className="text-(--accent-default)">{city}</span>
									</Tooltip>
								</div>
							</div>
							{idx < store.activityLog.length - 1 && <Divider className="mr-2" margY="sm" />}
						</div>
					))}
				</div>
			</div>
		</div>
	);
};

export default observer(DeviceActivityOverview);
