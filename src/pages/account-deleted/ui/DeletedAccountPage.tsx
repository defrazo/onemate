import { observer } from 'mobx-react-lite';

import { userStore } from '@/entities/user';
import { Logo } from '@/shared/assets/images';
import { useRemainingTime } from '@/shared/lib/hooks';
import { Button } from '@/shared/ui';

import { useDeletedAccount } from '../model';

const DeletedAccountPage = observer(() => {
	const { handleRestore, handleExit } = useDeletedAccount();
	const { days } = useRemainingTime(userStore.deletedAt);

	return (
		<div className="mx-4 flex min-h-screen flex-col items-center justify-center gap-2">
			<div className="core-card core-base flex flex-col items-center gap-2 md:w-lg">
				<div className="flex flex-col items-center gap-2 select-none">
					<img alt="Логотип" className="size-20" src={Logo} />
					<h1 className="core-header">Аккаунт OneMate удален</h1>
				</div>
				<p className="mb-1 text-center text-sm">
					Ранее вы удалили аккаунт <strong>{userStore.email}</strong>. <br /> На данный момент доступ к
					системе заблокирован.
				</p>
				<Button className="h-10 w-full" variant="accent" onClick={handleRestore}>
					Восстановить аккаунт
				</Button>
				<div className="flex w-full items-center select-none">
					<div className="grow border-t border-[var(--border-color)]" />
					<span className="px-4 text-sm">ИЛИ</span>
					<div className="grow border-t border-[var(--border-color)]" />
				</div>
				<Button className="h-10 w-full" onClick={handleExit}>
					Выйти из аккаунта
				</Button>
			</div>
			<div className="text-center text-sm text-[var(--color-secondary)] md:w-lg">
				<p>
					Аккаунт будет безвозвратно удален через <span className="font-bold">{days} </span> дней
				</p>
			</div>
		</div>
	);
});

export default DeletedAccountPage;
