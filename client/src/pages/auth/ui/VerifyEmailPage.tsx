import { useEffect, useState } from 'react';
import { IconAlertCircle, IconLoader2, IconMailCheck } from '@tabler/icons-react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

import { useStore } from '@/app/providers';
import { AuthWrapper, UserAuth } from '@/features/user-auth';
import { usePageTitle } from '@/shared/lib/hooks';
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
		<AuthWrapper isPage>
			<div className="flex flex-col items-center gap-2 select-none">
				<div className="rounded-full border-3 border-(--accent-primary) p-2 lg:p-3">
					{status === 'loading' && <IconLoader2 className="size-8 animate-spin text-(--accent-primary)" />}
					{status === 'success' && <IconMailCheck className="size-8 text-(--accent-primary)" />}
					{status === 'error' && <IconAlertCircle className="size-8 text-(--accent-primary)" />}
				</div>
				<h2 className="text-center text-2xl font-semibold">Подтверждение e-mail</h2>

				{status === 'loading' && <p className="text-center">Проверяем ссылку подтверждения...</p>}

				{status === 'success' && (
					<>
						<p className="text-center">
							{isPending ? 'Новый e-mail успешно подтверждён.' : 'E-mail успешно подтверждён.'}
						</p>
						<Button
							className="core-elements mt-4 h-10 w-full"
							onClick={() => navigate(isPending ? '/account/profile?tab=contacts' : '/dashboard')}
						>
							Продолжить
						</Button>
					</>
				)}

				{status === 'error' && (
					<>
						<p className="text-center">
							Не удалось подтвердить e-mail. Ссылка могла устареть или быть повреждена.
						</p>
						<Button
							className="core-elements mt-4 h-10 w-full"
							onClick={() => {
								navigate('/');
								authFormStore.switchToConfirm();
								modalStore.setModal(<UserAuth />);
							}}
						>
							Отправить письмо повторно
						</Button>
					</>
				)}
			</div>
		</AuthWrapper>
	);
};
