import type { RouteObject } from 'react-router-dom';

import { Layout, StaticPageLayout } from '@/app/layouts';
import { ProfileNav } from '@/features/account-settings';
import { AboutPage } from '@/pages/about';
import { DeletedAccountPage } from '@/pages/account-deleted';
import { AccountProfilePage } from '@/pages/account-profile';
import { ResetPasswordPage, VerifyEmailPage } from '@/pages/auth';
import { DashboardPage } from '@/pages/dashboard';
import { DemoPage } from '@/pages/demo';
import { Background, HomePage } from '@/pages/home';
import { KanbanPage } from '@/pages/kanban';
import { NotFoundPage } from '@/pages/not-found';
import { PrivacyPage } from '@/pages/privacy';
import { TermsPage } from '@/pages/terms';
import { TodoPage } from '@/pages/to-do';

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
						element: <Layout fillViewport hideFooter />,
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
				element: <Layout background={<Background />} />,
				children: [{ path: '/', element: <HomePage /> }],
			},
			{ children: [{ path: '/reset-password', element: <ResetPasswordPage /> }] },
		],
	},
	{
		path: '/email/verify/:id/:hash',
		element: <VerifyEmailPage />,
	},
	{
		element: <StaticPageLayout title="О демо-режиме OneMate" />,
		children: [{ path: '/demo', element: <DemoPage /> }],
	},
	{
		element: <Layout title="О проекте" />,
		children: [{ path: '/about', element: <AboutPage /> }],
	},
	{
		element: <StaticPageLayout title="Условия использования" />,
		children: [{ path: '/terms', element: <TermsPage /> }],
	},
	{
		element: <StaticPageLayout title="Политика конфиденциальности" />,
		children: [{ path: '/privacy', element: <PrivacyPage /> }],
	},
	{
		element: <Layout />,
		children: [{ path: '*', element: <NotFoundPage /> }],
	},
];
