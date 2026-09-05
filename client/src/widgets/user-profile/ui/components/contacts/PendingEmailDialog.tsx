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
		<div className="-mt-4 flex w-md flex-col gap-4">
			<div className="flex gap-2">
				<div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-(--accent-default)/12">
					<IconMailCheck className="size-5.5 text-(--accent-default)" />
				</div>
				<div className="flex h-full flex-col justify-between select-none">
					<h2 className="text-xl font-semibold">Подтвердите смену e-mail</h2>
					<p className="trim text-sm text-(--color-secondary) opacity-60">
						Мы ждём подтверждения по ссылке из письма
					</p>
				</div>
			</div>
			<div className="flex gap-4">
				<div className="flex-1 rounded-xl bg-white/[0.035] px-3 py-1.5">
					<span className="text-xs text-(--color-secondary) opacity-55 select-none">Текущий e-mail</span>
					<div className="truncate text-sm font-medium">{userStore.email}</div>
				</div>
				<div className="flex-1 rounded-xl bg-(--accent-default)/8 px-3 py-1.5 ring-1 ring-(--accent-default)/20">
					<span className="text-xs text-(--color-secondary) opacity-55 select-none">Новый e-mail</span>
					<div className="truncate text-sm font-medium">{userStore.pendingEmail}</div>
				</div>
			</div>
			<div className="flex gap-2 rounded-xl bg-white/2.5 px-3 py-2 select-none">
				<IconMailForward className="mt-0.5 size-4.5 shrink-0 text-(--accent-default) opacity-50" />
				<p className="text-sm leading-tight text-(--color-secondary) opacity-70">
					Для завершения смены адреса перейдите по ссылке в письме, отправленном на текущую почту.
				</p>
			</div>
			<div className="mx-auto flex h-8 gap-3">
				<Button variant="accent" onClick={handleResend}>
					Отправить повторно
				</Button>
				<Button variant="warning" onClick={handleCancel}>
					Отменить смену
				</Button>
			</div>
		</div>
	);
};
