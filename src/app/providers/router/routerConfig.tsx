import { RouteObject } from 'react-router-dom';

import PrivateRoute from '@/app/providers/router/PrivateRoute';
import AboutPage from '@/pages/AboutPage';
import AuthCallback from '@/pages/AuthCallbackPage';
import GeneratorPage from '@/pages/GeneratorPage';
import HomePage from '@/pages/HomePage';
import MainPage from '@/pages/main-page';
import NotFoundPage from '@/pages/NotFoundPage';
import PrivacyPolicyPage from '@/pages/PrivacyPolicyPage';
import TermsOfServicePage from '@/pages/TermsOfServicePage';
import UserProfilePage from '@/pages/UserProfilePage';
import Layout from '@/shared/layouts/Layout';
import { SettingsLeft, SettingsRight } from '@/widgets/generator';
import { UserProfileNav } from '@/widgets/user-profile';

export const routes: RouteObject[] = [
	{
		path: '/',
		element: (
			<Layout showFooter={true}>
				<HomePage />
			</Layout>
		),
	},
	{
		path: '/main',
		element: (
			<Layout showFooter={true}>
				<PrivateRoute element={<MainPage />} />
			</Layout>
		),
	},
	{
		path: '/generator',
		element: (
			<Layout
				hideLeftOnMobile
				hideRightOnMobile
				leftSide={<SettingsLeft />}
				rightSide={<SettingsRight />}
				showFooter
			>
				<GeneratorPage />
			</Layout>
		),
	},
	{
		path: '/user-profile',
		element: (
			<PrivateRoute
				element={
					<Layout hideLeftOnMobile leftSide={<UserProfileNav />} showFooter={true}>
						<PrivateRoute element={<UserProfilePage />} />
					</Layout>
				}
			/>
		),
	},
	{
		path: '/about',
		element: (
			<Layout showFooter={true}>
				<AboutPage />
			</Layout>
		),
	},
	{
		path: '/terms',
		element: (
			<Layout showFooter={true}>
				<TermsOfServicePage />
			</Layout>
		),
	},
	{
		path: '/privacy',
		element: (
			<Layout showFooter={true}>
				<PrivacyPolicyPage />
			</Layout>
		),
	},
	{
		path: '/auth/callback',
		element: <AuthCallback />,
	},
	{
		path: '*',
		element: (
			<Layout showFooter={true}>
				<NotFoundPage />
			</Layout>
		),
	},
];
