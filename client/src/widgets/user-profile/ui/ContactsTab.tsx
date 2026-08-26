import { useState } from 'react';
import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import { IconTrash, IconWarning } from '@/shared/assets/icons';
import { useModalBack } from '@/shared/lib/hooks';
import { cn } from '@/shared/lib/utils';
import { validateEmail, validatePhone } from '@/shared/lib/validators';
import { Button, Input, LoadFallback, PhoneInput } from '@/shared/ui';
import { MobileUserMenu } from '@/widgets/user-menu';

import { useProfile } from '../model';

export const ContactsTab = observer(() => {
	const { accountStore, modalStore, notifyStore, profileStore: store, userStore } = useStore();
	const { device } = useProfile();
	useModalBack(<MobileUserMenu />);

	const [currentPassword, setCurrentPassword] = useState('');
	const isEmailPending = userStore.isEmailPending;
	const mainEmailChanged = store.mainEmail.trim().toLowerCase() !== userStore.email.trim().toLowerCase();

	const handlePendingEmail = () => {
		modalStore.setModal(
			<div className="flex flex-col gap-4 p-4">
				<h2 className="text-xl font-semibold">Смена e-mail ожидает подтверждения</h2>
				<div className="flex flex-col gap-1 text-sm">
					<p>
						Текущий e-mail:
						<b className="ml-1">{userStore.email}</b>
					</p>
					<p>
						Новый e-mail:
						<b className="ml-1">{userStore.pendingEmail}</b>
					</p>
				</div>
				<p className="text-sm text-(--color-secondary)">
					Для завершения смены адреса подтвердите действие по ссылке, отправленной на текущую почту.
				</p>
				<Button
					variant="accent"
					onClick={async () => {
						try {
							await accountStore.resendPendingEmail();

							notifyStore.setNotice('Письмо отправлено повторно', 'success');

							modalStore.closeModal();
						} catch (error: any) {
							notifyStore.setNotice(error.message || 'Не удалось отправить письмо', 'error');
						}
					}}
				>
					Отправить повторно
				</Button>
				<Button
					onClick={async () => {
						try {
							await accountStore.cancelPendingEmail();

							store.updateField('mainEmail', userStore.email);

							notifyStore.setNotice('Смена email отменена', 'success');

							modalStore.closeModal();
						} catch (error: any) {
							notifyStore.setNotice(error.message || 'Не удалось прервать смену email', 'error');
						}
					}}
				>
					Отменить смену email
				</Button>
			</div>
		);
	};

	const handleSave = async () => {
		try {
			for (const phone of store.phone) {
				if (phone.trim()) await validatePhone(phone.trim());
			}

			if (!store.mainEmail.trim()) {
				notifyStore.setNotice('Основной e-mail обязателен', 'info');
				return;
			}

			await validateEmail(store.mainEmail.trim());

			for (const email of store.email) {
				if (email.trim()) await validateEmail(email.trim());
			}

			if (mainEmailChanged && !isEmailPending) {
				if (!currentPassword) {
					notifyStore.setNotice('Введите текущий пароль для смены e-mail', 'info');
					return;
				}

				await accountStore.updateEmail(store.mainEmail.trim().toLowerCase(), currentPassword);

				store.updateField('mainEmail', userStore.email);

				setCurrentPassword('');
			}

			await store.saveChanges();

			notifyStore.setNotice(
				mainEmailChanged
					? 'Данные сохранены. Подтвердите смену e-mail по ссылке из письма'
					: 'Данные успешно сохранены',
				'success'
			);
		} catch (error: any) {
			notifyStore.setNotice(error.message || 'Проверьте введенные данные', 'error');
		}
	};

	if (!store.isReady) return <LoadFallback />;

	return (
		<div className="core-base flex cursor-default flex-col gap-4 rounded-xl pb-4 select-none md:p-4 md:shadow-(--shadow)">
			<h1 className="core-header">Контактные данные</h1>
			<div className="flex flex-col items-center gap-2">
				<h2 className="mr-auto text-xl font-semibold">Телефон</h2>
				<div className="flex w-full flex-col gap-2">
					{store.phone.map((phone, idx) => {
						const isLast = idx === store.phone.length - 1;
						const isEmpty = phone.trim() === '';
						const canRemove = !(isLast && isEmpty);

						return (
							<div key={idx} className="flex gap-2">
								<PhoneInput
									className={cn(!canRemove && 'mr-8')}
									name={`phone-${idx}`}
									value={phone}
									onChange={(value: string) => store.updateArrayField('phone', idx, value)}
								/>
								{canRemove && (
									<Button
										centerIcon={<IconTrash className="size-6" />}
										className="hover:text-(--status-error)"
										size="custom"
										title="Удалить"
										variant="custom"
										onClick={() => store.removeField('phone', idx)}
									/>
								)}
							</div>
						);
					})}
				</div>
			</div>
			<div className="flex flex-col items-center gap-2">
				<h2 className="mr-auto text-xl font-semibold">Почта</h2>
				<div className="flex w-full flex-col gap-1">
					<label className="text-(--color-secondary) opacity-70" htmlFor="mainEmail">
						Основная почта
					</label>
					<div className="flex gap-2">
						<Input
							disabled={isEmailPending}
							error={!store.mainEmail}
							id="mainEmail"
							name="email-main"
							placeholder="Введите e-mail"
							rightIcon={
								isEmailPending ? (
									<IconWarning
										className="mr-1.5 size-5 animate-pulse cursor-pointer text-(--status-warning)"
										onClick={handlePendingEmail}
									/>
								) : (
									!store.mainEmail && (
										<IconWarning className="mr-1.5 size-5 animate-pulse text-(--status-error)" />
									)
								)
							}
							type="email"
							value={isEmailPending ? userStore.pendingEmail : store.mainEmail}
							variant="ghost"
							onBlur={(e) => store.updateField('mainEmail', e.target.value.trim())}
							onChange={(e) => store.updateField('mainEmail', e.target.value)}
						/>

						<Button
							centerIcon={<IconTrash className="size-6" />}
							className="hover:text-(--status-error)"
							disabled={isEmailPending}
							size="custom"
							title="Очистить"
							variant="custom"
							onClick={() => store.updateField('mainEmail', '')}
						/>
					</div>

					{isEmailPending && (
						<p className="text-xs text-(--color-secondary)">
							Ожидает подтверждения. Текущий e-mail: {userStore.email}
						</p>
					)}

					{mainEmailChanged && !isEmailPending && (
						<Input
							autoComplete="current-password"
							className="mt-2"
							name="email-current-password"
							placeholder="Текущий пароль для смены e-mail"
							type="password"
							value={currentPassword}
							variant="ghost"
							onChange={(e) => setCurrentPassword(e.target.value)}
						/>
					)}
				</div>
				<div className="flex w-full flex-col gap-1">
					<span className="text-(--color-secondary) opacity-70">Резервная почта</span>
					<div className="flex w-full flex-col gap-2">
						{store.email.map((email, idx) => {
							const isLast = idx === store.email.length - 1;
							const isEmpty = email.trim() === '';
							const canRemove = !(isLast && isEmpty);

							return (
								<div key={idx} className="flex gap-2">
									<Input
										autoComplete="new-password"
										className={cn(isLast && 'mr-8')}
										name={`email-${idx}`}
										placeholder="Введите e-mail"
										value={email}
										variant="ghost"
										onBlur={(e) => store.updateArrayField('email', idx, e.target.value.trim())}
										onChange={(e) => store.updateArrayField('email', idx, e.target.value)}
									/>
									{canRemove && (
										<Button
											centerIcon={<IconTrash className="size-6" />}
											className="hover:text-(--status-error)"
											size="custom"
											title="Удалить"
											variant="custom"
											onClick={() => store.removeField('email', idx)}
										/>
									)}
								</div>
							);
						})}
					</div>
				</div>
				<div className="mt-2 flex gap-4">
					<Button
						className="w-28"
						disabled={!store.mainEmail || !store.isDirty}
						loading={store.isLoading}
						variant="accent"
						onClick={handleSave}
					>
						Сохранить
					</Button>
					<Button
						disabled={device !== 'mobile' && !store.isDirty}
						variant="warning"
						onClick={() =>
							device === 'mobile' ? modalStore.setModal(<MobileUserMenu />, 'sheet') : store.loadDraft()
						}
					>
						Отменить
					</Button>
				</div>
			</div>
		</div>
	);
});
