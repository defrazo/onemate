import { Link } from 'react-router-dom';

import { IconDZ, IconOK, IconTG, IconVK } from '@/shared/assets/icons';

const FooterWidget = () => (
	<footer className="core-card core-elements hidden flex-col items-center justify-center p-4 text-center select-none md:my-4 md:flex md:max-h-20 md:flex-row md:justify-between md:text-left">
		<ul className="flex flex-col items-center text-sm md:flex-row md:gap-x-4 md:text-base">
			<li>© 2025 Евгений Летунов</li>
			<li>
				<Link to="/about">О проекте</Link>
			</li>
			<li>
				<Link to="/terms">Пользовательское соглашение</Link>
			</li>
			<li>
				<Link to="/privacy">Политика конфиденциальности</Link>
			</li>
			<li>
				<Link to="/generation">OneGen</Link>
			</li>
		</ul>

		<div className="flex flex-row gap-x-4">
			<a href="https://vk.com" rel="noopener noreferrer" target="_blank">
				<IconVK className="h-6 hover:text-blue-500" />
			</a>
			<a href="https://ok.ru" rel="noopener noreferrer" target="_blank">
				<IconOK className="h-6 hover:text-orange-500" />
			</a>
			<a href="https://dzen.ru" rel="noopener noreferrer" target="_blank">
				<IconDZ className="h-6 hover:text-yellow-500" />
			</a>
			<a href="https://t.me" rel="noopener noreferrer" target="_blank">
				<IconTG className="h-6 hover:text-blue-400" />
			</a>
		</div>
	</footer>
);

export default FooterWidget;
