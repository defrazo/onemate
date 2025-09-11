import { usePageTitle } from '@/shared/lib/hooks';
import { Divider, TableOfContents } from '@/shared/ui';

const DemoInfoPage = () => {
	usePageTitle('Демо');

	return (
		<div className="relative mx-auto flex max-w-4xl items-start">
			<TableOfContents />
			<div className="print-container flex flex-col items-center gap-4 px-4 py-12">
				<h1 className="cursor-default text-center text-4xl font-bold">О демо-режиме OneMate</h1>
				<section className="flex w-full flex-col gap-4 text-justify">
					<p className="text-justify leading-relaxed">
						Коротко объясняем, что это за режим, зачем он нужен и чем отличается от полной версии.
					</p>
				</section>
				<Divider />
				<section className="flex w-full flex-col gap-4 text-justify">
					<h2 className="scroll-mt-72 text-xl font-semibold md:scroll-mt-72" id="what">
						Что такое демо-режим
					</h2>
					<p className="text-justify leading-relaxed">
						Демо-режим предназначен для быстрого знакомства с продуктом без ввода персональных данных. Он
						имитирует ключевые пользовательские сценарии и даёт понять, как выглядит интерфейс и логика
						работы.
					</p>
				</section>
				<Divider />
				<section className="flex w-full flex-col gap-4 text-justify">
					<h2 className="scroll-mt-24 text-xl font-semibold md:scroll-mt-32" id="limits">
						Ограничения
					</h2>
					<ul className="list-disc space-y-1 pl-5">
						<li>Данные не сохраняются между сессиями.</li>
						<li>Часть функций может быть недоступна (экспорт, интеграции и т.п.).</li>
						<li>Ограничено количество сущностей (проекты, записи, файлы и др.).</li>
						<li>Нет обработки персональных данных и фоновых задач.</li>
					</ul>
				</section>
				<Divider />
				<section className="flex w-full flex-col gap-4 text-justify">
					<h2 className="scroll-mt-24 text-xl font-semibold md:scroll-mt-32" id="available">
						Что доступно
					</h2>
					<ul className="list-disc space-y-1 pl-5">
						<li>Основные сценарии навигации и взаимодействия с интерфейсом.</li>
						<li>Базовые операции с данными в пределах сессии.</li>
						<li>Примеры отчётов и экранов для оценки UX.</li>
					</ul>
				</section>
				<Divider />
				<section className="flex w-full flex-col gap-4 text-justify">
					<h2 className="scroll-mt-24 text-xl font-semibold md:scroll-mt-32" id="upgrade">
						Как перейти на полную версию
					</h2>
					<p className="text-justify leading-relaxed">
						Зарегистрируйтесь/войдите в аккаунт и оформите доступ к полной версии.
					</p>
				</section>
				<Divider />
				<section className="flex w-full flex-col gap-4 text-justify">
					<h2 className="scroll-mt-24 text-xl font-semibold md:scroll-mt-32" id="privacy">
						Обработка данных
					</h2>
					<p className="text-justify leading-relaxed">
						В демо-режиме персональные данные не обрабатываются и не сохраняются. Подробности — в{' '}
						<a className="underline hover:opacity-100" href="/privacy-policy">
							Политике конфиденциальности
						</a>
						.
					</p>
				</section>
				<Divider />
				<section className="flex w-full flex-col gap-2 text-justify">
					<h2 className="scroll-mt-24 text-xl font-semibold md:scroll-mt-32" id="faq">
						FAQ
					</h2>
					<details className="core-border mb-2 px-3 py-2 transition-colors hover:border-[var(--accent-hover)]">
						<summary className="cursor-pointer font-medium">
							Почему мои данные пропадают после перезагрузки?
						</summary>
						<p className="mt-2 text-sm">
							В демо-режиме данные хранятся только в рамках текущей сессии и не записываются в постоянное
							хранилище.
						</p>
					</details>
					<details className="core-border mb-2 px-3 py-2 transition-colors hover:border-[var(--accent-hover)]">
						<summary className="cursor-pointer font-medium">Как получить доступ ко всем функциям?</summary>
						<p className="mt-2 text-sm">Оформите полную версию — после входа ограничения будут сняты.</p>
					</details>
					<details className="core-border mb-2 px-3 py-2 transition-colors hover:border-[var(--accent-hover)]">
						<summary className="cursor-pointer font-medium">Как получить доступ ко всем функциям?</summary>
						<p className="mt-2 text-sm">Оформите полную версию — после входа ограничения будут сняты.</p>
					</details>
					<details className="core-border mb-2 px-3 py-2 transition-colors hover:border-[var(--accent-hover)]">
						<summary className="cursor-pointer font-medium">Как получить доступ ко всем функциям?</summary>
						<p className="mt-2 text-sm">Оформите полную версию — после входа ограничения будут сняты.</p>
					</details>
				</section>
				<Divider />
				<section className="flex w-full flex-col gap-4 text-justify">
					<h2 className="scroll-mt-24 text-xl font-semibold md:scroll-mt-32" id="contacts">
						Обратная связь
					</h2>
					<p className="text-justify leading-relaxed">
						Есть идеи, вопросы или замечания? Пишите на{' '}
						<a className="text-[var(--accent-default)] underline" href="mailto:defrazo@inbox.ru">
							defrazo@inbox.ru
						</a>
						.
					</p>
				</section>
			</div>
		</div>
	);
};

export default DemoInfoPage;
