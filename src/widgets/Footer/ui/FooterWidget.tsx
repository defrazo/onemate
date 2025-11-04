import { Link } from 'react-router-dom';

import { links, socials } from '../lib';

const FooterWidget = () => (
	<footer className="core-card flex items-center justify-between bg-(--bg-tertiary) p-4 shadow-(--shadow) select-none print:hidden">
		<ul className="flex flex-col items-center text-center text-xs md:flex-row md:gap-x-4 lg:text-base">
			{links.map(({ title, to }) => (
				<li key={title} className="cursor-pointer select-none hover:text-(--accent-hover)">
					{to ? <Link to={to}>{title}</Link> : title}
				</li>
			))}
		</ul>
		<div className="flex flex-row gap-x-4">
			{socials.map(({ href, style, icon: Icon }) => (
				<a key={href} href={href} rel="noopener noreferrer" target="_blank">
					<Icon className={style} />
				</a>
			))}
		</div>
	</footer>
);

export default FooterWidget;
