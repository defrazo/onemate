import { IconAlertCircle, IconLock } from '@tabler/icons-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { useStore } from '@/app/providers';
import { ResetForm, UserAuth } from '@/features/auth';
import { usePageTitle } from '@/shared/lib/hooks';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui';

export const ResetPasswordPage = () => {
	usePageTitle('Восстановление пароля');

	const navigate = useNavigate();
	const [searchParams] = useSearchParams();

	const { authFormStore, modalStore } = useStore();

	const token = searchParams.get('token');
	const email = searchParams.get('email');

	const isValidResetLink = !!token && !!email;

	return (
		<div className="flex min-h-screen items-center justify-center px-4 select-none">
			<div className="core-surface core-pad flex w-full max-w-md flex-col items-center bg-(--bg-secondary) px-2 py-5 text-center shadow-(--shadow-contrast) md:px-6 md:py-8">
				<div
					className={cn(
						'mb-2 flex size-16 items-center justify-center rounded-full',
						isValidResetLink
							? 'bg-(--bg-tertiary) text-(--accent-primary)'
							: 'bg-(--status-error-muted) text-(--status-error)'
					)}
				>
					{isValidResetLink ? (
						<IconLock className="size-8" stroke={1.7} />
					) : (
						<IconAlertCircle className="size-8" stroke={1.7} />
					)}
				</div>
				<h1 className="text-lg font-semibold lg:text-xl">
					{isValidResetLink ? 'Новый пароль' : 'Ссылка недействительна'}
				</h1>
				<p className="mt-1 text-sm text-(--text-secondary)">
					{isValidResetLink
						? 'Придумайте новый пароль для своего аккаунта'
						: 'Ссылка недействительна или срок её действия истёк. Попробуйте запросить новую ссылку.'}
				</p>
				{isValidResetLink ? (
					<div className="mt-3 w-full text-left">
						<ResetForm email={email} token={token} />
					</div>
				) : (
					<Button
						className="mt-3 h-8 min-w-56"
						variant="accent"
						onClick={() => {
							navigate('/');
							authFormStore.switchToForgot();
							modalStore.setModal(<UserAuth />);
						}}
					>
						Запросить новую ссылку
					</Button>
				)}
			</div>
		</div>
	);
};
