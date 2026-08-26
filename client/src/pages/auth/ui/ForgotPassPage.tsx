import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { AuthFormHeader, ForgotPassForm } from '@/features/auth';
import { usePageTitle } from '@/shared/lib/hooks';

import { AuthWrapper } from './components';

export const ForgotPassPage = () => {
	const { t } = useTranslation('auth');

	const title = t(($) => $.screens.forgotPass.title);

	usePageTitle(title);

	return (
		<AuthWrapper>
			<AuthFormHeader title={title} />
			<p className="text-justify">{t(($) => $.screens.forgotPass.description)}</p>
			<p className="text-justify text-(--color-disabled)">{t(($) => $.screens.forgotPass.hint)}</p>
			<ForgotPassForm />
			<Link
				className="cursor-pointer font-semibold text-(--color-tertiary) transition-colors hover:text-(--accent-primary-hover)"
				to="/login"
			>
				{t(($) => $.screens.forgotPass.back)}
			</Link>
		</AuthWrapper>
	);
};
