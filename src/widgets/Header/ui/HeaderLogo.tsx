import { useNavigate } from 'react-router-dom';

import { Logo } from '@/shared/assets/images';

export const HeaderLogo = () => {
	const navigate = useNavigate();

	return (
		<div className="flex cursor-pointer items-center gap-2" onClick={() => navigate('/')}>
			<img alt="Логотип" className="w-10" src={Logo} />
			<span className="text-2xl font-bold md:text-3xl">OneMate</span>
		</div>
	);
};
