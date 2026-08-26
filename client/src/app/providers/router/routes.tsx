import type { RouteObject } from 'react-router-dom';

import { Layout, StaticPageLayout } from '@/app/layouts';
import AboutPage from '@/pages/about';
import DeletedAccountPage from '@/pages/account-deleted';
import UserProfilePage from '@/pages/account-profile';
import { ResetPasswordPage, VerifyEmailPage } from '@/pages/auth';
import DashboardPage from '@/pages/dashboard';
import DemoInfoPage from '@/pages/demo-info';
import GeneratorPage from '@/pages/generator';
import HomePage from '@/pages/home';
import KanbanPage from '@/pages/kanban';
import NotFoundPage from '@/pages/not-found';
import PrivacyPolicyPage from '@/pages/privacy-policy';
import TermsOfServicePage from '@/pages/terms-of-service';
import TodoPage from '@/pages/to-do';
import { SettingsLeft, SettingsRight } from '@/widgets/generator';
import { ProfileNav } from '@/widgets/user-profile';

import { ActiveAccountRoute, DeletedAccountRoute, GuardedRoute, PublicRoute } from '.';

export const routes: RouteObject[] = [
	{
		element: <GuardedRoute />,
		children: [
			{
				element: <DeletedAccountRoute />,
				children: [{ path: '/account/deleted', element: <DeletedAccountPage /> }],
			},
			{
				element: <ActiveAccountRoute />,
				children: [
					{
						element: <Layout hideLeftOnMobile leftSide={<ProfileNav />} />,
						children: [{ path: '/account/profile', element: <UserProfilePage /> }],
					},
					{
						element: <Layout hideFooter />,
						children: [{ path: '/dashboard', element: <DashboardPage /> }],
					},
					{
						element: <Layout />,
						children: [{ path: '/todo', element: <TodoPage /> }],
					},
					{
						element: <Layout hideFooter landscapeMode />,
						children: [{ path: '/kanban', element: <KanbanPage /> }],
					},
				],
			},
		],
	},
	{
		element: <PublicRoute />,
		children: [
			{
				element: <Layout />,
				children: [
					{ path: '/', element: <HomePage /> },
					{ path: '/about', element: <AboutPage /> },
				],
			},
			{
				children: [
					{ path: '/email/verify/:id/:hash', element: <VerifyEmailPage /> },
					{ path: '/reset-password', element: <ResetPasswordPage /> },
				],
			},
		],
	},
	{
		element: (
			<Layout hideLeftOnMobile hideRightOnMobile leftSide={<SettingsLeft />} rightSide={<SettingsRight />} />
		),
		children: [{ path: '/generator', element: <GeneratorPage /> }],
	},
	{
		element: <StaticPageLayout title="О демо-режиме OneMate" />,
		children: [{ path: '/demo-info', element: <DemoInfoPage /> }],
	},
	{
		element: <StaticPageLayout title="Пользовательское соглашение" />,
		children: [{ path: '/terms-of-service', element: <TermsOfServicePage /> }],
	},
	{
		element: <StaticPageLayout title="Политика конфиденциальности" />,
		children: [{ path: '/privacy-policy', element: <PrivacyPolicyPage /> }],
	},
	{
		element: <Layout />,
		children: [{ path: '*', element: <NotFoundPage /> }],
	},
];
