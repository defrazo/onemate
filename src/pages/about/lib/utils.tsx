import {
	BookOpenText,
	Calculator,
	Calendar,
	CircleDollarSign,
	CloudSun,
	Eye,
	KanbanSquare,
	Layers,
	ListChecks,
	PencilRuler,
	Settings,
	Shield,
	Smartphone,
	StickyNote,
	Users,
} from 'lucide-react';

export const features = [
	{
		title: 'Калькулятор',
		desc: 'Мгновенные вычисления без переключения вкладок. Поддержка истории результатов.',
		Icon: Calculator,
	},
	{
		title: 'Календарь',
		desc: 'Планируйте дни, недели и месяцы. Поддержка периодов и подсчета календарных дней.',
		Icon: Calendar,
	},
	{
		title: 'Заметки',
		desc: 'Легкие текстовые записи с быстрым сохранением и удобным упорядочиванием.',
		Icon: StickyNote,
	},

	{
		title: 'Конвертер валют',
		desc: 'Быстрый двусторонний конвертер валют с удобным копированием курса и результата.',
		Icon: CircleDollarSign,
	},
	{
		title: 'Погода',
		desc: 'Точный прогноз на день и неделю. Поиск города, автолокация и мгновенное обновление данных.',
		Icon: CloudSun,
	},
	{
		title: 'Переводчик',
		desc: 'Молниеносный перевод текста с поддержкой копирования и двустороннего режима.',

		Icon: BookOpenText,
	},
	{
		title: 'Канбан',
		desc: 'Гибкая доска задач: статусы, приоритеты, сроки. Идеально для личных и командных процессов.',
		Icon: KanbanSquare,
	},
	{
		title: 'ToDo',
		desc: 'Управляй задачами просто: приоритеты, статусы и напоминания в минималистичном интерфейсе.',
		Icon: ListChecks,
	},
	{
		title: 'OneGen',
		desc: 'Быстрый генератор SVG-карточек: создавай аккуратные сетки за считанные минуты.',
		Icon: PencilRuler,
	},
];

export const stack = [
	{
		label: 'React',
		hint: 'Компонентный UI',
		svg: (
			<svg viewBox="0 0 256 256" className="size-6 text-sky-500">
				<circle cx="128" cy="128" r="12" fill="currentColor" />
				<g fill="none" stroke="currentColor" strokeWidth="12">
					<ellipse cx="128" cy="128" rx="80" ry="36" />
					<ellipse cx="128" cy="128" rx="80" ry="36" transform="rotate(60 128 128)" />
					<ellipse cx="128" cy="128" rx="80" ry="36" transform="rotate(120 128 128)" />
				</g>
			</svg>
		),
	},
	{
		label: 'TypeScript',
		hint: 'Надежные типы',
		svg: (
			<svg viewBox="0 0 256 256" className="size-6 text-blue-600">
				<rect width="256" height="256" rx="16" fill="currentColor" opacity="0.12" />
				<text
					x="50%"
					y="58%"
					dominantBaseline="middle"
					textAnchor="middle"
					className="fill-current"
					fontSize="88"
					fontFamily="ui-sans-serif, system-ui"
				>
					TS
				</text>
			</svg>
		),
	},
	{
		label: 'MobX',
		hint: 'Реактивное состояние',
		svg: (
			<svg viewBox="0 0 256 256" className="size-6 text-purple-500">
				<circle cx="64" cy="64" r="18" stroke="currentColor" fill="none" strokeWidth="10" />
				<circle cx="192" cy="192" r="18" stroke="currentColor" fill="none" strokeWidth="10" />
				<path d="M80 80 L176 176" stroke="currentColor" strokeWidth="10" />
			</svg>
		),
	},
	{
		label: 'Tailwind',
		hint: 'Быстрая современная верстка',
		svg: (
			<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="size-6 text-sky-400">
				<path
					fill="currentColor"
					d="M24 9.818C19.2 9.818 16 12.418 14.4 17.618C16.4 15.018 18.8 14.018 21.6 14.618C23.193 14.945 24.328 16.096 25.591 17.377C27.516 19.333 29.678 21.545 33.6 21.545C38.4 21.545 41.6 18.945 43.2 13.745C41.2 16.345 38.8 17.345 36 16.745C34.407 16.418 33.272 15.267 32.009 13.986C30.084 12.03 27.922 9.818 24 9.818ZM14.4 21.455C9.6 21.455 6.4 24.055 4.8 29.255C6.8 26.655 9.2 25.655 12 26.255C13.593 26.582 14.728 27.733 15.991 29.014C17.916 30.97 20.078 33.182 24 33.182C28.8 33.182 32 30.582 33.6 25.382C31.6 27.982 29.2 28.982 26.4 28.382C24.807 28.055 23.672 26.904 22.409 25.623C20.484 23.667 18.322 21.455 14.4 21.455Z"
				/>
			</svg>
		),
	},
	{
		label: 'Supabase',
		hint: 'Бэкенд и БД',
		svg: (
			<svg viewBox="0 0 256 256" className="size-6 text-teal-500">
				<path d="M40 40 L160 40 L96 136 Z" fill="currentColor" opacity="0.85" />
				<path d="M216 216 L96 216 L160 120 Z" fill="currentColor" opacity="0.5" />
			</svg>
		),
	},
	{
		label: 'Vite',
		hint: 'Быстрая сборка',
		svg: (
			<svg viewBox="0 0 256 256" className="size-6 text-yellow-400">
				<path d="M24 64 L232 64 L128 232 Z" fill="currentColor" opacity="0.2" />
				<path d="M96 24 L160 24 L128 96 Z" fill="currentColor" />
			</svg>
		),
	},
];

export const principles = [
	{
		title: 'Чистая архитектура',
		desc: 'Модульность, читабельные слои и явные границы ответственности. Проще тестировать и развивать.',
		Icon: Layers,
	},
	{
		title: 'Гибкость и расширяемость',
		desc: 'Компоненты и модули легко переиспользовать и расширять под новые задачи без переписывания.',
		Icon: Settings,
	},
	{
		title: 'UX без перегруза',
		desc: 'Фокус на важных сценариях, минимализм в цветах и акцентах, доступность и клавиатурная навигация.',
		Icon: Users,
	},
	{
		title: 'Мобильная отзывчивость',
		desc: 'Интерфейс адаптируется под любые экраны и устройства, сохраняя удобство и читаемость.',
		Icon: Smartphone,
	},
	{
		title: 'Стабильность и надежность',
		desc: 'Ошибки обрабатываются предсказуемо, интерфейс устойчив к сбоям и некорректным данным.',
		Icon: Shield,
	},
	{
		title: 'Прозрачность данных',
		desc: 'Пользователь всегда видит, что происходит с его данными: авторизация, сохранение, обновление.',
		Icon: Eye,
	},
];
