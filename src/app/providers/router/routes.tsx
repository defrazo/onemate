import { RouteObject } from 'react-router-dom';

import AboutPage from '@/pages/about';
import DeletedAccountPage from '@/pages/account-deleted';
import UserProfilePage from '@/pages/account-profile';
import AuthCallback from '@/pages/auth-callback';
import DashboardPage from '@/pages/dashboard';
import GeneratorPage from '@/pages/generator';
import HomePage from '@/pages/home';
import KanbanPage from '@/pages/kanban';
import NotFoundPage from '@/pages/not-found';
import PrivacyPolicyPage from '@/pages/privacy-policy';
import TermsOfServicePage from '@/pages/terms-of-service';
import TodoPage from '@/pages/to-do';
import Layout from '@/shared/layouts';
import { SettingsLeft, SettingsRight } from '@/widgets/generator';
import { ProfileNav } from '@/widgets/user-profile';

import { GuardedRoute } from '.';

export const routes: RouteObject[] = [
	{
		path: '/auth/callback',
		element: <GuardedRoute element={<AuthCallback />} />,
	},
	{
		path: '/account/deleted',
		element: (
			<GuardedRoute element={<DeletedAccountPage />} redirectIfDeleted={false} redirectIfNotDeleted={true} />
		),
	},
	{
		path: '/account/profile',
		element: (
			<GuardedRoute
				element={
					<Layout hideLeftOnMobile leftSide={<ProfileNav />} showFooter>
						<UserProfilePage />
					</Layout>
				}
			/>
		),
	},
	{
		path: '/dashboard',
		element: (
			<GuardedRoute
				element={
					<Layout showFooter>
						<DashboardPage />
					</Layout>
				}
			/>
		),
	},
	{
		path: '/todo',
		element: (
			<GuardedRoute
				element={
					<Layout showFooter>
						<TodoPage />
					</Layout>
				}
			/>
		),
	},
	{
		path: '/kanban',
		element: (
			<GuardedRoute
				element={
					<Layout showFooter>
						<KanbanPage />
					</Layout>
				}
			/>
		),
	},
	{
		path: '/generator',
		element: (
			<GuardedRoute
				element={
					<Layout
						hideLeftOnMobile
						hideRightOnMobile
						leftSide={<SettingsLeft />}
						rightSide={<SettingsRight />}
						showFooter
					>
						<GeneratorPage />
					</Layout>
				}
				requireAuth={false}
			/>
		),
	},
	{
		path: '/',
		element: (
			<GuardedRoute
				element={
					<Layout showFooter>
						<HomePage />
					</Layout>
				}
				requireAuth={false}
			/>
		),
	},
	{
		path: '/about',
		element: (
			<GuardedRoute
				element={
					<Layout showFooter>
						<AboutPage />
					</Layout>
				}
				requireAuth={false}
			/>
		),
	},
	{
		path: '/terms-of-service',
		element: (
			<GuardedRoute
				element={
					<Layout showFooter>
						<TermsOfServicePage />
					</Layout>
				}
				requireAuth={false}
			/>
		),
	},
	{
		path: '/privacy-policy',
		element: (
			<GuardedRoute
				element={
					<Layout showFooter>
						<PrivacyPolicyPage />
					</Layout>
				}
				requireAuth={false}
			/>
		),
	},
	{
		path: '*',
		element: (
			<GuardedRoute
				element={
					<Layout showFooter>
						<NotFoundPage />
					</Layout>
				}
				requireAuth={false}
			/>
		),
	},
];
