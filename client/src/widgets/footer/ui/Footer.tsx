import { Link } from '@/shared/ui';

const links = [
	{ to: '/about', title: 'О проекте' },
	{ to: '/terms', title: 'Условия использования' },
	{ to: '/privacy', title: 'Политика конфиденциальности' },
];

export const Footer = () => (
	<footer className="flex items-center justify-between border-t border-(--border-tone) px-4 pt-3 text-sm text-(--text-secondary) select-none print:hidden">
		<nav>
			<ul className="flex items-center gap-x-5">
				{links.map(({ title, to }) => (
					<li key={to}>
						<Link className="hover:text-(--accent-primary)" padding="none" to={to} variant="custom">
							{title}
						</Link>
					</li>
				))}
			</ul>
		</nav>
		<div className="flex items-center gap-2">
			<span>OneMate</span>
			<span>·</span>
			<span>2026</span>
		</div>
	</footer>
);
