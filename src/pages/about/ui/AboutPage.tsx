import { usePageTitle } from '@/shared/lib/hooks';
import { Divider } from '@/shared/ui';
import { CheckCircle2, Mail, MonitorSmartphone, Rocket, Shield, Zap } from 'lucide-react';
import { FeatureCard, Section, TechIcon } from '.';
import { features, principles, stack } from '../lib';

const AboutPage = () => {
	usePageTitle('О проекте');

	return (
		<div className="mx-auto flex flex-col justify-between gap-4 xl:max-w-4xl xl:gap-6">
			<div className="core-semiborder relative flex cursor-default flex-col items-center gap-2 overflow-hidden !rounded-3xl p-6 text-center shadow-[var(--shadow)] select-none md:p-10">
				<div
					style={{
						background:
							'linear-gradient(to bottom right, var(--accent-default), var(--accent-default-op), var(--accent-default))',
					}}
					className="absolute inset-0 -z-10"
				/>
				<h1 className="text-xl leading-tight font-bold text-balance text-[var(--accent-text)] md:text-4xl">
					OneMate – ваш центр личной продуктивности
				</h1>
				<p className="max-w-3xl leading-snug text-[var(--accent-text)] opacity-80">
					Управляйте временем, задачами и заметками в одном месте. Гибкие виджеты, чистый интерфейс и
					отзывчивый дизайн помогают фокусироваться на важном и успевать больше без лишнего стресса.
				</p>
				<div className="mt-2 flex items-center gap-2 rounded-full bg-[var(--accent-text)] px-3 py-1 text-xs leading-tight text-[#39393a] md:text-sm">
					<Rocket className="size-4 hover:animate-spin" />
					<span>v1.1</span>
					<span>•</span>
					<span>активно развивается</span>
				</div>
			</div>
			<Section title="Что внутри">
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
					{features.map((feature) => (
						<FeatureCard key={feature.title} {...feature} />
					))}
				</div>
			</Section>
			<Section title="Технологический стек">
				<p className="cursor-default text-justify leading-relaxed opacity-80 select-none">
					В OneMate используется современный фронтенд-стек: <b>React</b> + <b>TypeScript</b> для предсказуемой
					разработки, <b>MobX</b> для реактивного состояния и <b>Supabase</b> как быстрый способ развернуть
					хранение данных и авторизацию. <b>Vite</b> обеспечивает мгновенную сборку и комфортную разработку, а
					<b> Tailwind CSS</b> помогает быстро и гибко создавать адаптивный интерфейс с акцентом на чистоту и
					единообразие дизайна.
				</p>
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
					{stack.map((tech) => (
						<TechIcon key={tech.label} label={tech.label} hint={tech.hint} svg={tech.svg} />
					))}
				</div>
			</Section>
			<Section title="Принципы дизайна и качества">
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
					{principles.map((principle) => (
						<FeatureCard key={principle.title} {...principle} />
					))}
				</div>
			</Section>
			<Section title="Обратная связь">
				<div className="core-semiborder relative flex cursor-default flex-col items-center overflow-hidden !rounded-3xl text-center shadow-[var(--shadow)] select-none">
					<div
						style={{
							background:
								'linear-gradient(to bottom right, var(--accent-default), var(--accent-default-op), var(--accent-default))',
						}}
						className="absolute inset-0 -z-10"
					/>
					<div className="flex w-full flex-col items-center gap-2 p-6 md:flex-row md:justify-between md:p-10">
						<div className="flex flex-col text-[var(--accent-text)]">
							<div className="mb-1 text-xl font-semibold">Есть идея или нашли баг?</div>
							<p className="text-justify text-sm opacity-80">
								Пишите мне – ваши предложения и замечания помогают сделать OneMate лучше для всех.
							</p>
						</div>
						<div className="flex items-center gap-2">
							<a
								className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent-text)] px-3 py-2 text-sm font-semibold text-[#39393a] transition-transform duration-500 hover:scale-[1.15]"
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
