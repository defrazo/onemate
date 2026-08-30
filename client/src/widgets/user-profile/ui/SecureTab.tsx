import { useState } from 'react';
import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import DeviceActivityOverview from '@/features/device-activity';
import { PasswordHint } from '@/features/user-auth';
import { useModalBack } from '@/shared/lib/hooks';
import { validatePasswords } from '@/shared/lib/validators';
import { Button, ConfirmDialog, Divider, Input } from '@/shared/ui';
import { MobileUserMenu } from '@/widgets/user-menu';

import { useProfile } from '../model';

export const SecureTab = observer(() => {
	const { userStore, modalStore, notifyStore } = useStore();

	const { device, formattedDate, navigate } = useProfile();

	useModalBack(<MobileUserMenu />);

	const [currentPassword, setCurrentPassword] = useState('');

	const [newPassword, setNewPassword] = useState('');

	const [passwordConfirmation, setPasswordConfirmation] = useState('');

	const [showHint, setShowHint] = useState(false);

	const [isPasswordValid, setIsPasswordValid] = useState(false);

	const [isSavingPassword, setIsSavingPassword] = useState(false);

	const hasPasswordDraft = currentPassword !== '' || newPassword !== '' || passwordConfirmation !== '';

	const clearPasswords = (): void => {
		setCurrentPassword('');
		setNewPassword('');
		setPasswordConfirmation('');
		setShowHint(false);
		setIsPasswordValid(false);
	};

	const handleSave = async (): Promise<void> => {
		if (isSavingPassword) return;

		try {
			setIsSavingPassword(true);

			await validatePasswords(newPassword, passwordConfirmation);

			await userStore.updatePassword(currentPassword, newPassword, passwordConfirmation);

			clearPasswords();

			notifyStore.setNotice('Пароль успешно обновлен!', 'success');
		} catch (error) {
			notifyStore.setNotice(error instanceof Error ? error.message : 'Проверьте введенные данные', 'error');
		} finally {
			setIsSavingPassword(false);
		}
	};

	const handleDelete = async (): Promise<void> => {
		const confirmed = await new Promise<boolean>((resolve) => {
			modalStore.setModal(
				<ConfirmDialog
					cancelLabel="Отмена"
					confirmLabel="Удалить"
					description="У вас будет 30 дней на его восстановление. По истечении этого срока данные будут безвозвратно удалены."
					title="Удалить аккаунт?"
					onConfirm={(ok) => {
						resolve(ok);
						modalStore.closeModal();
					}}
				/>
			);
		});

		if (!confirmed) return;

		try {
			await userStore.deleteAccount();

			notifyStore.setNotice('Аккаунт успешно удален', 'success');

			navigate('/');
		} catch (error) {
			notifyStore.setNotice(error instanceof Error ? error.message : 'Ошибка при удалении аккаунта', 'error');
		}
	};

	return (
		<div className="core-base flex cursor-default flex-col gap-4 rounded-xl pb-4 md:p-4 md:shadow-(--shadow)">
			<h1 className="core-header">Безопасность</h1>

			<div className="flex flex-col gap-2">
				<h2 className="text-xl font-bold select-none">Пароль</h2>

				<p className="text-xs text-(--color-secondary) opacity-70 md:text-sm">
					Ваш пароль был изменен {formattedDate}
				</p>

				<Input
					autoComplete="current-password"
					name="current-password"
					placeholder="Текущий пароль"
					type="password"
					value={currentPassword}
					variant="ghost"
					onChange={(e) => setCurrentPassword(e.target.value)}
				/>

				<div className="relative">
					<Input
						autoComplete="new-password"
						name="password"
						placeholder="Новый пароль"
						type="password"
						value={newPassword}
						variant="ghost"
						onBlur={() => setShowHint(false)}
						onChange={(e) => setNewPassword(e.target.value)}
						onFocus={() => setShowHint(true)}
					/>

					<PasswordHint password={newPassword} showHint={showHint} onValidityChange={setIsPasswordValid} />
				</div>

				<Input
					autoComplete="new-password"
					name="password-confirm"
					placeholder="Подтвердите новый пароль"
					type="password"
					value={passwordConfirmation}
					variant="ghost"
					onChange={(e) => setPasswordConfirmation(e.target.value)}
					onPaste={(e) => {
						e.preventDefault();

						notifyStore.setNotice('Подтвердите пароль, введя его вручную', 'error');
					}}
				/>

				<div className="mt-2 flex justify-center gap-2">
					<Button
						className="w-28"
						disabled={!isPasswordValid || !currentPassword || !newPassword || !passwordConfirmation}
						loading={isSavingPassword}
						variant="accent"
						onClick={handleSave}
					>
						Сохранить
					</Button>

					<Button
						disabled={!hasPasswordDraft}
						variant="warning"
						onClick={() =>
							device === 'mobile' ? modalStore.setModal(<MobileUserMenu />, 'sheet') : clearPasswords()
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

			<div className="core-card flex flex-col gap-2 border-2 border-solid border-(--warning-default) opacity-30 transition-opacity duration-300 select-none hover:opacity-100">
				<h2 className="mx-auto text-xl font-bold select-none">Удалить аккаунт</h2>

				<p className="text-justify text-sm">
					Вы можете удалить свой аккаунт. У вас будет <b>30 дней</b> на его восстановление. По истечении этого
					срока данные будут безвозвратно удалены, и вы сможете зарегистрироваться заново, используя тот же
					адрес электронной почты.
				</p>

				<Button
					className="mx-auto w-fit rounded-xl bg-(--warning-default) text-(--accent-text) transition-colors duration-300 hover:bg-(--warning-hover)"
					variant="custom"
					onClick={handleDelete}
				>
					Удалить мой аккаунт
				</Button>
			</div>
		</div>
	);
});
