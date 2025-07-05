import { Link } from 'react-router-dom';

import { links, socials } from '../lib';

const FooterWidget = () => (
	<footer className="core-card core-elements my-2 hidden items-center justify-between p-4 select-none md:my-4 md:flex">
		<ul className="flex flex-col items-center text-sm md:flex-row md:gap-x-4 md:text-base">
			{links.map((item) => (
				<li key={item.title}>{item.to ? <Link to={item.to}>{item.title}</Link> : item.title}</li>
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
