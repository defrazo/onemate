import { Link } from 'react-router-dom';

const links = [
	{ to: '/about', title: 'О проекте' },
	{ to: '/terms', title: 'Условия использования' },
	{ to: '/privacy', title: 'Политика конфиденциальности' },
];

export const Footer = () => (
	<footer className="flex items-center justify-between rounded-xl bg-(--bg-tertiary) px-4 py-3 text-sm text-(--text-secondary) shadow-(--shadow) select-none print:hidden">
		<nav>
			<ul className="flex items-center gap-x-5">
				{links.map(({ title, to }) => (
					<li key={to}>
						<Link className="transition-colors hover:text-(--text-primary)" to={to}>
							{title}
						</Link>
					</li>
				))}
			</ul>
		</nav>
		<span>OneMate · 2026</span>
	</footer>
);
