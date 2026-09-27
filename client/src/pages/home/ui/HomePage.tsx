import { useNavigate } from 'react-router-dom';
import { IconArrowRight } from '@tabler/icons-react';

import { usePageTitle } from '@/shared/lib/hooks';
import { Button } from '@/shared/ui';

import { Workspace } from './components';

export const HomePage = () => {
	usePageTitle('Главная');

	const navigate = useNavigate();

	return (
		<div className="relative flex min-h-0 flex-1 pb-54 select-none md:pb-84 xl:pb-64 2xl:pb-84">
			<div className="m-auto flex max-w-6xl flex-col items-center text-center">
				<span className="trim mb-2 font-mono text-xs tracking-wide text-(--color-disabled)/80">
					PERSONAL WORKSPACE
				</span>
				<h1 className="my-4 max-w-md text-4xl font-bold md:my-0 md:max-w-none md:text-5xl lg:text-6xl">
					Всё нужное в одном месте
				</h1>
				<p className="mt-2 max-w-xl text-sm text-(--color-secondary) md:text-base">
					Личное пространство для работы, идей и повседневных инструментов.
				</p>
				<Button
					className="mt-8 h-9 gap-2 rounded-md px-5"
					rightIcon={<IconArrowRight className="size-4" />}
					variant="accent"
					onClick={() => navigate('/demo')}
				>
					Открыть демо
				</Button>
				<span className="mt-2 font-mono text-xs text-(--color-disabled)/80">без регистрации</span>
			</div>
			<Workspace />
		</div>
	);
};
