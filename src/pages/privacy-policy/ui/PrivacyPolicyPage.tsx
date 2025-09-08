import { usePageTitle } from '@/shared/lib/hooks';
import { Divider, PrintButton, TableOfContents } from '@/shared/ui';

const PrivacyPolicyPage = () => {
	usePageTitle('Политика конфиденциальности');

	return (
		<div className="relative mx-auto flex max-w-4xl items-start">
			<TableOfContents />
			<div className="print-container flex flex-col items-center gap-4 px-4 py-12">
				<header className="flex flex-col items-center justify-between">
					<div className="mb-2 flex items-center justify-center gap-2">
						<h1 className="print-header cursor-default text-4xl font-bold">Политика конфиденциальности</h1>
						<PrintButton />
					</div>
					<p className="print-content text-justify text-sm text-[var(--color-disabled)]">
						Этот проект является экспериментальным, но реализует принципы публичного веб-приложения.
						Администрация OneMate уважает конфиденциальность пользователя и старается сохранять только ту
						информацию, которая действительно необходима для работы веб-приложения. Ниже описано, какие
						данные собираются, как они используются и где хранятся.
					</p>
				</header>
				<Divider />
				<section className="print-content flex w-full flex-col gap-4 text-justify">
					<h2 className="scroll-mt-72 text-xl font-semibold md:scroll-mt-72" id="data-we-collect">
						1. Какие данные мы собираем
					</h2>
					<ul className="list-disc space-y-1 pl-5">
						<li>
							При авторизации пользователя, его профиль сохраняется в защищенной базе данных{' '}
							<a className="underline hover:text-[var(--accent-default)]" href="https://supabase.com/">
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
					<Divider />
					<h2 className="scroll-mt-24 text-xl font-semibold md:scroll-mt-32" id="where-data-stored">
						2. Где хранятся данные
					</h2>
					<ul className="list-disc space-y-1 pl-5">
						<li>
							Профиль пользователя, данные заметок, данные о местоположении, IP-адрес и история входов
							хранятся в Supabase.
						</li>
						<li>
							Данные о сессии, пользователе и другие данные, не содержащие личную информацию, но
							необходимые для корректной работы веб-приложения хранятся в localStorage.
						</li>
					</ul>
					<Divider />
					<h2 className="scroll-mt-24 text-xl font-semibold md:scroll-mt-32" id="data-usage">
						3. Как используются данные
					</h2>
					<ul className="list-disc space-y-1 pl-5">
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
					<Divider />
					<h2 className="scroll-mt-24 text-xl font-semibold md:scroll-mt-32" id="storage-security">
						4. Хранение и безопасность
					</h2>
					<ul className="list-disc space-y-1 pl-5">
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
					<Divider />
					<h2 className="scroll-mt-24 text-xl font-semibold md:scroll-mt-32" id="third-party">
						5. Сторонние сервисы
					</h2>
					<ul className="list-disc space-y-1 pl-5">
						<li>
							Проект не использует сторонние сервисы аналитики (например, Google Analytics) и не
							отправляет данные пользователя третьим лицам.
						</li>
					</ul>
					<Divider />
					<h2 className="scroll-mt-24 text-xl font-semibold md:scroll-mt-32" id="cookies">
						6. Использование куки
					</h2>
					<ul className="list-disc space-y-1 pl-5">
						<li>
							Сайт не использует сторонние куки и трекеры. Все данные хранятся либо в localStorage, либо в
							Supabase. Куки могут автоматически создаваться браузером или системой авторизации Supabase,
							но они не используются в рекламных или аналитических целях администрацией OneMate.
						</li>
					</ul>
					<Divider />
					<h2 className="scroll-mt-24 text-xl font-semibold md:scroll-mt-32" id="policy-changes">
						7. Изменения в политике
					</h2>
					<ul className="list-disc space-y-1 pl-5">
						<li>
							Администрация OneMate может в любое время обновить политику конфиденциальности. В случае
							существенных изменений пользователь будет уведомлен. Новая версия вступает в силу с момента
							публикации на данной странице.
						</li>
					</ul>
					<Divider />
					<h2 className="scroll-mt-24 text-xl font-semibold md:scroll-mt-32" id="data-deletion">
						8. Удаление данных и контакты
					</h2>
					<ul className="list-disc space-y-1 pl-5">
						<li>
							Если пользователь захочет удалить свой аккаунт и все связанные с ним данные, он может
							сделать это в личном кабинете (в разделе «Профиль» / «Безопасность»). Аккаунт пользователя
							будет заморожен на 30 дней с возможностью восстановления. По истечении данного периода
							аккаунт и данные пользователя будут безвозвратно удалены.
						</li>
					</ul>
					<Divider />
					<h2 className="scroll-mt-24 text-xl font-semibold md:scroll-mt-32" id="contacts">
						9. Контакты
					</h2>
					<ul className="list-disc space-y-1 pl-5">
						<li>
							Если у вас есть вопросы или пожелания, напишите нам на{' '}
							<a className="text-[var(--accent-default)] underline" href="mailto:defrazo@inbox.ru">
								defrazo@inbox.ru
							</a>
							.
						</li>
					</ul>
					<Divider />
					<p className="text-center text-sm text-[var(--color-disabled)]">
						Версия: 1.1. Обновлено: 01 августа 2025 года. Актуально с 01 августа 2025 года.
					</p>
				</section>
			</div>
		</div>
	);
};

export default PrivacyPolicyPage;
