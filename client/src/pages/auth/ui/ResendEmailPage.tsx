import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { useStore } from '@/app/providers';
import { AuthFormHeader, ResendEmailForm } from '@/features/auth';
import { usePageTitle } from '@/shared/lib/hooks';

import { AuthWrapper } from './components';

export const ResendEmailPage = () => {
	const { t } = useTranslation('auth');

	const { authStore } = useStore();

	const title = t(($) => $.screens.resendEmail.title);

	usePageTitle(title);

	return (
		<AuthWrapper>
			<AuthFormHeader title={title} />
			<p className="text-justify">{t(($) => $.screens.resendEmail.description)}</p>
			<p className="text-justify text-(--color-disabled)">{t(($) => $.screens.resendEmail.hint)}</p>
			<ResendEmailForm />
			<Link
				className="cursor-pointer font-semibold text-(--color-tertiary) transition-colors hover:text-(--accent-primary-hover)"
				to={authStore.isAuth ? '/?tab=settings' : '/login'}
			>
				{t(($) => $.screens.resendEmail.back)}
			</Link>
		</AuthWrapper>
	);
};
