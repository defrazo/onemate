import { observer } from 'mobx-react-lite';

import { IconDesktop, IconPhone } from '@/shared/assets/icons';
import { fullDate } from '@/shared/lib/utils';
import { Divider, LoadFallback, Tooltip } from '@/shared/ui';

import { deviceActivityStore } from '../model';

const DeviceActivityOverview = () => {
	const store = deviceActivityStore;

	if (!store.deviceInfo || store.activityLog === null) return <LoadFallback />;

	return (
		<div className="flex w-full gap-2 text-sm">
			<div className="flex flex-1 flex-col">
				<h3 className="text-[var(--color-disabled)]">Текущее устройство:</h3>
				<div className="flex h-full items-center gap-2">
					{store.isMobile ? (
						<IconPhone className="size-30 text-[var(--color-disabled)]" />
					) : (
						<IconDesktop className="size-30 text-[var(--color-disabled)]" />
					)}
					<div className="flex h-full flex-1 flex-col justify-evenly">
						<span className="font-semibold text-[var(--accent-default)]">{store.browser}</span>
						<div className="flex flex-col">
							Местоположение:
							<Tooltip className="flex items-center" text={store.region}>
								<span className="text-[var(--accent-default)]">{store.city}</span>
							</Tooltip>
						</div>
						<div className="flex gap-2">
							IP-адрес:
							<span className="text-[var(--accent-default)]">{store.ip}</span>
						</div>
					</div>
				</div>
			</div>
			<div className="h-full w-px bg-[var(--border-color)]" />
			<div className="flex flex-1 flex-col">
				<h3 className="mb-1 text-[var(--color-disabled)]">История активности:</h3>
				<div className="flex flex-1 snap-y snap-mandatory flex-col overflow-y-auto overscroll-contain pr-1">
					{store.activityLog.length === 0 && (
						<span className="text-[var(--color-disabled)]">История пуста</span>
					)}
					{store.activityLog.map((log, idx) => (
						<div key={log.id} className="snap-start">
							<div className="flex gap-2">
								<div className="flex w-4 justify-center text-xs text-[var(--color-disabled)]">
									{idx + 1}
								</div>
								{log.is_mobile ? (
									<IconPhone className="size-15 text-[var(--color-disabled)]" />
								) : (
									<IconDesktop className="size-15 text-[var(--color-disabled)]" />
								)}
								<div className="flex flex-1 flex-col">
									<div className="flex gap-2">
										<span className="font-semibold text-[var(--accent-default)]">
											{log.browser}
										</span>
										<span className="text-[var(--color-disabled)]">
											({fullDate(log.created_at)})
										</span>
									</div>
									<div className="flex gap-2">
										IP-адрес:<span className="text-[var(--accent-default)]"> {log.ip_address}</span>
									</div>
									<Tooltip className="flex items-center" text={log.region}>
										<span className="text-[var(--accent-default)]">{log.city}</span>
									</Tooltip>
								</div>
							</div>
							{idx < store.activityLog.length - 1 && <Divider margY="sm" />}
						</div>
					))}
				</div>
			</div>
		</div>
	);
};

export default observer(DeviceActivityOverview);
