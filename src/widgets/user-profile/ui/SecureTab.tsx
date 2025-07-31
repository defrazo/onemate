import { useState } from 'react';
import { observer } from 'mobx-react-lite';

import { userStore } from '@/entities/user';
import DeviceActivityOverview from '@/features/device-activity';
import { authService, PasswordHint } from '@/features/user-auth';
import { validatePasswords } from '@/shared/lib/validators';
import { modalStore, notifyStore } from '@/shared/stores';
import { Button, Divider, Input, LoadFallback } from '@/shared/ui';

import { profileStore, useProfile } from '../model';

export const SecureTab = observer(() => {
	const { isMobile, formattedDate, navigate } = useProfile();
	const [showHint, setShowHint] = useState<boolean>(false);
	const [isPasswordValid, setIsPasswordValid] = useState<boolean>(false);

	const handleSave = async () => {
		try {
			await validatePasswords(userStore.passwords[0], userStore.passwords[1]);
			await userStore.updatePassword(userStore.passwords[0]);
			userStore.clearPasswords();
			notifyStore.setNotice('Пароль успешно обновлен!', 'success');
		} catch {
			notifyStore.setNotice('Проверьте введенные данные', 'error');
		}
	};

	const handleDelete = async () => {
		const confirmed = window.confirm('Вы уверены, что хотите удалить аккаунт?');

		if (!confirmed) return;

		try {
			await authService.deleteAccount();
			await authService.logout();
			notifyStore.setNotice('Аккаунт успешно удалeн', 'success');
			navigate('/');
		} catch {
			notifyStore.setNotice('Ошибка при удалении аккаунта', 'error');
		}
	};

	if (!profileStore.isProfileUploaded) return <LoadFallback />;

	return (
		<div className="flex cursor-default flex-col gap-4">
			<div className="core-card core-base flex flex-col gap-4">
				<h1 className="core-header">Безопасность</h1>
				<div className="flex flex-col gap-2">
					<h2 className="text-xl font-bold select-none">Пароль</h2>
					<h3 className="text-sm text-[var(--color-disabled)]">Ваш пароль был изменен {formattedDate}</h3>
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
						<Button disabled={!isPasswordValid} variant="accent" onClick={handleSave}>
							Сохранить
						</Button>
						<Button
							className="rounded-xl hover:bg-[var(--status-error)]"
							variant="custom"
							onClick={() =>
								isMobile ? modalStore.modal?.back?.() : navigate('/account/profile?tab=overview')
							}
						>
							Отменить
						</Button>
					</div>
				</div>
				<Divider />
				<div className="flex flex-col gap-2">
					<h2 className="text-xl font-bold select-none">Устройства и активность</h2>
					<div className="flex h-[10rem]">
						<DeviceActivityOverview />
					</div>
				</div>
			</div>
			<div className="core-card flex flex-col gap-2 border-1 border-[#871919] bg-[#1d1412] select-none">
				<h2 className="mr-auto text-xl font-bold select-none">Удалить аккаунт</h2>
				<p className="text-justify text-sm">
					Вы можете удалить свой аккаунт. У вас будет <b>30 дней</b> на его восстановление. По истечении этого
					срока данные будут безвозвратно удалены, и вы сможете зарегистрироваться заново, используя тот же
					адрес электронной почты.
				</p>
				<Button
					className="mx-auto w-fit rounded-xl bg-[#871919] text-[var(--color-primary)] transition-colors duration-300 hover:bg-[#a10404]"
					variant="custom"
					onClick={handleDelete}
				>
					Удалить мой аккаунт
				</Button>
			</div>
		</div>
	);
});
