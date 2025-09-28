import { Link } from 'react-router-dom';

import { links, socials } from '../lib';

const FooterWidget = () => (
	<footer className="core-card core-elements flex items-center justify-between p-4 select-none print:hidden">
		<ul className="flex flex-col items-center text-center text-xs md:flex-row md:gap-x-4 lg:text-base">
			{links.map((item) => (
				<li key={item.title} className="cursor-pointer select-none hover:text-[var(--accent-hover)]">
					{item.to ? <Link to={item.to}>{item.title}</Link> : item.title}
				</li>
			))}
		</ul>
		<div className="flex flex-row gap-x-4">
			{socials.map((item) => (
				<a key={item.href} href={item.href} rel="noopener noreferrer" target="_blank">
					<item.icon className={item.style} />
				</a>
			))}
		</div>
	</footer>
);

export default FooterWidget;
