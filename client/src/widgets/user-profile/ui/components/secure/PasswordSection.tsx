import { useState } from 'react';
import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import { PasswordHint, PasswordInput, useAuth } from '@/features/user-auth';
import { Collapse } from '@/shared/ui';
import { MobileUserMenu } from '@/widgets/user-menu';

import { useProfile } from '../../../model';
import { FormActions } from '..';

export const PasswordSection = observer(() => {
	const { modalStore, notifyStore, userStore } = useStore();
	const { device, formattedDate } = useProfile();
	const { checkPassword } = useAuth();

	const [passOld, setPassOld] = useState('');
	const [passNew, setPassNew] = useState('');
	const [passConfirm, setPassConfirm] = useState('');
	const [showHint, setShowHint] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const canSave = passOld !== '' && passNew !== '' && passConfirm !== '';
	const hasDraft = passOld !== '' || passNew !== '' || passConfirm !== '';

	const clearPasswords = (): void => {
		setPassOld('');
		setPassNew('');
		setPassConfirm('');
		setShowHint(false);
	};

	const handleSave = async (): Promise<void> => {
		if (isLoading || !canSave) return;
		if (!checkPassword(passNew)) return;

		if (passNew !== passConfirm) {
			notifyStore.setNotice('Пароли не совпадают', 'info');
			return;
		}

		try {
			setIsLoading(true);

			await userStore.updatePassword(passOld, passNew, passConfirm);

			clearPasswords();
			notifyStore.setNotice('Пароль успешно изменен!', 'success');
		} catch {
			notifyStore.setNotice('Проверьте введенные данные', 'error');
		} finally {
			setIsLoading(false);
		}
	};

	const handleCancel = (): void => {
		if (device === 'mobile') {
			modalStore.setModal(<MobileUserMenu />, 'sheet');
			return;
		}

		clearPasswords();
	};

	return (
		<section className="flex flex-col gap-2">
			<p className="text-xs text-(--color-secondary) opacity-70 select-none md:text-sm">
				Пароль был изменён <span className="font-semibold">{formattedDate}</span>
			</p>
			<PasswordInput
				autoComplete="current-password"
				id="current-password"
				name="current-password"
				placeholder="Текущий пароль"
				type="password"
				value={passOld}
				variant="ghost"
				onChange={(e) => setPassOld(e.target.value)}
			/>
			<div className="relative">
				<PasswordInput
					autoComplete="new-password"
					id="new-password"
					name="new-password"
					placeholder="Новый пароль"
					type="password"
					value={passNew}
					variant="ghost"
					onBlur={() => setShowHint(false)}
					onChange={(e) => setPassNew(e.target.value)}
					onFocus={() => setShowHint(true)}
				/>
				<PasswordHint password={passNew} showHint={showHint} />
			</div>
			<PasswordInput
				autoComplete="new-password"
				id="password-confirm"
				name="password-confirm"
				placeholder="Подтвердите новый пароль"
				type="password"
				value={passConfirm}
				variant="ghost"
				onChange={(e) => setPassConfirm(e.target.value)}
				onPaste={(e) => {
					e.preventDefault();
					notifyStore.setNotice('Подтвердите пароль, введя его вручную', 'error');
				}}
			/>
			<Collapse open={hasDraft}>
				<FormActions
					isLoading={isLoading}
					saveDisabled={!canSave}
					onCancel={handleCancel}
					onSave={handleSave}
				/>
			</Collapse>
		</section>
	);
});
