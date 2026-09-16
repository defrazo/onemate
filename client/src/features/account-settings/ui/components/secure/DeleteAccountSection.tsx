import { useNavigate } from 'react-router-dom';

import { useStore } from '@/app/providers';
import { Button, ConfirmDialog } from '@/shared/ui';

export const DeleteAccountSection = () => {
	const navigate = useNavigate();

	const { modalStore, notifyStore, userStore } = useStore();

	const handleDelete = () => {
		modalStore.setModal(
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
					} catch {
						notifyStore.setNotice('Произошла ошибка при удалении аккаунта', 'error');
					}
				}}
			/>
		);
	};

	return (
		<section className="flex flex-col gap-2 select-none">
			<div className="flex flex-col gap-2 text-sm">
				<p className="text-(--color-primary)">
					После удаления аккаунт можно восстановить в течение{' '}
					<span className="font-semibold text-(--status-warning)">30 дней</span>.
				</p>
				<p className="text-(--color-secondary) opacity-70">
					Затем аккаунт и связанные с ним данные будут удалены без возможности восстановления. После этого вы
					сможете зарегистрироваться снова с тем же адресом электронной почты.
				</p>
			</div>
			<Button
				className="mx-auto h-10 rounded-xl bg-(--warning-default) text-(--accent-text) opacity-50 transition-all duration-300 hover:bg-(--warning-hover) hover:opacity-100"
				variant="custom"
				onClick={handleDelete}
			>
				Удалить аккаунт
			</Button>
		</section>
	);
};
