import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { CircleAlert, LoaderCircle, MailCheck } from 'lucide-react';
import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import { Button } from '@/shared/ui';

type Status = 'loading' | 'success' | 'error';

export const VerifyEmailForm = observer(() => {
	const navigate = useNavigate();

	const { authStore, userStore } = useStore();

	const { id, hash } = useParams();
	const [searchParams] = useSearchParams();

	const [status, setStatus] = useState<Status>('loading');

	const type = searchParams.get('type') ?? 'register';

	useEffect(() => {
		const expires = searchParams.get('expires');
		const signature = searchParams.get('signature');

		if (!id || !hash || !expires || !signature) {
			setStatus('error');
			return;
		}

		const params = Object.fromEntries(searchParams.entries());

		const verify = async () => {
			try {
				if (type === 'pending') await userStore.verifyPendingEmail(id, hash, params);
				else await authStore.verifyEmail(id, hash, params);

				setStatus('success');
			} catch {
				setStatus('error');
			}
		};

		void verify();
	}, [id, hash, type]);

	return (
		<div className="flex flex-col items-center gap-2 select-none">
			<div className="rounded-full border-3 border-(--color-accent) p-2 shadow-(--shadow-secondary) lg:p-3">
				{status === 'loading' && <LoaderCircle className="size-8 animate-spin text-(--color-accent)" />}

				{status === 'success' && <MailCheck className="size-8 text-(--color-accent)" />}

				{status === 'error' && <CircleAlert className="size-8 text-(--color-accent)" />}
			</div>

			<h2 className="text-center text-2xl font-semibold">Подтверждение e-mail</h2>

			{status === 'loading' && (
				<p className="text-center text-(--color-secondary)">Проверяем ссылку подтверждения...</p>
			)}

			{status === 'success' && (
				<>
					<p className="text-center text-(--color-secondary)">
						{type === 'pending' ? 'Новый e-mail успешно подтверждён.' : 'E-mail успешно подтверждён.'}
					</p>

					<Button
						className="active-btn mt-4 h-10 w-full"
						onClick={() => navigate(type === 'pending' ? '/account/profile?tab=contacts' : '/dashboard')}
					>
						Продолжить
					</Button>
				</>
			)}

			{status === 'error' && (
				<>
					<p className="text-center text-(--color-secondary)">
						Не удалось подтвердить e-mail. Ссылка могла устареть или быть повреждена.
					</p>

					<Button className="active-btn mt-4 h-10 w-full" onClick={() => navigate('/')}>
						На главную
					</Button>
				</>
			)}
		</div>
	);
});
