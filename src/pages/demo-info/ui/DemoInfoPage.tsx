import { ArticleSection } from '@/shared/ui';

const DemoInfoPage = () => {
	return (
		<>
			<header className="flex flex-col items-center">
				<h1 className="cursor-default text-center text-xl leading-tight font-bold md:text-3xl">
					О демо-режиме OneMate
				</h1>
				<p className="text-justify text-[var(--color-disabled)]">
					Коротко объясняем, что это за режим, зачем он нужен и чем отличается от полной версии.
				</p>
			</header>
			<article className="flex flex-col gap-4 text-justify">
				<ArticleSection first id="what" title="Что такое демо-режим">
					<p className="text-justify leading-relaxed">
						Демо-режим предназначен для быстрого знакомства с продуктом без ввода персональных данных. Он
						имитирует ключевые пользовательские сценарии и даёт понять, как выглядит интерфейс и логика
						работы.
					</p>
				</ArticleSection>
				<ArticleSection id="limits" title="Ограничения">
					<ul className="list-default">
						<li>Данные не сохраняются между сессиями.</li>
						<li>Часть функций может быть недоступна (экспорт, интеграции и т.п.).</li>
						<li>Ограничено количество сущностей (проекты, записи, файлы и др.).</li>
						<li>Нет обработки персональных данных и фоновых задач.</li>
					</ul>
				</ArticleSection>
				<ArticleSection id="available" title="Что доступно">
					<ul className="list-default">
						<li>Основные сценарии навигации и взаимодействия с интерфейсом.</li>
						<li>Базовые операции с данными в пределах сессии.</li>
						<li>Примеры отчётов и экранов для оценки UX.</li>
					</ul>
				</ArticleSection>
				<ArticleSection id="upgrade" title="Как перейти на полную версию">
					<p className="text-justify leading-relaxed">
						Зарегистрируйтесь/войдите в аккаунт и оформите доступ к полной версии.
					</p>
				</ArticleSection>
				<ArticleSection id="privacy" title="Обработка данных">
					<p className="text-justify leading-relaxed">
						В демо-режиме персональные данные не обрабатываются и не сохраняются. Подробности — в{' '}
						<a
							className="text-[var(--accent-default)] hover:text-[var(--accent-hover)] hover:underline print:text-black"
							href="/privacy-policy"
						>
							Политике конфиденциальности
						</a>
						.
					</p>
				</ArticleSection>
				<ArticleSection id="faq" title="FAQ">
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
				</ArticleSection>
			</article>
		</>
	);
};

export default DemoInfoPage;
