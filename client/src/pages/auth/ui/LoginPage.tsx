import { useTranslation } from 'react-i18next';

import { AuthDemo, AuthFormHeader, LoginForm } from '@/features/auth';
import { usePageTitle } from '@/shared/lib/hooks';
import { AuthDivider } from '@/shared/ui';

import { AuthFooterLink, AuthWrapper } from './components';

export const LoginPage = () => {
	const { t } = useTranslation('auth');

	const title = t(($) => $.screens.login.title);

	usePageTitle(title);

	return (
		<AuthWrapper>
			<AuthFormHeader title={title} />
			<AuthDemo />
			<AuthDivider />
			<LoginForm />
			<AuthFooterLink
				linkText={t(($) => $.screens.login.register)}
				text={t(($) => $.screens.login.noAccount)}
				to="/register"
			/>
		</AuthWrapper>
	);
};
