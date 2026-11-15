import { useEffect } from 'react';
import { IconInfoCircle } from '@tabler/icons-react';
import { toast } from 'sonner';
import { registerSW } from 'virtual:pwa-register';

import { Button, ConfirmDialog } from '@/shared/ui';

import { useStore } from '../providers';

const TOAST_ID = 'onemate-pwa-update';
const UPDATE_CHECK_INTERVAL = 5 * 60_000;
const ACTIVATION_TIMEOUT = 15_000;

let registration: ServiceWorkerRegistration | undefined;
let showUpdate: () => void = () => {};
let lastUpdateCheck = 0;
let deferredUntil = 0;
let checking = false;
let applying = false;

const updateSW = import.meta.env.PROD
	? registerSW({
			onRegisteredSW(_url, value) {
				registration = value;
				lastUpdateCheck = Date.now();

				if (value?.waiting) showUpdate();
			},
			onNeedRefresh() {
				showUpdate();
			},
			onNeedReload() {},
		})
	: undefined;

const checkForUpdate = async () => {
	if (
		document.visibilityState !== 'visible' ||
		!registration ||
		checking ||
		applying ||
		Date.now() - lastUpdateCheck < UPDATE_CHECK_INTERVAL
	) {
		return;
	}

	checking = true;
	lastUpdateCheck = Date.now();

	try {
		if (registration.waiting) showUpdate();

		await registration.update();

		if (registration.waiting) showUpdate();
	} catch {
	} finally {
		checking = false;
	}
};

const applyUpdate = async () => {
	if (applying) return;

	const worker = registration?.waiting;

	if (!worker || !updateSW) {
		toast.error('Обновление больше недоступно. Попробуйте позже');
		return;
	}

	applying = true;

	try {
		await new Promise<void>((resolve, reject) => {
			let settled = false;

			const cleanup = () => {
				worker.removeEventListener('statechange', onStateChange);
				clearTimeout(timeout);
			};

			const finish = (error?: Error) => {
				if (settled) return;

				settled = true;
				cleanup();

				if (error) reject(error);
				else resolve();
			};

			const onStateChange = () => {
				if (worker.state === 'activated') finish();
				else if (worker.state === 'redundant') finish(new Error('Service Worker became redundant'));
			};

			const timeout = setTimeout(() => {
				finish(new Error('Service Worker activation timed out'));
			}, ACTIVATION_TIMEOUT);

			worker.addEventListener('statechange', onStateChange);

			void Promise.resolve()
				.then(() => updateSW(true))
				.then(onStateChange)
				.catch((error: unknown) => {
					finish(error instanceof Error ? error : new Error('Update failed'));
				});

			onStateChange();
		});

		window.location.reload();
	} catch {
		applying = false;
		toast.error('Не удалось установить обновление. Попробуйте позже');
	}
};

export const PwaUpdatePrompt = () => {
	const { modalStore, notifyStore } = useStore();

	useEffect(() => {
		const closeModal = () => modalStore.closeModal();

		const confirmUpdate = () => {
			if (modalStore.modal) {
				notifyStore.setNotice('Перед обновлением завершите работу в открытом окне', 'info');
				return;
			}

			modalStore.setModal(
				<ConfirmDialog
					confirmLabel="Обновить"
					description="Приложение будет перезагружено. Несохранённые изменения могут быть потеряны"
					title="Обновить OneMate?"
					onCancel={closeModal}
					onConfirm={() => {
						closeModal();
						void applyUpdate();
					}}
				/>
			);

			toast.dismiss(TOAST_ID);
		};

		const deferUpdate = () => {
			deferredUntil = Date.now() + UPDATE_CHECK_INTERVAL;
			toast.dismiss(TOAST_ID);
		};

		showUpdate = () => {
			if (applying || Date.now() < deferredUntil || document.visibilityState !== 'visible') return;

			toast.custom(
				() => (
					<div className="core-surface flex w-full flex-col gap-2.5 bg-(--bg-secondary) px-3 py-2.5 shadow-[0_12px_32px_rgba(0,0,0,0.28)] select-none">
						<div className="flex items-center gap-2.5">
							<div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-(--status-info-muted) text-(--status-info)">
								<IconInfoCircle className="size-4.5" />
							</div>
							<div className="min-w-0 flex-1">
								<p className="text-sm text-(--text-primary)">Доступно обновление OneMate</p>
								<p className="mt-0.5 text-xs leading-relaxed text-(--text-secondary)">
									Новая версия приложения готова к установке
								</p>
							</div>
						</div>
						<div className="flex gap-2">
							<Button
								className="min-h-11 min-w-0 flex-1 text-sm"
								padding="sm"
								variant="tone"
								onClick={deferUpdate}
							>
								Позже
							</Button>
							<Button
								className="min-h-11 min-w-0 flex-1 text-sm"
								padding="sm"
								variant="accent"
								onClick={confirmUpdate}
							>
								Обновить
							</Button>
						</div>
					</div>
				),
				{
					id: TOAST_ID,
					duration: Infinity,
					position: 'top-center',
					style: {
						marginTop: 'env(safe-area-inset-top, 0px)',
						maxWidth:
							'calc(100vw - 2rem - env(safe-area-inset-left, 0px) - env(safe-area-inset-right, 0px))',
					},
				}
			);
		};

		const onVisibilityChange = () => {
			if (registration?.waiting) showUpdate();
			void checkForUpdate();
		};

		document.addEventListener('visibilitychange', onVisibilityChange);

		if (registration?.waiting) showUpdate();

		return () => {
			document.removeEventListener('visibilitychange', onVisibilityChange);
			showUpdate = () => {};
			toast.dismiss(TOAST_ID);
		};
	}, [modalStore, notifyStore]);

	return null;
};
