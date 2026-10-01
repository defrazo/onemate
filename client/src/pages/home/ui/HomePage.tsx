import { IconArrowRight } from '@tabler/icons-react';
import { observer } from 'mobx-react-lite';
import { Link, useNavigate } from 'react-router-dom';

import { useStore } from '@/app/providers';
import { usePageTitle } from '@/shared/lib/hooks';
import { Button } from '@/shared/ui';

import { Workspace } from './components';

export const HomePage = observer(() => {
	usePageTitle('Главная');

	const navigate = useNavigate();

	const { authStore, notifyStore } = useStore();

	const handleDemo = async () => {
		try {
			await authStore.login('demo@example.com', 'DemoPassword123');

			navigate('/dashboard');
		} catch {
			notifyStore.setNotice('Что-то пошло не так', 'error');
		}
	};

	return (
		<div className="relative flex min-h-0 flex-1 pb-54 select-none md:pb-84 xl:pb-64 2xl:pb-84">
			<div className="mx-auto mt-auto mb-10 flex max-w-6xl flex-col items-center text-center md:mb-30 xl:mb-10 2xl:mb-20">
				<span className="trim mb-2 font-mono text-xs tracking-wide text-(--text-disabled)/80">
					PERSONAL WORKSPACE
				</span>
				<h1 className="my-4 max-w-md text-4xl font-bold md:my-0 md:max-w-none md:text-5xl lg:text-6xl">
					Всё нужное в одном месте
				</h1>
				<p className="mt-2 max-w-xl text-sm text-(--text-secondary) md:text-base">
					Личное пространство для работы, идей и повседневных инструментов.
				</p>
				<Button
					className="mt-8 h-9 gap-2 rounded-md px-5"
					loading={authStore.isLoading}
					loadingText="Открываем..."
					rightIcon={<IconArrowRight className="size-4" />}
					variant="accent"
					onClick={handleDemo}
				>
					Открыть демо
				</Button>
				<Link
					className="mt-2 font-mono text-xs text-(--text-secondary) transition-colors hover:text-(--accent-primary-hover)"
					to="/demo"
				>
					О демо-режиме
				</Link>
			</div>
			<Workspace />
		</div>
	);
});
