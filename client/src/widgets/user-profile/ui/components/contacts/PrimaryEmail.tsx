import { useState } from 'react';
import { IconMailFilled } from '@tabler/icons-react';
import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import { InputLabel, PasswordInput, useAuth } from '@/features/user-auth';
import { IconWarning } from '@/shared/assets/icons';
import { useDeviceType } from '@/shared/lib/hooks';
import { Collapse, Input } from '@/shared/ui';
import { MobileUserMenu } from '@/widgets/user-menu';

import { FormActions } from '..';
import { PendingEmailDialog } from '.';

export const PrimaryEmail = observer(() => {
	const device = useDeviceType();

	const { modalStore, notifyStore, userStore } = useStore();
	const { checkEmail, checkPassword } = useAuth();

	const [isLoading, setIsLoading] = useState(false);
	const [mainEmail, setMainEmail] = useState(userStore.email);
	const [password, setPassword] = useState('');

	const isEmailPending = userStore.isEmailPending;
	const mainEmailChanged = mainEmail.trim().toLowerCase() !== userStore.email.trim().toLowerCase();
	const showEmailChange = mainEmailChanged && !userStore.isEmailPending;

	const handlePendingEmail = (): void => {
		modalStore.setModal(<PendingEmailDialog />);
	};

	const handleCancel = (): void => {
		setMainEmail(userStore.email);
		setPassword('');

		if (device === 'mobile') modalStore.setModal(<MobileUserMenu />, 'sheet');
	};

	const handleSave = async (): Promise<void> => {
		if (isLoading || !mainEmailChanged) return;

		const email = mainEmail.trim().toLowerCase();

		if (!checkEmail(email)) return;
		if (!checkPassword(password)) return;

		try {
			setIsLoading(true);

			await userStore.updateEmail(email, password);

			setMainEmail(userStore.email);
			setPassword('');

			notifyStore.setNotice('Подтвердите смену e-mail по ссылке из письма', 'success');
		} catch {
			notifyStore.setNotice('Проверьте введенные данные', 'error');
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="flex flex-col gap-1">
			<label className="text-(--color-secondary) opacity-70" htmlFor="mainEmail">
				Основная почта
			</label>
			<div className="flex flex-col gap-2">
				<Input
					disabled={userStore.isEmailPending}
					error={!mainEmail}
					id="email-main"
					leftIcon={<InputLabel htmlFor="email-main" icon={IconMailFilled} />}
					name="email-main"
					placeholder="Введите e-mail"
					rightIcon={
						userStore.isEmailPending ? (
							<IconWarning
								className="mr-1.5 size-5 animate-pulse cursor-pointer text-(--status-warning)"
								onClick={handlePendingEmail}
							/>
						) : (
							!mainEmail && <IconWarning className="mr-1.5 size-5 animate-pulse text-(--status-error)" />
						)
					}
					type="email"
					value={isEmailPending ? userStore.pendingEmail : mainEmail}
					variant="ghost"
					onChange={(e) => setMainEmail(e.target.value)}
				/>

				{isEmailPending && (
					<p className="text-xs text-(--color-secondary)">Новый e-mail ожидает подтверждения</p>
				)}

				<Collapse open={showEmailChange}>
					<div className="flex flex-col gap-2">
						<PasswordInput
							autoComplete="off"
							id="email-current-password"
							name="email-current-password"
							placeholder="Текущий пароль для смены e-mail"
							type="password"
							value={password}
							variant="ghost"
							onChange={(e) => setPassword(e.target.value)}
						/>
						<FormActions
							isLoading={isLoading}
							saveDisabled={!mainEmail || !mainEmailChanged}
							onCancel={handleCancel}
							onSave={handleSave}
						/>
					</div>
				</Collapse>
			</div>
		</div>
	);
});
