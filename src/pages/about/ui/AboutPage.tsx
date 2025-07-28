import { usePageTitle } from '@/shared/lib/hooks';
import { Divider } from '@/shared/ui';

const AboutPage = () => {
	usePageTitle('О проекте');

	return (
		<div className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-12">
			<h1 className="text-center text-4xl font-bold">О проекте OneMate</h1>
			<section className="text">
				<p className="text-justify leading-relaxed">
					OneMate — это современное веб-приложение, созданное для тех, кто хочет легко и эффективно управлять
					своим временем и задачами. Мы объединяем удобные инструменты в одном месте: календарь, заметки,
					канбан-доску, конвертер валют и калькулятор.
				</p>
			</section>
			<Divider />
			<section className="text">
				<h2 className="mb-3 text-2xl font-semibold">Почему был создан OneMate</h2>
				<p className="text-justify leading-relaxed">
					Часто бывает сложно держать под контролем все задачи и планы. Наша миссия — сделать это просто, без
					лишнего стресса и перегрузок. Мы хотим дать каждому возможность быстро настроить свой рабочий
					процесс и больше успевать.
				</p>
			</section>
			<Divider />
			<section className="text">
				<h2 className="mb-3 text-2xl font-semibold">Кому это нужно</h2>
				<p className="text-justify leading-relaxed">
					OneMate отлично подходит студентам, фрилансерам, предпринимателям и всем, кто хочет организовать
					свою жизнь и работу. Простота использования и доступность — наш главный приоритет.
				</p>
			</section>
			<Divider />
			<section className="text">
				<h2 className="mb-3 text-2xl font-semibold">Технологии</h2>
				<p className="text-justify leading-relaxed">
					Проект построен на React, MobX и Supabase, что позволяет обеспечивать быструю и надежную работу с
					удобным интерфейсом.
				</p>
			</section>
			<Divider />
			<section>
				<h2 className="mb-3 text-2xl font-semibold">Обратная связь</h2>
				<p className="text-justify leading-relaxed">
					Есть идеи, вопросы или замечания? Пишите на{' '}
					<a className="text-[var(--accent-default)] underline" href="mailto:defrazo@inbox.ru">
						defrazo@inbox.ru
					</a>
					.
				</p>
			</section>
		</div>
	);
};

export default AboutPage;
