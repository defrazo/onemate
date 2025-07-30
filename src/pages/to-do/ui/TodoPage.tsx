import { Construction } from '@/shared/assets/images';
import { usePageTitle } from '@/shared/lib/hooks';
import { Link } from '@/shared/ui';

const TodoPage = () => {
	usePageTitle('To Do');

	return (
		<div className="flex flex-1 flex-col justify-evenly select-none md:flex-row md:justify-between">
			<div className="flex flex-col items-center justify-center gap-8 md:flex-1">
				<h1 className="text-center text-4xl font-medium md:text-6xl">
					Страница <br /> в разработке
				</h1>
				<div className="leading-relaxed md:w-2xl md:text-xl">
					<p>
						Страница, на которую вы попали находится в разработке. Она будет доступна потом, а пока вы
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
						<li className="pl-4">— Вернуться туда, откуда пришли (нажать «Назад» в браузере)</li>
					</ul>
				</div>
			</div>
			<div className="flex items-center justify-center md:flex-1">
				<img alt="" className="max-h-[65vh]" src={Construction} />
			</div>
		</div>
	);
};

export default TodoPage;
