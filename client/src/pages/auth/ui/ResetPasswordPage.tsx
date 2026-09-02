import { useNavigate, useSearchParams } from 'react-router-dom';

import { useStore } from '@/app/providers';
import { AuthFormHeader, AuthWrapper, ResetForm, UserAuth } from '@/features/user-auth';
import { usePageTitle } from '@/shared/lib/hooks';
import { Button } from '@/shared/ui';

export const ResetPasswordPage = () => {
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();

	const { authFormStore, modalStore } = useStore();

	const token = searchParams.get('token');
	const email = searchParams.get('email');

	const isValidResetLink = !!token && !!email;

	const title = 'Восстановить пароль';

	usePageTitle(title);

	return (
		<AuthWrapper isPage>
			<AuthFormHeader title={title} />
			{isValidResetLink ? (
				<>
					<p className="text-(--color-secondary)">Придумайте новый пароль для своего аккаунта</p>
					<ResetForm email={email} token={token} />
				</>
			) : (
				<div className="flex flex-col gap-4">
					<p className="text-center text-(--color-secondary)">
						Ссылка для восстановления пароля устарела или повреждена.
					</p>
					<Button
						className="core-elements h-10 w-full"
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
