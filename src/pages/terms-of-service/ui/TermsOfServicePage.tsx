import { usePageTitle } from '@/shared/lib/hooks';
import { Divider, PrintButton } from '@/shared/ui';

const TermsOfServicePage = () => {
	usePageTitle('Пользовательское соглашение');

	return (
		<div className="print-container mx-auto flex max-w-3xl flex-col items-center gap-8 px-4 py-12">
			<header className="text-center">
				<div className="mb-2 flex items-center justify-center gap-2">
					<h1 className="cursor-default text-4xl font-bold">Пользовательское соглашение</h1>
					<PrintButton />
				</div>
			</header>
			<section className="print-content flex flex-col gap-4">
				<h2 className="text-xl font-semibold">Общие положения</h2>
				<p className="text-justify leading-relaxed">
					Настоящее Пользовательское соглашение (далее — «Соглашение») регулирует отношения между владельцем
					веб-приложения OneMate (далее — «Администрация») и физическим лицом, использующим функционал OneMate
					(далее — «Пользователь»).
				</p>
				<p className="text-justify leading-relaxed">
					Приложение OneMate предоставляет Пользователям инструменты для организации задач и управления
					временем, включая, но не ограничиваясь: калькулятор, конвертер валют, календарь, погоду, заметки,
					переводчик, канбан-доску и список задач.
				</p>
				<p className="text-justify leading-relaxed">
					Используя Приложение, Пользователь подтверждает, что ознакомился с условиями настоящего Соглашения и
					принимает их в полном объеме. Если Пользователь не согласен с условиями Соглашения, он обязан
					прекратить использование Приложения.
				</p>
			</section>
			<Divider />
			<section className="print-content flex flex-col gap-4">
				<h2 className="text-xl font-semibold">Регистрация и учетная запись</h2>
				<p className="text-justify leading-relaxed">
					Для доступа к полному функционалу Приложения необходима регистрация учетной записи.
				</p>
				<p className="text-justify leading-relaxed">
					При регистрации Пользователь обязуется предоставить достоверную и актуальную информацию, включая
					Логин (Имя пользователя), адрес электронной почты (E-mail) и пароль.
				</p>
				<p className="text-justify leading-relaxed">
					Пользователь несет ответственность за сохранность своих регистрационных данных и обязуется не
					передавать их третьим лицам.
				</p>
				<p className="text-justify leading-relaxed">
					Администрация не несет ответственности за несанкционированный доступ к учетной записи, произошедший
					по вине Пользователя.
				</p>
			</section>
			<Divider />
			<section className="print-content flex flex-col gap-4">
				<h2 className="text-xl font-semibold">Ответственность и гарантии</h2>
				<p className="text-justify leading-relaxed">
					Приложение предоставляется «как есть», без каких-либо гарантий или обязательств с стороны
					Администрации по качеству, точности, надежности или доступности.
				</p>
				<p className="text-justify leading-relaxed">
					Администрация не несет ответственности за любые прямые или косвенные убытки, возникшие в результате
					использования Приложения.
				</p>
				<p className="text-justify leading-relaxed">
					Пользователь самостоятельно несет ответственность за любые действия, связанные с использованием
					Приложения, и за соблюдение законодательства.
				</p>
			</section>
			<Divider />
			<section className="print-content flex flex-col gap-4">
				<h2 className="text-xl font-semibold">Конфиденциальность и защита данных</h2>
				<p className="text-justify leading-relaxed">
					Администрация обрабатывает только те данные Пользователя, которые предоставляются при регистрации, и
					не передает их третьим лицам.
				</p>
				<p className="text-justify leading-relaxed">
					Администрация обязуется предпринимать все необходимые меры для защиты персональных данных
					Пользователя от несанкционированного доступа.
				</p>
			</section>
			<Divider />
			<section className="print-content flex flex-col gap-4">
				<h2 className="text-xl font-semibold">Изменения и прекращение использования</h2>
				<p className="text-justify leading-relaxed">
					Администрация оставляет за собой право в любой момент изменить условия настоящего Соглашения без
					предварительного уведомления Пользователя.
				</p>
				<p className="text-justify leading-relaxed">
					Пользователь обязан самостоятельно следить за изменениями в Соглашении. Продолжение использования
					Приложения после внесения изменений означает согласие с новыми условиями.
				</p>
				<p className="text-justify leading-relaxed">
					Администрация оставляет за собой право прекратить доступ к Приложению без объяснения причин.
				</p>
			</section>
			<Divider />
			<section className="print-content flex flex-col gap-4">
				<h2 className="text-xl font-semibold">Обратная связь и поддержка</h2>
				<p className="text-justify leading-relaxed">
					Приложение не предоставляет официальной поддержки, но любые предложения и вопросы могут быть
					отправлены через соответствующие каналы обратной связи.
				</p>
			</section>
			<Divider />
			<section className="print-content flex flex-col gap-4">
				<h2 className="text-xl font-semibold">Заключительные положения</h2>
				<p className="text-justify leading-relaxed">
					Настоящее Соглашение вступает в силу с момента начала использования Приложения Пользователем.
				</p>
				<p className="text-justify leading-relaxed">
					Если какое-либо положение настоящего Соглашения будет признано недействительным, это не влияет на
					остальные положения Соглашения.
				</p>
			</section>
			<p className="text-sm text-[var(--color-disabled)]">
				Версия: 1.0. Обновлено: 16 марта 2025 года. Актуально с 16 марта 2025 года.
			</p>
		</div>
	);
};

export default TermsOfServicePage;
