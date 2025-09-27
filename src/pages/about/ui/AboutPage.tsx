import { usePageTitle } from '@/shared/lib/hooks';
import { Divider } from '@/shared/ui';
import { CheckCircle2, Mail, MonitorSmartphone, Rocket, Shield, Zap } from 'lucide-react';
import { FeatureCard, Section, TechIcon } from '.';
import { features, principles, stack } from '../lib';

const AboutPage = () => {
	usePageTitle('О проекте');

	return (
		<div className="mobile-pad mx-auto flex max-w-4xl flex-col justify-between gap-2 xl:gap-6">
			<header className="relative flex cursor-default flex-col items-center gap-2 overflow-hidden rounded-3xl border border-[var(--border-color)]/50 bg-[var(--bg-primary)]/40 p-6 text-center shadow-[var(--shadow)] select-none md:p-10">
				<div className="absolute inset-0 -z-10 bg-gradient-to-br from-[var(--accent-default)]/30 via-transparent to-[var(--accent-hover)]/20" />
				<h1 className="text-2xl leading-tight font-bold text-balance md:text-4xl">
					OneMate – ваш центр личной продуктивности
				</h1>
				<p className="max-w-3xl opacity-80">
					Управляйте временем, задачами и заметками в одном месте. Гибкие виджеты, чистый интерфейс и
					отзывчивый дизайн помогают фокусироваться на важном и успевать больше без лишнего стресса.
				</p>
				<div className="flex items-center gap-2 rounded-full bg-[var(--bg-tertiary)]/50 px-3 py-1 text-sm">
					<Rocket className="size-4" /> <span>v1.1</span> <span>•</span> <span>активно развивается</span>
				</div>
			</header>
			<Section title="Что внутри">
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{features.map((feature) => (
						<FeatureCard key={feature.title} {...feature} />
					))}
				</div>
			</Section>
			<Section title="Технологический стек">
				<p className="cursor-default text-justify leading-relaxed opacity-80 select-none">
					В OneMate используется современный фронтенд-стек: React + TypeScript для предсказуемой разработки,
					MobX для реактивного состояния и Supabase как быстрый способ развернуть хранение данных и
					авторизацию. Vite обеспечивает мгновенную сборку и комфортную разработку.
				</p>
				<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
					{stack.map((tech) => (
						<TechIcon key={tech.label} label={tech.label} hint={tech.hint} svg={tech.svg} />
					))}
				</div>
			</Section>
			<Section title="Принципы дизайна и качества">
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{principles.map((principle) => (
						<FeatureCard key={principle.title} {...principle} />
					))}
				</div>
			</Section>
			<Section title="Обратная связь">
				<div className="relative flex cursor-default flex-col items-center justify-between overflow-hidden rounded-3xl border border-[var(--border-color)]/50 bg-[var(--bg-primary)]/40 shadow-[var(--shadow)] select-none">
					<div className="absolute inset-0 -z-10 bg-gradient-to-br from-[var(--accent-default)]/30 via-transparent to-[var(--accent-hover)]/20" />
					<div className="flex w-full flex-col items-center gap-2 p-6 md:flex-row md:justify-between md:p-10">
						<div className="flex flex-col">
							<div className="mb-1 text-base font-semibold">Есть идея или нашли баг?</div>
							<p className="text-justify text-sm opacity-80">
								Пишите мне – ваши предложения и замечания помогают сделать OneMate лучше для всех.
							</p>
						</div>
						<div className="flex items-center gap-2">
							<a
								className="inline-flex items-center gap-2 rounded-xl border border-[var(--accent-default)]/40 px-3 py-2 text-sm hover:bg-[var(--accent-default)]/10"
								href="mailto:defrazo@inbox.ru"
							>
								<Mail className="size-4" />
								defrazo@inbox.ru
							</a>
						</div>
					</div>
				</div>
			</Section>
			<div className="hidden flex-col gap-4 lg:flex">
				<Divider />
				<div className="flex items-center justify-between text-xs opacity-70 select-none">
					<div className="flex items-center gap-4">
						<div className="flex gap-1">
							<CheckCircle2 className="size-4" />
							Стабильно на проде
						</div>
						•
						<div className="flex gap-1">
							<Shield className="size-4" />
							Данные под контролем
						</div>
						•
						<div className="flex gap-1">
							<MonitorSmartphone className="size-4" />
							Доступно с любых устройств
						</div>
						•
						<div className="flex gap-1">
							<Zap className="size-4" />
							Мгновенный отклик
						</div>
					</div>
					<div>© {new Date().getFullYear()} OneMate</div>
				</div>
			</div>
		</div>
	);
};

export default AboutPage;
