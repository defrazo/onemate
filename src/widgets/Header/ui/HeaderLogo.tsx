import { useNavigate } from 'react-router-dom';

import { Logo } from '@/shared/assets/images';

export const HeaderLogo = () => {
	const navigate = useNavigate();

	return (
		<div
			className="flex cursor-pointer items-center gap-2"
			title="Перейти на главную страницу"
			onClick={() => navigate('/')}
		>
			<img
				alt="Логотип"
				className="no-touch-callout size-10"
				src={Logo}
				onContextMenu={(e) => e.preventDefault()}
			/>
			<span className="text-xl font-bold md:text-3xl">OneMate</span>
		</div>
	);
};
