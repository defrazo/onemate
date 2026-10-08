import { useState } from 'react';
import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import { useValidation } from '@/shared/lib/hooks';
import { cn } from '@/shared/lib/utils';
import { validatePassword } from '@/shared/lib/validators';
import { Collapse, PasswordInput, PasswordRules } from '@/shared/ui';

import { useProfile } from '../../../model';
import { FormActions } from '..';

export const PasswordSection = observer(() => {
	const { checkPassword } = useValidation();

	const { notifyStore, userStore } = useStore();
	const { formattedDate } = useProfile();

	const [passOld, setPassOld] = useState('');
	const [passNew, setPassNew] = useState('');
	const [passConfirm, setPassConfirm] = useState('');
	const [showHint, setShowHint] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const canSave = passOld !== '' && passNew !== '' && passConfirm !== '';
	const hasDraft = passOld !== '' || passNew !== '' || passConfirm !== '';

	const isOldPasswordValid = validatePassword(passOld) === 'valid';

	const clearPasswords = () => {
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
			notifyStore.setNotice('Пароль успешно изменен', 'success');
		} catch {
			notifyStore.setNotice('Проверьте введенные данные', 'error');
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<section className={cn('flex flex-col', isOldPasswordValid && 'gap-2')}>
			<p className="text-xs text-(--text-secondary) opacity-70 select-none md:text-sm">
				Пароль был изменён <span className="font-semibold">{formattedDate}</span>
			</p>
			<PasswordInput
				autoComplete="current-password"
				className={!isOldPasswordValid ? (hasDraft ? 'mt-2 mb-1' : 'mt-2') : 'mt-0'}
				id="current-password"
				leftIcon={null}
				name="current-password"
				placeholder="Текущий пароль"
				type="password"
				value={passOld}
				variant="tone"
				onChange={(e) => setPassOld(e.target.value)}
			/>
			<Collapse open={isOldPasswordValid}>
				<div className="flex flex-col gap-2">
					<div className="relative">
						<PasswordInput
							autoComplete="new-password"
							id="new-password"
							leftIcon={null}
							name="new-password"
							placeholder="Новый пароль"
							type="password"
							value={passNew}
							variant="tone"
							onBlur={() => setShowHint(false)}
							onChange={(e) => setPassNew(e.target.value)}
							onFocus={() => setShowHint(true)}
						/>
						<PasswordRules password={passNew} showHint={showHint} />
					</div>
					<PasswordInput
						autoComplete="new-password"
						id="password-confirm"
						leftIcon={null}
						name="password-confirm"
						placeholder="Подтвердите новый пароль"
						type="password"
						value={passConfirm}
						variant="tone"
						onChange={(e) => setPassConfirm(e.target.value)}
						onPaste={(e) => {
							e.preventDefault();
							notifyStore.setNotice('Подтвердите пароль, введя его вручную', 'error');
						}}
					/>
				</div>
			</Collapse>
			<Collapse open={hasDraft}>
				<FormActions
					isLoading={isLoading}
					saveDisabled={!canSave}
					onCancel={clearPasswords}
					onSave={handleSave}
				/>
			</Collapse>
		</section>
	);
});
