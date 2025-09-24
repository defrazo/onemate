import { useState } from 'react';
import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import DeviceActivityOverview from '@/features/device-activity';
import { PasswordHint } from '@/features/user-auth';
import { useModalBack } from '@/shared/lib/hooks';
import { validatePasswords } from '@/shared/lib/validators';
import { Button, ConfirmDialog, Divider, Input, LoadFallback } from '@/shared/ui';
import { MobileUserMenu } from '@/widgets/user-menu';

import { useProfile } from '../model';

export const SecureTab = observer(() => {
	const { accountStore, modalStore, notifyStore, profileStore, userStore } = useStore();
	const { device, formattedDate, navigate } = useProfile();
	useModalBack(<MobileUserMenu />);

	const [showHint, setShowHint] = useState<boolean>(false);
	const [isPasswordValid, setIsPasswordValid] = useState<boolean>(false);

	const handleSave = async () => {
		try {
			await validatePasswords(userStore.passwords[0], userStore.passwords[1]);
			await accountStore.updatePassword(userStore.passwords[0]);

			notifyStore.setNotice('Пароль успешно обновлен!', 'success');
		} catch (error: any) {
			notifyStore.setNotice(error.message || 'Проверьте введенные данные', 'error');
		}
	};

	const handleDelete = async () => {
		const title = 'Удалить аккаунт?';
		const description =
			'У вас будет 30 дней на его восстановление. По истечении этого срока данные будут безвозвратно удалены.';
		const confirmed = await new Promise<boolean>((resolve) => {
			modalStore.setModal(
				<ConfirmDialog
					cancelLabel="Отмена"
					confirmLabel="Удалить"
					description={description}
					title={title}
					onConfirm={(ok) => {
						resolve(ok);
						modalStore.closeModal();
					}}
				/>
			);
		});

		if (!confirmed) return;

		try {
			await accountStore.deleteAccount();

			notifyStore.setNotice('Аккаунт успешно удалeн', 'success');
			navigate('/');
		} catch (error: any) {
			notifyStore.setNotice(error.message || 'Ошибка при удалении аккаунта', 'error');
		}
	};

	if (!profileStore.isReady) return <LoadFallback />;

	return (
		<div className="core-base flex cursor-default flex-col gap-4 rounded-xl px-2 pb-4 md:p-4">
			<h1 className="core-header">Безопасность</h1>
			<div className="flex flex-col gap-2">
				<h2 className="text-xl font-bold select-none">Пароль</h2>
				<h3 className="text-xs text-[var(--color-disabled)] md:text-sm">
					Ваш пароль был изменен {formattedDate}
				</h3>
				<div className="relative">
					<Input
						placeholder="Новый пароль"
						value={userStore.passwords[0]}
						variant="ghost"
						onBlur={(e) => {
							setShowHint(false);
							userStore.setPasswords(0, e.target.value.trim());
						}}
						onChange={(e) => userStore.setPasswords(0, e.target.value)}
						onFocus={() => setShowHint(true)}
					/>
					<PasswordHint
						password={userStore.passwords[0]}
						showHint={showHint}
						onValidityChange={(value) => setIsPasswordValid(value)}
					/>
				</div>
				<Input
					placeholder="Подтвердите новый пароль"
					value={userStore.passwords[1]}
					variant="ghost"
					onBlur={(e) => userStore.setPasswords(1, e.target.value.trim())}
					onChange={(e) => userStore.setPasswords(1, e.target.value)}
					onPaste={(e) => {
						e.preventDefault();
						notifyStore.setNotice('Подтвердите пароль, введя его вручную', 'error');
					}}
				/>
				<div className="mt-2 flex justify-center gap-2">
					<Button
						className="w-28"
						disabled={!isPasswordValid}
						loading={profileStore.isLoading}
						variant="accent"
						onClick={handleSave}
					>
						Сохранить
					</Button>
					<Button
						className="rounded-xl hover:bg-[var(--status-error)]"
						variant="custom"
						onClick={() =>
							device === 'mobile'
								? modalStore.setModal(<MobileUserMenu />, 'sheet')
								: navigate('/account/profile?tab=overview')
						}
					>
						Отменить
					</Button>
				</div>
			</div>
			<Divider />
			<div className="flex flex-col gap-2">
				<h2 className="text-xl font-bold select-none">Устройства и активность</h2>
				<DeviceActivityOverview />
			</div>
			<Divider />
			<div className="core-card flex flex-col gap-2 border border-solid border-[#871919] bg-[var(--bg-warning)] select-none">
				<h2 className="mr-auto text-xl font-bold select-none">Удалить аккаунт</h2>
				<p className="text-justify text-sm">
					Вы можете удалить свой аккаунт. У вас будет <b>30 дней</b> на его восстановление. По истечении этого
					срока данные будут безвозвратно удалены, и вы сможете зарегистрироваться заново, используя тот же
					адрес электронной почты.
				</p>
				<Button
					className="mx-auto w-fit rounded-xl bg-[var(--warning-default)] text-[var(--accent-text)] transition-colors duration-300 hover:bg-[var(--warning-hover)]"
					variant="custom"
					onClick={handleDelete}
				>
					Удалить мой аккаунт
				</Button>
			</div>
		</div>
	);
});
