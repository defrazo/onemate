import { useNavigate } from 'react-router-dom';

import { IconLogo } from '@/shared/assets/images';
import { cn } from '@/shared/lib/utils';

interface LogoProps {
	isLink?: boolean;
	className?: string;
}

export const Logo = ({ isLink, className }: LogoProps) => {
	const navigate = useNavigate();

	return (
		<div
			className={cn('top-4 left-4 mb-4 flex items-center gap-2 select-none', className)}
			onClick={() => (isLink ? navigate('/') : null)}
		>
			<img alt="Логотип" className="no-touch-callout size-6" decoding="async" loading="lazy" src={IconLogo} />
			<h1 className="text-2xl font-semibold">
				<span className="text-(--accent-primary-text)">One</span>
				<span className="text-(--color-accent)">Mate</span>
			</h1>
		</div>
	);
};
