import type { RouteObject } from 'react-router-dom';

import { Layout, StaticPageLayout } from '@/app/layouts';
import { ProfileNav } from '@/features/account-settings';
import { AboutPage } from '@/pages/about';
import { DeletedAccountPage } from '@/pages/account-deleted';
import { AccountProfilePage } from '@/pages/account-profile';
import { ResetPasswordPage, VerifyEmailPage } from '@/pages/auth';
import { DashboardPage } from '@/pages/dashboard';
import { DemoInfoPage } from '@/pages/demo-info';
import { HomePage } from '@/pages/home';
// import GeneratorPage from '@/pages/generator';
import { KanbanPage } from '@/pages/kanban';
import { NotFoundPage } from '@/pages/not-found';
import { PrivacyPolicyPage } from '@/pages/privacy-policy';
import { TermsOfServicePage } from '@/pages/terms-of-service';
import { TodoPage } from '@/pages/to-do';

// import { SettingsLeft, SettingsRight } from '@/widgets/generator';
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
						children: [{ path: '/account/profile', element: <AccountProfilePage /> }],
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
				children: [{ path: '/', element: <HomePage /> }],
			},
			{
				children: [
					{ path: '/email/verify/:id/:hash', element: <VerifyEmailPage /> },
					{ path: '/reset-password', element: <ResetPasswordPage /> },
				],
			},
		],
	},
	// {
	// 	element: (
	// 		<Layout hideLeftOnMobile hideRightOnMobile leftSide={<SettingsLeft />} rightSide={<SettingsRight />} />
	// 	),
	// 	children: [{ path: '/generator', element: <GeneratorPage /> }],
	// },
	{
		element: <StaticPageLayout title="О демо-режиме OneMate" />,
		children: [{ path: '/demo-info', element: <DemoInfoPage /> }],
	},
	{
		element: <Layout title="О проекте" />,
		children: [{ path: '/about', element: <AboutPage /> }],
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
