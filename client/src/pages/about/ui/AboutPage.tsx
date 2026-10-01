import {
	IconAnalyze,
	IconBrandDocker,
	IconBrandLaravel,
	IconBrandReact,
	IconBrandTailwind,
	IconBrandTypescript,
	IconDatabase,
	IconMail,
	IconPointFilled,
	IconServer,
	IconStack2,
} from '@tabler/icons-react';

import { usePageTitle } from '@/shared/lib/hooks';

const areas = [
	{
		title: 'Рабочее пространство',
		description: 'Задачи, канбан, календарь и заметки для планирования и организации работы.',
	},
	{
		title: 'Обзор',
		description: 'Погода, состояние сервисов и другая актуальная информация в одном месте.',
	},
	{
		title: 'Инструменты',
		description: 'Переводчик, конвертер валют и небольшие утилиты для повседневных задач.',
	},
];

const technologies = [
	{ title: 'React', description: 'Интерфейс', Icon: IconBrandReact },
	{ title: 'TypeScript', description: 'Строгая типизация', Icon: IconBrandTypescript },
	{ title: 'TailwindCSS', description: 'Утилитарные стили', Icon: IconBrandTailwind },
	{ title: 'FSD', description: 'Архитектура кода', Icon: IconStack2 },
	{ title: 'MobX', description: 'Реактивность', Icon: IconAnalyze },
	{ title: 'Laravel', description: 'Backend и API', Icon: IconBrandLaravel },
	{ title: 'PostgreSQL', description: 'Хранение данных', Icon: IconDatabase },
	{ title: 'Redis', description: 'Сессии и очереди', Icon: IconServer },
	{ title: 'Docker', description: 'Контейнеризация', Icon: IconBrandDocker },
];

const principles = [
	['Практичность', 'Каждый модуль решает конкретную задачу и остаётся полезным в повседневной работе.'],
	['Цельность', 'Все инструменты остаются частями одного приложения с общими логикой и интерфейсом.'],
	['Предсказуемость', 'Интерфейс остаётся последовательным и понятным независимо от выбранного раздела.'],
	['Развитие', 'Архитектура и интерфейс развиваются вместе с возможностями и задачами проекта.'],
];

export const AboutPage = () => {
	usePageTitle('О проекте');

	return (
		<div className="mx-auto flex w-full max-w-5xl flex-col gap-10 select-none not-md:pt-8 md:pb-8 xl:gap-16">
			<section className="grid gap-10 md:grid-cols-2 md:gap-12 md:py-16 xl:grid-cols-[1.2fr_0.8fr]">
				<div className="m-auto flex max-w-2xl flex-col items-center gap-3">
					<span className="h-1 w-10 animate-pulse rounded-full bg-(--accent-primary)/70" />
					<h1 className="text-center text-2xl leading-[1.1] xl:text-5xl">
						Единое пространство
						<br />
						для повседневных задач
						<br />и инструментов.
					</h1>
					<span className="mt-2 h-1 w-10 animate-pulse rounded-full bg-(--accent-primary)/70" />
				</div>
				<div className="flex flex-col gap-6">
					<div className="hidden border-b border-(--border-primary) pb-2 md:block">
						<Labels titles={['PRIVATE PET PROJECT', 'FULLSTACK', 'WEB APPLICATION']} />
					</div>
					<div className="space-y-5 leading-relaxed text-(--text-secondary)">
						<p>
							OneMate – частный pet-проект, который начинался как набор небольших утилит и постепенно
							вырос в полноценное веб-приложение.
						</p>
						<p>
							В одном интерфейсе проект объединяет задачи, заметки, канбан, календарь, мониторинг сервисов
							и повседневные инструменты.
						</p>
					</div>
				</div>
			</section>
			<section className="flex flex-col gap-6">
				<div className="flex items-center justify-between border-b border-(--border-primary) pb-2">
					<h2 className="trim text-xl font-bold">Что внутри</h2>
					<Labels titles={['WORKSPACE', 'OVERVIEW', 'UTILITIES']} />
				</div>
				<div className="flex flex-col justify-between gap-5 md:flex-row">
					{areas.map(({ title, description }, idx) => (
						<div key={idx} className="flex flex-col gap-3">
							<div className="flex items-center gap-3 md:flex-col md:items-start">
								<span className="font-mono text-[10px] text-(--accent-primary)">0{idx + 1}</span>
								<h3 className="trim font-bold">{title}</h3>
							</div>
							<div className="flex items-stretch gap-3">
								<span className="mx-1 w-1 shrink-0 rounded-full bg-(--accent-primary)/70 md:hidden" />
								<p className="not-xl:trim text-sm text-(--text-disabled)">{description}</p>
							</div>
						</div>
					))}
				</div>
			</section>
			<section className="flex flex-col gap-6">
				<div className="flex items-center justify-between border-b border-(--border-primary) pb-2">
					<Labels titles={['DEVELOPMENT', 'BACKEND', 'INFRASTRUCTURE']} />
					<h2 className="trim text-xl font-bold">Не только интерфейс</h2>
				</div>
				<div className="grid gap-3 lg:grid-cols-[0.9fr_1.1fr] lg:gap-10">
					<div className="flex flex-col gap-3 text-sm leading-relaxed text-(--text-secondary)">
						<p>
							OneMate давно вышел за рамки интерфейсного проекта. За клиентской частью работают
							собственный API, авторизация, серверная логика и фоновые процессы.
						</p>
						<p>
							Backend, база данных и инфраструктура развиваются вместе с интерфейсом, поэтому новые
							возможности затрагивают сразу несколько уровней приложения.
						</p>
					</div>
					<div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-(--border-primary) bg-(--border-primary) sm:grid-cols-3">
						{technologies.map(({ title, description, Icon }) => (
							<div
								key={title}
								className="flex items-center gap-2 bg-(--bg-secondary) px-2.5 py-3 transition-colors hover:bg-white/5"
							>
								<Icon className="size-6 shrink-0 text-(--text-secondary) md:size-8" stroke={1.5} />
								<div className="flex flex-col">
									<div className="text-sm font-bold">{title}</div>
									<div className="trim mt-0.5 text-xs text-(--text-disabled)">{description}</div>
								</div>
							</div>
						))}
					</div>
				</div>
			</section>
			<section className="flex flex-col gap-6">
				<div className="flex items-end justify-between border-b border-(--border-primary) pb-2">
					<h2 className="trim text-xl font-bold">Как я подхожу к проекту</h2>
					<Labels titles={['PRACTICALITY', 'CONSISTENCY', 'EVOLUTION']} />
				</div>
				<div className="grid gap-8 md:grid-cols-[minmax(0,30rem)_minmax(0,30rem)] md:justify-evenly">
					{principles.map(([title, description], idx) => (
						<div key={title} className="group flex flex-col gap-3">
							<div className="flex items-center gap-3">
								<span className="font-mono text-[10px] text-(--accent-primary)">0{idx + 1}</span>
								<h3 className="font-bold">{title}</h3>
							</div>
							<div className="flex items-stretch gap-3">
								<span className="mx-1 w-1 shrink-0 rounded-full bg-(--accent-primary)/70 transition-opacity group-hover:opacity-100 xl:opacity-0" />
								<p className="trim text-sm text-(--text-disabled)">{description}</p>
							</div>
						</div>
					))}
				</div>
			</section>
			<section className="rounded-xl border border-(--border-primary) bg-(--bg-secondary)">
				<div className="p-6 md:p-7">
					<div className="flex items-center gap-2 font-mono text-[9px] tracking-wider text-(--text-disabled)">
						<IconPointFilled className="size-3 animate-pulse text-(--status-success)" />
						<span className="trim">ACTIVE DEVELOPMENT</span>
					</div>
					<h2 className="mt-3 text-lg font-bold">OneMate – проект в процессе</h2>
					<p className="mt-2 max-w-2xl text-sm leading-relaxed text-(--text-secondary)">
						Здесь нет фиксированной финальной версии: приложение постепенно меняется, дополняется и
						перерабатывается по мере появления новых задач.
					</p>
				</div>
				<div className="flex flex-col gap-4 border-t border-(--border-primary) px-6 py-4 sm:flex-row sm:items-center sm:justify-between md:px-7">
					<div className="text-sm font-medium text-(--text-disabled)">
						Есть идея, нашли ошибку или хотите что-то предложить?
					</div>
					<a
						className="inline-flex max-w-40 shrink-0 items-center gap-2 rounded-lg bg-(--bg-tertiary) px-4 py-2 text-sm font-bold transition-colors not-xl:mx-auto hover:text-(--accent-primary)"
						href="mailto:defrazo@inbox.ru"
					>
						<IconMail className="size-4" />
						Написать мне
					</a>
				</div>
			</section>
		</div>
	);
};

const Labels = ({ titles }: { titles: string[] }) => (
	<div className="hidden items-center gap-x-3 font-mono text-[10px] tracking-wide text-(--text-disabled) sm:flex">
		<span className="trim transition-colors hover:text-(--accent-primary)">{titles[0]}</span>
		<span>/</span>
		<span className="trim transition-colors hover:text-(--accent-primary)">{titles[1]}</span>
		<span>/</span>
		<span className="trim transition-colors hover:text-(--accent-primary)">{titles[2]}</span>
	</div>
);
