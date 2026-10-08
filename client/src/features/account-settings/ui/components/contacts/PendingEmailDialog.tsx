import { IconMailCheck, IconMailForward } from '@tabler/icons-react';

import { useStore } from '@/app/providers';
import { Button } from '@/shared/ui';

export const PendingEmailDialog = () => {
	const { modalStore, notifyStore, userStore } = useStore();

	const handleResend = async (): Promise<void> => {
		try {
			await userStore.resendPendingEmail();

			notifyStore.setNotice('Письмо отправлено повторно', 'success');
			modalStore.closeModal();
		} catch {
			notifyStore.setNotice('Что-то пошло не так', 'error');
		}
	};

	const handleCancel = async (): Promise<void> => {
		try {
			await userStore.cancelPendingEmail();

			notifyStore.setNotice('Смена e-mail отменена', 'success');
			modalStore.closeModal();
		} catch {
			notifyStore.setNotice('Что-то пошло не так', 'error');
		}
	};

	return (
		<div className="core-gap -mt-4 flex w-md flex-col">
			<div className="flex gap-2">
				<div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-(--accent-primary)/12">
					<IconMailCheck className="size-6 text-(--accent-primary)" />
				</div>
				<div className="flex h-full flex-col justify-between gap-0.5 select-none">
					<h2 className="-mt-0.5 text-lg font-semibold">Подтвердите смену e-mail</h2>
					<p className="trim text-sm text-(--text-secondary) opacity-60">
						Мы ждём подтверждения по ссылке из письма
					</p>
				</div>
			</div>
			<div className="core-gap flex">
				<div className="flex-1 rounded-lg bg-(--tone) px-3 py-1.5">
					<span className="text-xs text-(--text-secondary) opacity-55 select-none">Текущий e-mail</span>
					<div className="truncate text-sm">{userStore.email}</div>
				</div>
				<div className="flex-1 rounded-lg bg-(--accent-primary)/8 px-3 py-1.5 ring-1 ring-(--accent-primary)/20">
					<span className="text-xs text-(--text-secondary) opacity-55 select-none">Новый e-mail</span>
					<div className="truncate text-sm">{userStore.pendingEmail}</div>
				</div>
			</div>
			<div className="flex gap-2 rounded-lg bg-(--tone) px-3 py-2 select-none">
				<IconMailForward className="mt-0.5 size-4.5 shrink-0 text-(--accent-primary) opacity-50" />
				<p className="text-sm leading-tight text-(--text-secondary) opacity-70">
					Для завершения смены адреса перейдите по ссылке в письме, отправленном на текущую почту.
				</p>
			</div>
			<div className="flex h-7 justify-end gap-3">
				<Button variant="accent" onClick={handleResend}>
					Отправить повторно
				</Button>
				<Button variant="danger" onClick={handleCancel}>
					Отменить смену
				</Button>
			</div>
		</div>
	);
};
