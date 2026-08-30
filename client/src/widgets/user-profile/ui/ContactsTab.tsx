import { useEffect, useMemo, useState } from 'react';
import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import { UserProfile } from '@/entities/user-profile';
import { IconTrash, IconWarning } from '@/shared/assets/icons';
import { useModalBack } from '@/shared/lib/hooks';
import { cn } from '@/shared/lib/utils';
import { validateEmail, validatePhone } from '@/shared/lib/validators';
import { Button, Input, LoadFallback, PhoneInput } from '@/shared/ui';
import { MobileUserMenu } from '@/widgets/user-menu';

import { useProfile } from '../model';

const normalizeArray = (values: string[]): string[] => values.map((value) => value.trim()).filter(Boolean);

const withEmptySlot = (values: string[], max: number): string[] => {
	const result = [...values];

	if (result.length < max && (result.length === 0 || result[result.length - 1].trim() !== '')) {
		result.push('');
	}

	return result.length ? result : [''];
};

const arraysEqual = (left: string[], right: string[]): boolean =>
	JSON.stringify(normalizeArray(left)) === JSON.stringify(normalizeArray(right));

export const ContactsTab = observer(() => {
	const { modalStore, notifyStore, userProfileStore, userStore } = useStore();

	const { device } = useProfile();
	useModalBack(<MobileUserMenu />);

	const [phones, setPhones] = useState<string[]>(['']);
	const [emails, setEmails] = useState<string[]>(['']);
	const [mainEmail, setMainEmail] = useState('');
	const [currentPassword, setCurrentPassword] = useState('');
	const [isSaving, setIsSaving] = useState(false);

	const loadDraft = (): void => {
		setPhones(withEmptySlot(userProfileStore.phone, 4));

		setEmails(withEmptySlot(userProfileStore.email, 3));

		setMainEmail(userStore.email);
		setCurrentPassword('');
	};

	useEffect(() => {
		if (!userProfileStore.isReady) return;

		loadDraft();
	}, [userProfileStore.isReady, userStore.id]);

	const isEmailPending = userStore.isEmailPending;

	const mainEmailChanged = mainEmail.trim().toLowerCase() !== userStore.email.trim().toLowerCase();

	const isDirty = useMemo(
		() =>
			mainEmailChanged ||
			!arraysEqual(phones, userProfileStore.phone) ||
			!arraysEqual(emails, userProfileStore.email),
		[mainEmail, phones, emails, userStore.email, userProfileStore.phone, userProfileStore.email]
	);

	const updateArrayField = (type: 'phone' | 'email', index: number, value: string): void => {
		const max = type === 'phone' ? 4 : 3;
		const source = type === 'phone' ? phones : emails;

		const updated = [...source];
		updated[index] = value;

		const next = withEmptySlot(updated, max);

		if (type === 'phone') {
			setPhones(next);
		} else {
			setEmails(next);
		}
	};

	const removeField = (type: 'phone' | 'email', index: number): void => {
		const max = type === 'phone' ? 4 : 3;
		const source = type === 'phone' ? phones : emails;

		const updated = source.filter((_, currentIndex) => currentIndex !== index);

		const next = withEmptySlot(updated, max);

		if (type === 'phone') {
			setPhones(next);
		} else {
			setEmails(next);
		}
	};

	const handlePendingEmail = (): void => {
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
							await userStore.resendPendingEmail();

							notifyStore.setNotice('Письмо отправлено повторно', 'success');

							modalStore.closeModal();
						} catch (error) {
							notifyStore.setNotice(
								error instanceof Error ? error.message : 'Не удалось отправить письмо',
								'error'
							);
						}
					}}
				>
					Отправить повторно
				</Button>

				<Button
					onClick={async () => {
						try {
							await userStore.cancelPendingEmail();

							setMainEmail(userStore.email);

							notifyStore.setNotice('Смена email отменена', 'success');

							modalStore.closeModal();
						} catch (error) {
							notifyStore.setNotice(
								error instanceof Error ? error.message : 'Не удалось прервать смену email',
								'error'
							);
						}
					}}
				>
					Отменить смену email
				</Button>
			</div>
		);
	};

	const handleSave = async (): Promise<void> => {
		if (isSaving || !isDirty) return;

		try {
			setIsSaving(true);

			for (const phone of phones) {
				const value = phone.trim();

				if (value) {
					await validatePhone(value);
				}
			}

			const normalizedMainEmail = mainEmail.trim().toLowerCase();

			if (!normalizedMainEmail) {
				notifyStore.setNotice('Основной e-mail обязателен', 'info');

				return;
			}

			await validateEmail(normalizedMainEmail);

			for (const email of emails) {
				const value = email.trim();

				if (value) {
					await validateEmail(value);
				}
			}

			if (mainEmailChanged && !isEmailPending) {
				if (!currentPassword) {
					notifyStore.setNotice('Введите текущий пароль для смены e-mail', 'info');

					return;
				}

				await userStore.updateEmail(normalizedMainEmail, currentPassword);

				setMainEmail(userStore.email);
				setCurrentPassword('');
			}

			const profile: UserProfile = {
				first_name: userProfileStore.firstName,
				last_name: userProfileStore.lastName,
				birth_date: userProfileStore.birthDate,
				gender: userProfileStore.gender,
				phones: normalizeArray(phones),
				additional_emails: normalizeArray(emails),
			};

			await userProfileStore.updateProfile(profile);

			loadDraft();

			notifyStore.setNotice(
				mainEmailChanged
					? 'Данные сохранены. Подтвердите смену e-mail по ссылке из письма'
					: 'Данные успешно сохранены',
				'success'
			);
		} catch (error) {
			notifyStore.setNotice(error instanceof Error ? error.message : 'Проверьте введенные данные', 'error');
		} finally {
			setIsSaving(false);
		}
	};

	if (!userProfileStore.isReady) {
		return <LoadFallback />;
	}

	return (
		<div className="core-base flex cursor-default flex-col gap-4 rounded-xl pb-4 select-none md:p-4 md:shadow-(--shadow)">
			<h1 className="core-header">Контактные данные</h1>
			<div className="flex flex-col items-center gap-2">
				<h2 className="mr-auto text-xl font-semibold">Телефон</h2>
				<div className="flex w-full flex-col gap-2">
					{phones.map((phone, idx) => {
						const isLast = idx === phones.length - 1;
						const isEmpty = phone.trim() === '';
						const canRemove = !(isLast && isEmpty);

						return (
							<div key={idx} className="flex gap-2">
								<PhoneInput
									className={cn(!canRemove && 'mr-8')}
									name={`phone-${idx}`}
									value={phone}
									onChange={(value: string) => updateArrayField('phone', idx, value)}
								/>
								{canRemove && (
									<Button
										centerIcon={<IconTrash className="size-6" />}
										className="hover:text-(--status-error)"
										size="custom"
										title="Удалить"
										variant="custom"
										onClick={() => removeField('phone', idx)}
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
							error={!mainEmail}
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
									!mainEmail && (
										<IconWarning className="mr-1.5 size-5 animate-pulse text-(--status-error)" />
									)
								)
							}
							type="email"
							value={isEmailPending ? userStore.pendingEmail : mainEmail}
							variant="ghost"
							onBlur={(e) => setMainEmail(e.target.value.trim())}
							onChange={(e) => setMainEmail(e.target.value)}
						/>

						<Button
							centerIcon={<IconTrash className="size-6" />}
							className="hover:text-(--status-error)"
							disabled={isEmailPending}
							size="custom"
							title="Очистить"
							variant="custom"
							onClick={() => setMainEmail('')}
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
						{emails.map((email, idx) => {
							const isLast = idx === emails.length - 1;
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
										onBlur={(e) => updateArrayField('email', idx, e.target.value.trim())}
										onChange={(e) => updateArrayField('email', idx, e.target.value)}
									/>
									{canRemove && (
										<Button
											centerIcon={<IconTrash className="size-6" />}
											className="hover:text-(--status-error)"
											size="custom"
											title="Удалить"
											variant="custom"
											onClick={() => removeField('email', idx)}
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
						disabled={!mainEmail || !isDirty}
						loading={isSaving}
						variant="accent"
						onClick={handleSave}
					>
						Сохранить
					</Button>

					<Button
						disabled={device !== 'mobile' && !isDirty}
						variant="warning"
						onClick={() =>
							device === 'mobile' ? modalStore.setModal(<MobileUserMenu />, 'sheet') : loadDraft()
						}
					>
						Отменить
					</Button>
				</div>
			</div>
		</div>
	);
});
