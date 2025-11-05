import { NotFound } from '@/shared/assets/images';
import { usePageTitle } from '@/shared/lib/hooks';
import { Link } from '@/shared/ui';

const NotFoundPage = () => {
	usePageTitle('Страница не найдена');

	return (
		<div className="flex flex-1 flex-col justify-evenly select-none lg:flex-row lg:justify-between">
			<div className="flex flex-col items-center justify-center gap-4 xl:flex-1 xl:gap-8">
				<h1 className="text-center text-2xl leading-tight font-medium md:text-6xl">
					Странно... <br /> такой страницы нет
				</h1>
				<div className="leading-relaxed md:w-2xl md:text-xl">
					<p>
						Страница, на которую вы попали, не существует. Возможно, она была удалена или перемещена. Вы
						можете попробовать:
					</p>
					<ul className="list-dash">
						<li className="flex items-center">
							<Link
								className="text-(--accent-default) hover:text-(--accent-hover) hover:underline"
								size="custom"
								to="/"
								variant="mobile"
							>
								Перейти на главную страницу OneMate
							</Link>
						</li>
						<li>Проверить правильность введенного адреса</li>
						<li>Вернуться назад через кнопку в браузере</li>
					</ul>
				</div>
			</div>
			<div className="flex items-center justify-center md:flex-1">
				<img
					alt="Иллюстрация: страница не найдена"
					className="no-touch-callout max-h-[45vh] xl:max-h-[65vh]"
					decoding="async"
					loading="lazy"
					src={NotFound}
					onContextMenu={(e) => e.preventDefault()}
				/>
			</div>
		</div>
	);
};

export default NotFoundPage;
