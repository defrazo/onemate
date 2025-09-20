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
					Этот проект является экспериментальным, но реализует принципы публичного веб-приложения.
					Администрация OneMate уважает конфиденциальность пользователя и старается сохранять только ту
					информацию, которая действительно необходима для работы веб-приложения. Ниже описано, какие данные
					собираются, как они используются и где хранятся.
				</p>
			</header>
			<article className="print-content flex flex-col gap-4 text-justify">
				<ArticleSection first id="data-we-collect" title="1. Какие данные мы собираем">
					<ul className="list-default">
						<li>
							При авторизации пользователя, его профиль сохраняется в защищенной базе данных{' '}
							<a
								className="text-[var(--accent-default)] hover:text-[var(--accent-hover)] hover:underline print:text-black"
								href="https://supabase.com/"
							>
								Supabase
							</a>{' '}
							— облачной платформе, на которой построена система авторизации. Сохраняются такие данные,
							как имя, фамилия, дата рождения, пол, e-mail и телефон (если пользователь их укажет). Также
							сохраняются данные заметок, настройки темы и другие пользовательские предпочтения, связанные
							с работой веб-приложения.
						</li>
						<li>
							Дополнительно при каждой авторизации в базу сохраняется IP-адрес, город, регион, браузер и
							тип устройства. Эти данные нужны исключительно для истории входов и защиты от подозрительной
							активности.{' '}
							<span className="text-[var(--color-disabled)] italic">
								Примечание: город и регион определяются приблизительно на основе публичных IP-данных.
							</span>
						</li>
						<li>
							Помимо этого при каждой авторизации в браузере пользователя (в localStorage) сохраняются
							данные о сессии, пользователе и другие данные, которые не связаны с пользователем, но
							необходимы для корректной работы веб-приложения.
						</li>
					</ul>
				</ArticleSection>
				<ArticleSection id="where-data-stored" title="2. Где хранятся данные">
					<ul className="list-default">
						<li>
							Профиль пользователя, данные заметок, данные о местоположении, IP-адрес и история входов
							хранятся в Supabase.
						</li>
						<li>
							Данные о сессии, пользователе и другие данные, не содержащие личную информацию, но
							необходимые для корректной работы веб-приложения хранятся в localStorage.
						</li>
					</ul>
				</ArticleSection>
				<ArticleSection id="data-usage" title="3. Как используются данные">
					<ul className="list-default">
						<li>
							Данные профиля — для отображения в интерфейсе и предоставления более персонализированного
							пользовательского опыта.
						</li>
						<li>Данные заметок — для отображения в интерфейсе.</li>
						<li>Настройки темы и пользовательские предпочтения — для персонализации интерфейса.</li>
						<li>
							Информация о входах — для отображения в интерфейсе истории авторизации (можно очистить).
						</li>
					</ul>
				</ArticleSection>
				<ArticleSection id="storage-security" title="4. Хранение и безопасность">
					<ul className="list-default">
						<li>
							Supabase обеспечивает безопасность хранения данных, включая авторизацию, шифрование и
							резервное копирование.
						</li>
						<li>Данные в базе хранятся до удаления аккаунта пользователем или по решению администрации.</li>
						<li>
							Локальные настройки (в localStorage) доступны только на устройстве пользователя и никогда не
							передаются на сервер.
						</li>
					</ul>
				</ArticleSection>
				<ArticleSection id="third-party" title="5. Сторонние сервисы">
					<ul className="list-default">
						<li>
							Проект не использует сторонние сервисы аналитики (например, Google Analytics) и не
							отправляет данные пользователя третьим лицам.
						</li>
					</ul>
				</ArticleSection>
				<ArticleSection id="cookies" title="6. Использование куки">
					<ul className="list-default">
						<li>
							Сайт не использует сторонние куки и трекеры. Все данные хранятся либо в localStorage, либо в
							Supabase. Куки могут автоматически создаваться браузером или системой авторизации Supabase,
							но они не используются в рекламных или аналитических целях администрацией OneMate.
						</li>
					</ul>
				</ArticleSection>
				<ArticleSection id="policy-changes" title="7. Изменения в политике">
					<ul className="list-default">
						<li>
							Администрация OneMate может в любое время обновить политику конфиденциальности. В случае
							существенных изменений пользователь будет уведомлен. Новая версия вступает в силу с момента
							публикации на данной странице.
						</li>
					</ul>
				</ArticleSection>
				<ArticleSection id="data-deletion" title="8. Удаление данных и контакты">
					<ul className="list-default">
						<li>
							Если пользователь захочет удалить свой аккаунт и все связанные с ним данные, он может
							сделать это в личном кабинете (в разделе «Профиль» / «Безопасность»). Аккаунт пользователя
							будет заморожен на 30 дней с возможностью восстановления. По истечении данного периода
							аккаунт и данные пользователя будут безвозвратно удалены.
						</li>
					</ul>
				</ArticleSection>
				<ArticleSection id="contacts" title="9. Контакты">
					<ul className="list-default">
						<li>
							Если у вас есть вопросы или пожелания, напишите нам на{' '}
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
				<p className="text-center text-xs text-[var(--color-disabled)] md:text-sm">
					Версия: 1.1. Обновлено: 01 августа 2025 года. Актуально с 01 августа 2025 года.
				</p>
			</article>
		</>
	);
};

export default PrivacyPolicyPage;
