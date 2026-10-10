import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

import { Layout, StaticPageLayout } from '@/app/layouts';
import { ProfileNav } from '@/features/account-settings';
import { DemoPage } from '@/pages/demo';

import { ActiveAccountRoute, DeletedAccountRoute, GuardedRoute, PublicRoute } from '.';

const AboutPage = lazy(() => import('@/pages/about').then((m) => ({ default: m.AboutPage })));
const AccountProfilePage = lazy(() =>
	import('@/pages/account-profile').then((m) => ({ default: m.AccountProfilePage }))
);
const Background = lazy(() => import('@/pages/home').then((m) => ({ default: m.Background })));
const DashboardPage = lazy(() => import('@/pages/dashboard').then((m) => ({ default: m.DashboardPage })));
const DeletedAccountPage = lazy(() =>
	import('@/pages/account-deleted').then((m) => ({ default: m.DeletedAccountPage }))
);
const HomePage = lazy(() => import('@/pages/home').then((m) => ({ default: m.HomePage })));
const KanbanPage = lazy(() => import('@/pages/kanban').then((m) => ({ default: m.KanbanPage })));
const NotFoundPage = lazy(() => import('@/pages/not-found').then((m) => ({ default: m.NotFoundPage })));
const PrivacyPage = lazy(() => import('@/pages/privacy').then((m) => ({ default: m.PrivacyPage })));
const ResetPasswordPage = lazy(() => import('@/pages/auth').then((m) => ({ default: m.ResetPasswordPage })));
const TermsPage = lazy(() => import('@/pages/terms').then((m) => ({ default: m.TermsPage })));
const TodoPage = lazy(() => import('@/pages/to-do').then((m) => ({ default: m.TodoPage })));
const VerifyEmailPage = lazy(() => import('@/pages/auth').then((m) => ({ default: m.VerifyEmailPage })));

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
						element: <Layout background={<Background />} />,
						children: [{ path: '/todo', element: <TodoPage /> }],
					},
					{
						element: <Layout hideFooter />,
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
		element: <Layout background={<Background />} />,
		children: [{ path: '*', element: <NotFoundPage /> }],
	},
];
