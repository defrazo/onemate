import { useNavigate } from 'react-router-dom';

import { useStore } from '@/app/providers';
import { useResponsive } from '@/shared/lib/hooks';
import { Button, ConfirmDialog } from '@/shared/ui';

export const DeleteAccountSection = () => {
	const navigate = useNavigate();
	const { isMobile } = useResponsive();

	const { modalStore, notifyStore, userStore } = useStore();

	const handleDelete = () => {
		const dialog = (
			<ConfirmDialog
				confirmLabel="Удалить"
				description="У вас будет 30 дней на восстановление аккаунта. После этого данные будут удалены безвозвратно."
				title="Удалить аккаунт?"
				variant="danger"
				onCancel={() => modalStore.closeModal()}
				onConfirm={async () => {
					try {
						await userStore.deleteAccount();

						modalStore.closeModal();
						notifyStore.setNotice('Аккаунт успешно удалён', 'success');
						navigate('/');
					} catch (error) {
						notifyStore.setNotice(error instanceof Error ? error.message : 'Что-то пошло не так', 'error');
					}
				}}
			/>
		);

		isMobile ? modalStore.pushModal(dialog) : modalStore.setModal(dialog);
	};

	return (
		<section className="flex flex-col gap-2 select-none">
			<div className="flex flex-col gap-2 text-sm">
				<p>
					После удаления аккаунт можно восстановить в течение{' '}
					<span className="font-semibold text-(--status-warning)">30 дней</span>.
				</p>
				<p className="text-(--text-secondary) opacity-70">
					Затем аккаунт и связанные с ним данные будут удалены без возможности восстановления. После этого вы
					сможете зарегистрироваться снова с тем же адресом электронной почты.
				</p>
			</div>
			<Button className="mx-auto h-8" variant="danger" onClick={handleDelete}>
				Удалить аккаунт
			</Button>
		</section>
	);
};
