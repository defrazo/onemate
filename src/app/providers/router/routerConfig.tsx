import { RouteObject } from 'react-router-dom';

import PrivateRoute from '@/app/providers/router/PrivateRoute';
import AboutPage from '@/pages/AboutPage';
import AuthCallback from '@/pages/AuthCallbackPage';
import GeneratorPage from '@/pages/GeneratorPage';
import HomePage from '@/pages/HomePage';
import MainPage from '@/pages/MainPage';
import NotFoundPage from '@/pages/NotFoundPage';
import PrivacyPolicyPage from '@/pages/PrivacyPolicyPage';
import TermsOfServicePage from '@/pages/TermsOfServicePage';
import UserProfilePage from '@/pages/UserProfilePage';
import Layout from '@/shared/layouts/Layout';
import { SettingsLeft, SettingsRight } from '@/widgets/Generator';
import { UserProfileNav } from '@/widgets/UserProfile';

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
			<Layout leftSide={<SettingsLeft />} rightSide={<SettingsRight />} showFooter={true}>
				<GeneratorPage />
			</Layout>
		),
	},
	{
		path: '/user-profile',
		element: (
			<PrivateRoute
				element={
					<Layout leftSide={<UserProfileNav />} showFooter={true}>
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
