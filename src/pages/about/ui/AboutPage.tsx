import { ArticleSection } from '@/shared/ui';

const AboutPage = () => {
	return (
		<>
			<header className="flex flex-col items-center">
				<h1 className="cursor-default text-center text-xl font-bold md:text-3xl">О проекте OneMate</h1>
				<p className="text-justify">
					OneMate — это современное веб-приложение, созданное для тех, кто хочет легко и эффективно управлять
					своим временем и задачами. Мы объединяем удобные инструменты в одном месте: календарь, заметки,
					канбан-доску, конвертер валют и калькулятор.
				</p>
			</header>
			<article className="flex flex-col gap-4 text-justify">
				<ArticleSection id="project-purpose" title="Почему был создан OneMate">
					<p>
						Часто бывает сложно держать под контролем все задачи и планы. Наша миссия — сделать это просто,
						без лишнего стресса и перегрузок. Мы хотим дать каждому возможность быстро настроить свой
						рабочий процесс и больше успевать.
					</p>
				</ArticleSection>
				<ArticleSection id="target-audience" title="Кому это нужно">
					<p>
						OneMate отлично подходит студентам, фрилансерам, предпринимателям и всем, кто хочет организовать
						свою жизнь и работу. Простота использования и доступность — наш главный приоритет.
					</p>
				</ArticleSection>
				<ArticleSection id="technologies" title="Технологии">
					<p>
						Проект построен на React, MobX и Supabase, что позволяет обеспечивать быструю и надежную работу
						с удобным интерфейсом.
					</p>
				</ArticleSection>
				<ArticleSection id="contact" title="Обратная связь">
					<h2 className="mb-3 text-xl font-semibold"></h2>
					<p>
						Есть идеи, вопросы или замечания? Пишите на{' '}
						<a
							className="text-[var(--accent-default)] hover:text-[var(--accent-hover)] hover:underline"
							href="mailto:defrazo@inbox.ru"
						>
							defrazo@inbox.ru
						</a>
						.
					</p>
				</ArticleSection>
			</article>
		</>
	);
};

export default AboutPage;
