import { NotFound } from '@/shared/assets/images';
import { usePageTitle } from '@/shared/lib/hooks';
import { Link } from '@/shared/ui';

const NotFoundPage = () => {
	usePageTitle('Страница не найдена');

	return (
		<div className="flex flex-1 flex-col justify-evenly select-none md:flex-row md:justify-between">
			<div className="flex flex-col items-center justify-center gap-8 md:flex-1">
				<h1 className="text-center text-4xl font-medium md:text-6xl">
					Странно... <br /> такой страницы нет
				</h1>
				<div className="leading-relaxed md:w-2xl md:text-xl">
					<p>
						Страница, на которую вы попали не существует. Возможно, она была удалена или перемещена. Вы
						можете попробовать:
					</p>
					<ul>
						<li className="flex items-center gap-1.5 pl-4">
							—
							<Link
								className="text-[var(--accent-default)] hover:text-[var(--accent-hover)]"
								size="custom"
								to="/"
								variant="mobile"
							>
								Перейти на главную страницу OneMate
							</Link>
						</li>
						<li className="pl-4">— Проверить правильность введенного адреса</li>
						<li className="pl-4">— Вернуться туда, откуда пришли (нажать «Назад» в браузере)</li>
					</ul>
				</div>
			</div>
			<div className="flex items-center justify-center md:flex-1">
				<img alt="" className="max-h-[50vh]" src={NotFound} />
			</div>
		</div>
	);
};

export default NotFoundPage;
