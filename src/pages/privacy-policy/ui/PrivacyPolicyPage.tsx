import { ArticleSection, PrintButton } from '@/shared/ui';

const PrivacyPolicyPage = () => {
	return (
		<>
			<header className="flex flex-col items-center">
				<div className="flex items-center gap-2">
					<h1 className="print-header cursor-default text-center text-xl leading-tight font-bold md:text-3xl">
						Политика конфиденциальности
					</h1>
					<PrintButton />
				</div>
				<p className="print-content text-justify text-[var(--color-disabled)]">
					Этот проект является экспериментальным, но реализован в виде публичного веб-приложения (далее –
					«Приложение»), доступного для демонстрации. Администрация OneMate (далее – «Администрация») уважает
					конфиденциальность пользователей и сообщает, что Приложение не обрабатывает и не хранит персональные
					данные на сервере. Ниже описано, какие данные могут использоваться, как они применяются и где
					хранятся.
				</p>
			</header>
			<article className="print-content flex flex-col gap-4 text-justify">
				<ArticleSection first id="data-we-collect" title="1. Какие данные мы собираем">
					<ul className="list-default">
						<li>
							Приложение не запрашивает и не сохраняет персональные данные (ФИО, дата рождения, e-mail,
							телефон, город и т. п.).
						</li>
						<li>
							В интерфейсе используются предзаполненные обезличенные данные, которые пользователь может
							изменять. Все изменения сохраняются только локально в браузере (localStorage) и не
							передаются на сервер.
						</li>
						<li>
							Приложение предназначено для демонстрации. Просим не вводить конфиденциальную информацию
							(пароли, платежные данные, адреса, медицинские сведения и иные чувствительные данные).
						</li>
					</ul>
				</ArticleSection>
				<ArticleSection id="where-data-stored" title="2. Где хранятся данные">
					<ul className="list-default">
						<li>
							Все пользовательские изменения (заметки, настройки темы и предпочтения) хранятся
							исключительно в localStorage браузера.
						</li>
						<li>
							Эти данные доступны только на устройстве пользователя и удаляются при очистке кэша, истории
							браузера или данных сайта.
						</li>
					</ul>
				</ArticleSection>
				<ArticleSection id="data-usage" title="3. Использование данных">
					<ul className="list-default">
						<li>
							Информация применяется только для отображения интерфейса и демонстрации работы Приложения.
						</li>
						<li>Данные не используются для идентификации личности и не передаются третьим лицам.</li>
					</ul>
				</ArticleSection>
				<ArticleSection id="storage-security" title="4. Хранение и безопасность">
					<ul className="list-default">
						<li>
							Поскольку данные хранятся исключительно локально, их сохранность зависит от настроек
							браузера и устройства пользователя.
						</li>
						<li>Администрация не имеет доступа к информации, введенной пользователем.</li>
					</ul>
				</ArticleSection>
				<ArticleSection id="third-party" title="5. Сторонние сервисы">
					<ul className="list-default">
						<li>
							Приложение не использует сторонние сервисы аналитики и рекламы и не передает данные третьим
							лицам в этих целях.
						</li>
						<li>
							При входе в общий демо-аккаунт (через кнопку «Войти как гость») используется провайдер
							аутентификации Supabase. В рамках авторизации Supabase может обрабатывать технические данные
							соединения (например, IP-адрес, сведения о браузере/устройстве) исключительно для целей
							авторизации и безопасности. Эти данные не сохраняются в базе Приложения, не передаются
							Администрации OneMate и не используются Администрацией для идентификации пользователей.
							Подробности см. в{' '}
							<a
								className="text-[var(--accent-default)] hover:text-[var(--accent-hover)] hover:underline print:text-black"
								href="https://supabase.com/privacy"
								target="_blank"
								rel="noopener noreferrer"
							>
								политике конфиденциальности Supabase
							</a>
							.
						</li>
					</ul>
				</ArticleSection>
				<ArticleSection id="cookies" title="6. Использование cookie-файлов">
					<ul className="list-default">
						<li>
							Приложение не применяет сторонние рекламные или аналитические трекеры. Технические
							cookie-файлы могут устанавливаться браузером и/или провайдером аутентификации Supabase
							исключительно для обеспечения авторизации и корректной работы. Администрация не использует
							cookie для профилирования пользователей.
						</li>
					</ul>
				</ArticleSection>
				<ArticleSection id="policy-changes" title="7. Изменения в политике">
					<ul className="list-default">
						<li>
							Администрация может в любое время обновить политику конфиденциальности. Актуальная версия
							политики всегда доступна на этой странице. Новая версия вступает в силу с момента
							публикации.
						</li>
					</ul>
				</ArticleSection>
				<ArticleSection id="data-deletion" title="8. Удаление данных">
					<ul className="list-default">
						<li>
							Для удаления всех данных очистите локальное хранилище (localStorage) и кэш браузера/данные
							сайта для домена Приложения, либо перезайдите в демо-аккаунт. После этого интерфейс вернется
							к предзаполненным обезличенным значениям.
						</li>
					</ul>
				</ArticleSection>
				<ArticleSection id="contacts" title="9. Контакты">
					<ul className="list-default">
						<li>
							По вопросам, связанным с Приложением, можно написать на:{' '}
							<a
								className="text-[var(--accent-default)] hover:text-[var(--accent-hover)] hover:underline print:text-black"
								href="mailto:defrazo@inbox.ru"
							>
								defrazo@inbox.ru
							</a>
							.
						</li>
					</ul>
				</ArticleSection>
				<ArticleSection id="tos-link" title="10. Связь с Пользовательским соглашением">
					<ul className="list-default">
						<li>
							Настоящая Политика является частью{' '}
							<a
								className="text-[var(--accent-default)] hover:text-[var(--accent-hover)] hover:underline print:text-black"
								href="/terms-of-service"
							>
								Пользовательского соглашения
							</a>{' '}
							и применяется совместно с ним.
						</li>
					</ul>
				</ArticleSection>
				<p className="text-center text-xs text-[var(--color-disabled)] md:text-sm" data-version="1.1">
					Версия: 1.1. Обновлено: 01 августа 2025 года. Актуально с 01 августа 2025 года.
				</p>
			</article>
		</>
	);
};

export default PrivacyPolicyPage;
