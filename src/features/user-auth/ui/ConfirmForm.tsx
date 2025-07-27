import { observer } from 'mobx-react-lite';

import { IconEmail } from '@/shared/assets/icons';
import { Logo } from '@/shared/assets/images';
import { validateEmail } from '@/shared/lib/validators';
import { notifyStore } from '@/shared/stores';
import { Button, Input } from '@/shared/ui';

import { authFormStore } from '../model';

interface ConfirmFormProps {
	onSubmit: () => void;
}

export const ConfirmForm = observer(({ onSubmit }: ConfirmFormProps) => {
	const store = authFormStore;
	const isBlocked = store.timer > 0;

	const infoText = !store.resetMode ? (
		<>
			<p>
				Мы отправили письмо с подтверждением на адрес электронной почты. Пожалуйста, проверьте свою почту,
				включая папку «Спам». <br />
			</p>
			<p className="text-[var(--color-disabled)]">
				Если письмо не пришло, убедитесь, что адрес указан правильно и попробуйте запросить письмо повторно.
			</p>
		</>
	) : (
		<>
			<p>
				Введите e-mail, к которому привязан ваш аккаунт OneMate. <br />
				Мы отправим на него письмо с инструкциями по восстановлению пароля.
			</p>
			<p className="text-[var(--color-disabled)]">
				Пожалуйста, проверьте почту, включая папку «Спам». <br />
				Если письмо не придет, убедитесь, что адрес указан правильно и попробуйте запросить письмо повторно.
			</p>
		</>
	);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		try {
			await validateEmail(store.email);
			onSubmit();
		} catch (error: any) {
			notifyStore.setNotice(error.message || 'Проверьте введенные данные', 'error');
		}
	};

	return (
		<div className="flex flex-col items-center gap-4 md:w-lg">
			<div className="flex flex-col items-center gap-2 select-none">
				<img alt="Логотип" className="size-20" src={Logo} />
				<h1 className="core-header">
					{!store.resetMode ? 'Подтвердить e-mail' : 'Восстановить пароль'} OneMate
				</h1>
			</div>
			<div className="space-y-2 text-center text-sm select-none">{infoText}</div>
			<form className="flex w-full flex-col gap-4" onSubmit={handleSubmit}>
				<Input
					leftIcon={<IconEmail className="size-6 border-r border-[var(--border-color)] pr-1" />}
					placeholder="E-mail"
					readOnly={isBlocked}
					required
					type="email"
					value={store.email}
					variant="ghost"
					onBlur={(e) => store.update('email', e.target.value.trim())}
					onChange={(e) => store.update('email', e.target.value)}
				/>
				<Button className="mt-4 h-10 w-full" disabled={isBlocked} type="submit">
					{isBlocked
						? `Повторить через ${store.timer} сек.`
						: !store.resetMode
							? 'Повторить отправку'
							: 'Отправить письмо'}
				</Button>
			</form>
		</div>
	);
});
