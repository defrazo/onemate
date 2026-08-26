import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AuthFormHeader, RegisterForm } from '@/features/auth';
import { usePageTitle } from '@/shared/lib/hooks';

import { AuthFooterLink, AuthWrapper, PrivacyConsent } from './components';

export const RegisterPage = () => {
	const { t } = useTranslation('auth');

	const [isPrivacyAccepted, setIsPrivacyAccepted] = useState(false);

	const title = t(($) => $.screens.register.title);

	usePageTitle(title);

	return (
		<AuthWrapper>
			<AuthFormHeader title={title} />
			<RegisterForm isPrivacyAccepted={isPrivacyAccepted} />
			<PrivacyConsent checked={isPrivacyAccepted} onChange={setIsPrivacyAccepted} />
			<AuthFooterLink
				linkText={t(($) => $.screens.register.login)}
				text={t(($) => $.screens.register.hasAccount)}
				to="/login"
			/>
		</AuthWrapper>
	);
};
