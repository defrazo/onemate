import { IconArrowLeft, IconHome } from '@tabler/icons-react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button, Link } from '@/shared/ui';

interface ComingSoonProps {
	title?: string;
	description?: string;
	suggestions?: ReactNode;
}

export const ComingSoon = ({
	title = 'Скоро будет готово',
	description = 'Этот раздел OneMate пока находится в разработке. Загляните сюда немного позже.',
	suggestions,
}: ComingSoonProps) => {
	const navigate = useNavigate();

	return (
		<div className="flex flex-1 items-center justify-center px-4 py-10 select-none">
			<div className="flex w-full max-w-xl flex-col items-center text-center">
				<div className="mb-8 w-64 rounded-2xl border border-(--border-primary) bg-(--bg-secondary) p-3 shadow-(--shadow-contrast)">
					<div className="mb-4 flex items-center gap-1.5">
						<span className="size-1.5 rounded-full bg-(--accent-primary)" />
						<span className="size-1.5 rounded-full bg-(--border-tone)" />
						<span className="size-1.5 rounded-full bg-(--border-tone)" />
					</div>
					<div className="space-y-2">
						<div className="h-2 w-2/3 rounded-full bg-(--tone-strong-hover)" />
						<div className="h-2 w-full rounded-full bg-(--tone)" />
						<div className="h-2 w-4/5 rounded-full bg-(--tone)" />
					</div>
					<div className="mt-4 flex gap-2">
						<div className="h-10 flex-1 rounded-lg bg-(--tone)" />
						<div className="h-10 flex-1 rounded-lg bg-(--accent-primary-muted)" />
					</div>
				</div>
				<span className="mb-4 h-0.5 w-8 rounded-full bg-(--accent-primary)" />
				<h1 className="text-2xl font-semibold md:text-3xl">{title}</h1>
				<p className="mt-3 max-w-md text-sm text-(--text-secondary) md:text-base">{description}</p>
				<div className="mt-7 flex flex-wrap items-center justify-center gap-3">
					{suggestions ?? (
						<>
							<Button
								className="h-9"
								leftIcon={<IconArrowLeft className="size-4" />}
								onClick={() => navigate(-1)}
							>
								Назад
							</Button>
							<Link className="h-9" leftIcon={<IconHome className="size-4" />} to="/" variant="accent">
								На главную
							</Link>
						</>
					)}
				</div>
			</div>
		</div>
	);
};
