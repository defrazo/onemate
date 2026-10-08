import { useNavigate, useSearchParams } from 'react-router-dom';

import { useStore } from '@/app/providers';
import { AuthFormHeader, AuthWrapper, ResetForm, UserAuth } from '@/features/user-auth';
import { usePageTitle } from '@/shared/lib/hooks';
import { Button } from '@/shared/ui';

const title = 'Восстановить пароль';

export const ResetPasswordPage = () => {
	usePageTitle(title);

	const navigate = useNavigate();
	const [searchParams] = useSearchParams();

	const { authFormStore, modalStore } = useStore();

	const token = searchParams.get('token');
	const email = searchParams.get('email');

	const isValidResetLink = !!token && !!email;

	return (
		<AuthWrapper isPage>
			<AuthFormHeader title={title} />
			{isValidResetLink ? (
				<>
					<p className="text-(--text-secondary)">Придумайте новый пароль для своего аккаунта</p>
					<ResetForm email={email} token={token} />
				</>
			) : (
				<div className="core-gap flex flex-col">
					<p className="text-center text-(--text-secondary)">
						Ссылка для восстановления пароля устарела или повреждена.
					</p>
					<Button
						className="h-10 w-full"
						onClick={() => {
							navigate('/');
							authFormStore.switchToForgot();
							modalStore.setModal(<UserAuth />);
						}}
					>
						Запросить новую ссылку
					</Button>
				</div>
			)}
		</AuthWrapper>
	);
};
