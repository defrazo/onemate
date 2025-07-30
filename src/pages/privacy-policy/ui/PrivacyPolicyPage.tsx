import { usePageTitle } from '@/shared/lib/hooks';
import { Divider, PrintButton } from '@/shared/ui';

const PrivacyPolicyPage = () => {
	usePageTitle('Политика конфиденциальности');

	return (
		<div className="print-container mx-auto flex max-w-3xl flex-col items-center gap-8 px-4 py-12">
			<header className="text-center">
				<div className="mb-2 flex items-center justify-center gap-2">
					<h1 className="cursor-default text-4xl font-bold">Политика конфиденциальности</h1>
					<PrintButton />
				</div>
				<p className="print-content text-sm leading-relaxed text-[var(--color-disabled)]">
					OneMate уважает вашу конфиденциальность и стремится защитить вашу личную информацию. В данном
					документе описано, какие данные мы собираем, как мы их используем и какие у вас есть права.
				</p>
			</header>
			<section className="print-content flex flex-col gap-4">
				<h2 className="text-xl font-semibold">1. Какие данные мы собираем</h2>
				<p className="text-justify leading-relaxed">Мы можем собирать:</p>
				<ul className="pl-4 text-justify">
					<li className="list-disc">Имя, адрес электронной почты и другую информацию при регистрации.</li>
					<li className="list-disc">
						Техническую информацию: IP-адрес, тип устройства, браузер, язык и т.д.
					</li>
					<li className="list-disc">
						Данные, которые вы добровольно вводите (например, в виджетах профиля, заметках, календаре и
						т.д.)
					</li>
				</ul>
			</section>
			<Divider />
			<section className="print-content flex w-full flex-col gap-4">
				<h2 className="text-xl font-semibold">2. Как мы используем ваши данные</h2>
				<p className="text-justify leading-relaxed">Собранная информация используется:</p>
				<ul className="pl-4">
					<li className="list-disc">Для предоставления и улучшения наших сервисов.</li>
					<li className="list-disc">Для персонализации интерфейса.</li>
					<li className="list-disc">Для обратной связи и поддержки.</li>
					<li className="list-disc">Для аналитики и улучшения пользовательского опыта.</li>
				</ul>
			</section>
			<Divider />
			<section className="print-content flex w-full flex-col gap-4">
				<h2 className="text-xl font-semibold">3. Кто имеет доступ к данным</h2>
				<p className="text-justify leading-relaxed">
					Мы не продаем ваши данные третьим лицам. Доступ к информации могут иметь:
				</p>
				<ul className="pl-4">
					<li className="list-disc">Сервисы хранения и авторизации (в частности, Supabase).</li>
					<li className="list-disc">Команда разработки (только в случае необходимости).</li>
				</ul>
			</section>
			<Divider />
			<section className="print-content flex w-full flex-col gap-4">
				<h2 className="text-xl font-semibold">4. Хранение и безопасность</h2>
				<ul className="pl-4">
					<li className="list-disc">Данные хранятся в защищенной базе данных.</li>
					<li className="list-disc">Применяются стандартные меры безопасности.</li>
					<li className="list-disc">
						Вы можете запросить удаление своих данных, написав на{' '}
						<a className="text-[var(--accent-default)] underline" href="mailto:defrazo@inbox.ru">
							defrazo@inbox.ru
						</a>
						.
					</li>
				</ul>
			</section>
			<Divider />
			<section className="print-content flex w-full flex-col gap-4">
				<h2 className="text-xl font-semibold">5. Права пользователя</h2>
				<p className="text-justify leading-relaxed">Вы имеете право:</p>
				<ul className="pl-4">
					<li className="list-disc">Получить информацию о том, какие данные мы храним.</li>
					<li className="list-disc">Изменить или удалить свои данные.</li>
					<li className="list-disc">Отозвать согласие на обработку данных.</li>
				</ul>
			</section>
			<Divider />
			<section className="print-content flex w-full flex-col gap-4">
				<h2 className="text-xl font-semibold">6. Изменения в политике</h2>
				<p className="text-justify leading-relaxed">
					Мы можем время от времени обновлять политику. Новая версия вступает в силу с момента публикации на
					этой странице.
				</p>
			</section>
			<Divider />
			<section className="print-content flex w-full flex-col gap-4">
				<h2 className="text-xl font-semibold">7. Контакты</h2>
				<p className="text-justify leading-relaxed">
					Если у вас есть вопросы, напишите нам на{' '}
					<a className="text-[var(--accent-default)] underline" href="mailto:defrazo@inbox.ru">
						defrazo@inbox.ru
					</a>
					.
				</p>
			</section>
			<p className="text-sm text-[var(--color-disabled)]">
				Версия: 1.0. Обновлено: 16 марта 2025 года. Актуально с 16 марта 2025 года.
			</p>
		</div>
	);
};

export default PrivacyPolicyPage;
