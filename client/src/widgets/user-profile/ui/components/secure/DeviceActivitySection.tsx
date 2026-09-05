import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import { IconDesktop, IconPhone } from '@/shared/assets/icons';
import { fullDate } from '@/shared/lib/utils';
import { Button, Divider, PreloaderMini, Tooltip } from '@/shared/ui';

export const DeviceActivitySection = observer(() => {
	const { deviceActivityStore: store, notifyStore } = useStore();

	const handleClearActivity = async (): Promise<void> => {
		if (store.activityLog.length === 0) {
			notifyStore.setNotice('История активности пуста', 'info');
			return;
		}

		try {
			await store.deleteLogAuth();
			notifyStore.setNotice('История активности очищена!', 'success');
		} catch {
			notifyStore.setNotice('Что-то пошло не так', 'error');
		}
	};

	return (
		<section className="flex min-h-40 flex-col gap-4 text-sm lg:flex-row">
			<div className="flex flex-1 flex-col">
				<h3 className="text-(--color-secondary) opacity-70 select-none">Текущее устройство:</h3>
				{!store.isReady ? (
					<PreloaderMini />
				) : (
					<div className="flex gap-2">
						{store.isMobile ? (
							<IconPhone className="size-30 text-(--color-disabled)" />
						) : (
							<IconDesktop className="size-30 text-(--color-disabled)" />
						)}
						<div className="flex flex-1 flex-col justify-evenly">
							<span className="font-semibold text-(--accent-default)">{store.browser}</span>
							<div className="flex flex-col">
								Местоположение:
								<Tooltip content={store.region}>
									<span className="text-(--accent-default)">{store.city}</span>
								</Tooltip>
							</div>
							<div className="flex gap-2">
								IP-адрес:
								<span className="text-(--accent-default)">{store.ip}</span>
							</div>
						</div>
					</div>
				)}
			</div>
			<div className="h-px w-full bg-(--border-color) md:h-auto md:w-px md:self-stretch" />
			<div className="flex max-h-40 flex-1 flex-col">
				<div className="flex items-center justify-between">
					<h3 className="text-(--color-secondary) opacity-70 select-none">История активности:</h3>
					<Button
						className="py-0.5 text-sm text-(--color-secondary) opacity-70 hover:text-(--status-error)"
						size="custom"
						variant="custom"
						onClick={handleClearActivity}
					>
						Очистить
					</Button>
				</div>
				{!store.isReady ? (
					<PreloaderMini />
				) : (
					<div className="hide-scrollbar flex flex-1 flex-col overflow-y-auto overscroll-contain pr-1 select-none">
						{store.activityLog.length === 0 && (
							<span className="flex h-full items-center justify-center text-(--color-disabled)">
								История пуста
							</span>
						)}
						{store.activityLog.map(
							({ id, city, region, browser, is_mobile, ip_address, created_at }, idx) => (
								<div key={id} className="snap-start">
									<div className="flex gap-2">
										<div className="flex size-5 items-center justify-center rounded-full bg-(--accent-default)/12 text-center text-xs text-(--accent-default)">
											{idx + 1}
										</div>
										{is_mobile ? (
											<IconPhone className="size-15 py-1 text-(--color-disabled)" />
										) : (
											<IconDesktop className="size-15 text-(--color-disabled)" />
										)}
										<div className="flex flex-1 flex-col">
											<div className="flex gap-2">
												<span className="font-semibold text-(--accent-default)">{browser}</span>
												<span className="text-(--color-disabled)">
													({fullDate(created_at)})
												</span>
											</div>
											<div className="flex gap-2">
												IP-адрес:<span className="text-(--accent-default)"> {ip_address}</span>
											</div>
											<Tooltip content={region}>
												<span className="text-(--accent-default)">{city}</span>
											</Tooltip>
										</div>
									</div>
									{idx < store.activityLog.length - 1 && <Divider className="mr-2" margY="sm" />}
								</div>
							)
						)}
					</div>
				)}
			</div>
		</section>
	);
});
