import { useNavigate } from 'react-router-dom';
import { IconArrowLeft, IconHome } from '@tabler/icons-react';

import { usePageTitle } from '@/shared/lib/hooks';
import { Button, Link } from '@/shared/ui';

export const NotFoundPage = () => {
	usePageTitle('Страница не найдена');

	const navigate = useNavigate();

	return (
		<div className="flex flex-1 items-center justify-center px-4 py-10 select-none">
			<div className="flex w-full max-w-xl flex-col items-center text-center">
				<div className="mb-8 w-64 rounded-2xl border border-(--border-color) bg-(--bg-secondary) p-3 shadow-(--shadow)">
					<div className="flex items-center gap-1.5">
						<span className="size-1.5 rounded-full bg-(--accent-default)" />
						<span className="size-1.5 rounded-full bg-white/15" />
						<span className="size-1.5 rounded-full bg-white/15" />
					</div>
					<div className="flex h-28 flex-col justify-center px-5">
						<div className="h-1.5 w-20 rounded-full bg-white/15" />
						<div className="mt-2 h-1.5 w-full rounded-full bg-white/8" />
						<div className="mt-4 flex h-9 items-center justify-center rounded-lg border border-dashed border-(--accent-default)/30">
							<span className="text-sm text-(--accent-default)">404</span>
						</div>
					</div>
				</div>
				<span className="mb-4 h-0.5 w-8 rounded-full bg-(--accent-default)" />
				<h1 className="text-2xl font-bold md:text-3xl">Страница не найдена</h1>
				<p className="mt-3 max-w-md text-sm text-(--color-secondary) md:text-base">
					Похоже, такой страницы не существует. Возможно, она была удалена или перемещена.
				</p>
				<div className="mt-7 flex items-center justify-center gap-3">
					<Button
						leftIcon={<IconArrowLeft className="size-4" />}
						variant="ghost"
						onClick={() => navigate(-1)}
					>
						Назад
					</Button>
					<Link leftIcon={<IconHome className="size-4" />} to="/">
						На главную
					</Link>
				</div>
			</div>
		</div>
	);
};
