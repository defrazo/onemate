import { useEffect, useState } from 'react';
import { IconAlertCircle, IconLoader2, IconMailCheck } from '@tabler/icons-react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

import { useStore } from '@/app/providers';
import { UserAuth } from '@/features/auth';
import { usePageTitle } from '@/shared/lib/hooks';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui';

type Status = 'loading' | 'success' | 'error';

export const VerifyEmailPage = () => {
	usePageTitle('Подтверждение аккаунта');

	const navigate = useNavigate();
	const { id, hash } = useParams();
	const [searchParams] = useSearchParams();

	const { authFormStore, authStore, modalStore, userStore } = useStore();

	const [status, setStatus] = useState<Status>('loading');

	const expires = searchParams.get('expires');
	const signature = searchParams.get('signature');
	const type = searchParams.get('type') ?? 'register';
	const isPending = type === 'pending';

	const query = searchParams.toString();

	useEffect(() => {
		if (!id || !hash || !expires || !signature) {
			setStatus('error');
			return;
		}

		let active = true;

		const params = Object.fromEntries(new URLSearchParams(query));

		const verify = async () => {
			setStatus('loading');

			try {
				if (isPending) await userStore.verifyPendingEmail(id, hash, params);
				else await authStore.verifyEmail(id, hash, params);

				if (active) setStatus('success');
			} catch {
				if (active) setStatus('error');
			}
		};

		void verify();

		return () => {
			active = false;
		};
	}, [id, hash, expires, signature, isPending, query, authStore, userStore]);

	return (
		<div className="flex min-h-screen items-center justify-center px-4 select-none">
			<div className="core-surface core-pad flex w-full max-w-md flex-col items-center bg-(--bg-secondary) px-2 py-5 text-center shadow-(--shadow-contrast) md:px-6 md:py-8">
				<div
					className={cn(
						'mb-3 flex size-16 items-center justify-center rounded-full',
						status === 'loading' && 'bg-(--bg-tertiary) text-(--accent-primary)',
						status === 'success' && 'bg-(--status-success-muted) text-(--status-success)',
						status === 'error' && 'bg-(--status-error-muted) text-(--status-error)'
					)}
				>
					{status === 'loading' && <IconLoader2 className="size-8 animate-spin" />}
					{status === 'success' && <IconMailCheck className="size-8" />}
					{status === 'error' && <IconAlertCircle className="size-8" />}
				</div>
				<h1 className="text-lg font-semibold lg:text-xl">
					{status === 'loading' && 'Подтверждаем почту'}
					{status === 'success' && 'Почта подтверждена!'}
					{status === 'error' && 'Не удалось подтвердить почту'}
				</h1>
				{status === 'loading' && (
					<p className="mt-1 text-sm text-(--text-secondary)">
						Проверяем ссылку подтверждения. <br /> Это займёт немного времени.
					</p>
				)}
				{status === 'success' && (
					<p className="mt-1 text-sm text-(--text-secondary)">
						{isPending
							? 'Новый адрес электронной почты успешно подтверждён'
							: 'Адрес электронной почты подтверждён'}
					</p>
				)}
				{status === 'error' && (
					<p className="mt-1 text-sm text-(--text-secondary)">
						Ссылка недействительна или срок её действия истёк. Попробуйте запросить новое письмо.
					</p>
				)}
				{status === 'success' && (
					<Button
						className="mt-3 h-8 min-w-56"
						onClick={() => navigate(isPending ? '/account/profile?tab=contacts' : '/dashboard')}
					>
						{isPending ? 'Вернуться в профиль' : 'Перейти в приложение'}
					</Button>
				)}
				{status === 'error' && (
					<Button
						className="mt-3 h-8 min-w-56"
						variant="accent"
						onClick={() => {
							navigate('/');
							authFormStore.switchToConfirm();
							modalStore.setModal(<UserAuth />);
						}}
					>
						Отправить письмо повторно
					</Button>
				)}
			</div>
		</div>
	);
};
