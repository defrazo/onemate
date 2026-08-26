import { VerifyEmailForm } from '@/features/user-auth';

// import { usePageTitle } from '@/shared/lib/hooks';
import { AuthWrapper } from './components';

export const VerifyEmailPage = () => {
	// const { t } = useTranslation('auth');

	// usePageTitle(t(($) => $.screens.verifyEmail.title));

	return (
		<AuthWrapper>
			<VerifyEmailForm />
		</AuthWrapper>
	);
};
