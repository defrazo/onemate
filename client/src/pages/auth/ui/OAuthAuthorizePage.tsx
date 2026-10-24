import { useEffect, useState } from 'react';
import { IconAlertCircle, IconCheck, IconLoader2, IconLockFilled, IconShieldCheck } from '@tabler/icons-react';

import { usePageTitle } from '@/shared/lib/hooks';
import { Button } from '@/shared/ui';

import { getOAuthAuthorization, type OAuthAuthorization } from '../api';

const submitAuthorization = (authorization: OAuthAuthorization, approved: boolean) => {
	const form = document.createElement('form');

	form.method = 'POST';
	form.action = '/oauth/authorize';
	form.style.display = 'none';

	const addField = (name: string, value: string) => {
		const input = document.createElement('input');

		input.type = 'hidden';
		input.name = name;
		input.value = value;

		form.appendChild(input);
	};

	addField('_token', authorization.csrfToken);
	addField('auth_token', authorization.authToken);

	if (!approved) addField('_method', 'DELETE');

	document.body.appendChild(form);
	form.submit();
};

export const OAuthAuthorizePage = () => {
	usePageTitle('Подтверждение доступа');

	const [authorization, setAuthorization] = useState<OAuthAuthorization | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [isError, setIsError] = useState(false);

	const handleSubmit = (approved: boolean) => {
		if (!authorization || isSubmitting) return;

		setIsSubmitting(true);
		submitAuthorization(authorization, approved);
	};

	useEffect(() => {
		let active = true;

		const load = async () => {
			try {
				if (active) setAuthorization(await getOAuthAuthorization());
			} catch {
				if (active) setIsError(true);
			} finally {
				if (active) setIsLoading(false);
			}
		};

		void load();

		return () => {
			active = false;
		};
	}, []);

	if (isLoading || isError || !authorization) {
		return (
			<div className="flex min-h-screen items-center justify-center px-4 select-none">
				<div className="core-surface core-pad flex w-full max-w-md flex-col items-center bg-(--bg-secondary) px-6 py-8 text-center shadow-(--shadow-contrast)">
					<div className="mb-3 flex size-16 items-center justify-center rounded-full bg-(--bg-tertiary)">
						{isLoading ? (
							<IconLoader2 className="size-8 animate-spin text-(--accent-primary)" />
						) : (
							<IconAlertCircle className="size-8 text-(--status-error)" />
						)}
					</div>
					<h1 className="text-lg font-semibold lg:text-xl">
						{isLoading ? 'Проверяем разрешения' : 'Не удалось обработать запрос'}
					</h1>
					<p className="text-xs text-(--text-secondary) md:text-sm">
						{isLoading
							? 'Получаем сведения о приложении и разрешениях'
							: 'Попробуйте войти через приложение повторно'}
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="flex min-h-screen items-center justify-center px-4 select-none">
			<div className="core-surface core-pad flex w-full max-w-md flex-col items-center gap-3 bg-(--bg-secondary) px-6 py-8 text-center shadow-(--shadow-contrast)">
				<div className="mb-1 flex size-16 items-center justify-center rounded-full bg-(--accent-primary-muted) text-(--accent-primary)">
					<IconShieldCheck className="size-8" />
				</div>
				<h1 className="trim text-lg font-semibold lg:text-xl">Подтверждение доступа</h1>
				<p className="text-sm text-(--text-secondary)">
					Приложение <span className="font-semibold text-(--text-primary)">{authorization.client.name}</span>{' '}
					запрашивает доступ к вашему аккаунту OneMate
				</p>
				<div className="flex w-full flex-col gap-1 rounded-lg bg-(--tone) px-2.5 py-2 text-left text-xs md:text-sm">
					<span className="text-(--text-secondary)">Запрашиваемые разрешения:</span>
					{authorization.scopes.map((scope) => (
						<div key={scope.id} className="flex items-center gap-2">
							<IconCheck className="mb-px size-4 shrink-0 text-(--status-success)" />
							{scope.description}
						</div>
					))}
				</div>
				<div className="mt-3 flex w-full flex-col gap-2">
					<Button
						className="h-8 w-full"
						disabled={isSubmitting}
						variant="accent"
						onClick={() => handleSubmit(true)}
					>
						Разрешить доступ
					</Button>
					<Button
						className="h-8 w-full"
						disabled={isSubmitting}
						variant="ghost"
						onClick={() => handleSubmit(false)}
					>
						Отмена
					</Button>
				</div>
				<div className="-mt-1 flex w-full items-center justify-center gap-1 text-(--text-disabled)">
					<IconLockFilled className="size-3 shrink-0" />
					<p className="text-xs">Вы можете отозвать доступ в любое время</p>
				</div>
			</div>
		</div>
	);
};
