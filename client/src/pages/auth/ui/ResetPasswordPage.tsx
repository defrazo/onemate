import { useNavigate, useSearchParams } from 'react-router-dom';

import { ResetForm } from '@/features/user-auth';
import { Button } from '@/shared/ui';

import { AuthWrapper } from './components';

export const ResetPasswordPage = () => {
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();

	const token = searchParams.get('token');
	const email = searchParams.get('email');

	const isValidResetLink = !!token && !!email;

	return (
		<AuthWrapper>
			{isValidResetLink ? (
				<ResetForm email={email} token={token} />
			) : (
				<div className="flex flex-col gap-4">
					<h1 className="core-header">Ссылка недействительна</h1>
					<p className="text-(--color-secondary)">
						Ссылка для восстановления пароля устарела или повреждена.
					</p>
					<Button className="active-btn" onClick={() => navigate('/')}>
						На главную
					</Button>
				</div>
			)}
		</AuthWrapper>
	);
};
