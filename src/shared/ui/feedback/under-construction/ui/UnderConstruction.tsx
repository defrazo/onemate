import { Construction } from '@/shared/assets/images';
import { Link } from '@/shared/ui';

interface Props {
	title?: string;
	suggestions?: React.ReactNode;
}

const UnderConstruction = ({ title = 'Страница в разработке', suggestions }: Props) => {
	return (
		<div className="mobile-pad flex flex-1 flex-col justify-evenly select-none lg:flex-row lg:justify-between">
			<div className="flex flex-col items-center justify-center gap-4 xl:flex-1 xl:gap-8">
				<h1 className="text-center text-2xl leading-tight font-medium md:text-6xl">{title}</h1>
				<div className="md:w-2xl md:text-xl">
					<p className="text-justify leading-relaxed">
						Страница, на которую вы попали, находится в разработке. Она будет доступна позже, а пока вы
						можете попробовать:
					</p>
					<ul className="list-dash">
						{suggestions ?? (
							<>
								<li className="flex items-center">
									<Link
										className="text-[var(--accent-default)] hover:text-[var(--accent-hover)] hover:underline"
										size="custom"
										to="/"
										variant="mobile"
									>
										Перейти на главную страницу OneMate
									</Link>
								</li>
								<li>Вернуться назад через кнопку в браузере</li>
							</>
						)}
					</ul>
				</div>
			</div>
			<div className="flex items-center justify-center md:flex-1">
				<img
					alt="Иллюстрация: страница в разработке"
					className="no-touch-callout max-h-[45vh] xl:max-h-[65vh]"
					src={Construction}
					onContextMenu={(e) => e.preventDefault()}
				/>
			</div>
		</div>
	);
};

export default UnderConstruction;
