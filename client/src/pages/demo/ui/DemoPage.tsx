import { ArticleSection } from '@/shared/ui';

export const DemoPage = () => (
	<div className="flex w-full flex-col gap-4">
		<header className="flex flex-col items-center">
			<h1 className="cursor-default text-center text-xl leading-tight font-bold md:text-3xl">О демо-режиме</h1>
			<p className="text-center text-(--color-disabled)">
				Как устроена демонстрационная версия OneMate и какие ограничения в ней действуют.
			</p>
		</header>
		<article className="flex flex-col gap-4">
			<ArticleSection first id="about" number={1} title="Что такое демо-режим">
				<ul className="list-default">
					<li>
						Демо-режим позволяет познакомиться с OneMate без регистрации. При запуске используется
						подготовленный демо-аккаунт с демонстрационными данными, на котором можно посмотреть интерфейс и
						попробовать основные возможности приложения.
					</li>
					<li>
						Изменения в демо-режиме не синхронизируются с сервером и сохраняются локально в текущем
						браузере.
					</li>
				</ul>
			</ArticleSection>
			<ArticleSection id="storage" number={2} title="Как сохраняются изменения">
				<ul className="list-default">
					<li>
						Данные, созданные во время демо-сессии, хранятся локально в браузере. Поэтому изменения видны
						только на текущем устройстве и не переносятся между браузерами или устройствами.
					</li>
					<li>
						После выхода из демо-режима локальные изменения удаляются. Они также могут исчезнуть при очистке
						данных сайта в браузере.
					</li>
				</ul>
			</ArticleSection>
			<ArticleSection id="available" number={3} title="Что доступно">
				<ul className="list-default">
					<li>Навигация по основным разделам OneMate и работа с интерфейсом.</li>
					<li>Создание, редактирование и удаление демонстрационных записей.</li>
					<li>Задачи, канбан, календарь, заметки и другие основные модули приложения.</li>
					<li>Инструменты, которые не требуют передачи пользовательских данных сторонним сервисам.</li>
				</ul>
			</ArticleSection>
			<ArticleSection id="limits" number={4} title="Ограничения">
				<ul className="list-default">
					<li>
						<b>Нет серверной синхронизации.</b> Созданные данные остаются только в текущем браузере.
					</li>
					<li>
						<b>Нет персонального аккаунта.</b> Демо-аккаунт предназначен только для демонстрации и не может
						использоваться как обычная учётная запись.
					</li>
					<li>
						<b>Некоторые функции отключены.</b> Возможности, которым требуется персональный аккаунт или
						передача введённых данных сторонним сервисам, могут быть недоступны.
					</li>
					<li>
						<b>Используются демонстрационные данные.</b> В отдельных разделах могут отображаться заранее
						подготовленные или случайно сгенерированные значения.
					</li>
				</ul>
			</ArticleSection>
			<ArticleSection id="privacy" number={5} title="Данные и конфиденциальность">
				<ul className="list-default">
					<li>
						Для использования демо-режима не требуется указывать имя, e-mail, пароль или другие персональные
						данные. Информацию, которую вы создаёте внутри доступных демо-функций, следует считать временной
						и не использовать для хранения конфиденциальных сведений.
					</li>
					<li>
						Подробнее об обработке данных в OneMate можно узнать в{' '}
						<a
							className="text-(--accent-default) hover:underline"
							href="/privacy"
							rel="noopener noreferrer"
							target="_blank"
						>
							Политике конфиденциальности
						</a>
						, а правила использования приложения описаны в{' '}
						<a
							className="text-(--accent-default) hover:underline"
							href="/terms"
							rel="noopener noreferrer"
							target="_blank"
						>
							Условиях использования
						</a>
						.
					</li>
				</ul>
			</ArticleSection>
			<ArticleSection id="faq" number={6} title="Частые вопросы">
				<div className="flex flex-col">
					<FaqItem
						answer="В демо-режиме отключены возможности, которым требуется персональный аккаунт или передача введённых данных сторонним сервисам."
						question="Почему некоторые функции недоступны?"
					/>
					<FaqItem
						answer="Только локально в текущем браузере. При выходе из демо-режима или очистке данных сайта они будут удалены."
						question="Сохранятся ли мои изменения?"
					/>
					<FaqItem
						answer="Нет. Демо-аккаунт предназначен для знакомства с приложением и не является персональной учётной записью."
						question="Можно ли использовать демо как обычный аккаунт?"
					/>
					<FaqItem
						answer="Демо-режим для этого не предназначен. Не используйте его для хранения паролей, платёжных данных и другой конфиденциальной информации."
						question="Можно ли вводить настоящие данные?"
					/>
					<FaqItem
						answer="Часть информации создаётся специально для демонстрации интерфейса и работы соответствующих функций."
						question="Почему в некоторых разделах отображаются ненастоящие данные?"
					/>
					<FaqItem
						answer="Сейчас OneMate не открыт для публичной регистрации. Демо-режим позволяет познакомиться с доступными возможностями приложения."
						question="Можно ли получить доступ к полной версии?"
					/>
				</div>
			</ArticleSection>
		</article>
	</div>
);

const FaqItem = ({ question, answer }: { question: string; answer: string }) => (
	<details className="group border-(--border-color) py-3 not-last:border-b">
		<summary className="cursor-pointer list-none font-bold transition-colors group-open:text-(--color-primary) hover:text-(--color-primary)">
			{question}
		</summary>
		<p className="mt-2 pr-6 text-sm leading-relaxed text-(--color-secondary)">{answer}</p>
	</details>
);
