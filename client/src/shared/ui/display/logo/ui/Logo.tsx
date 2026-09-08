import { useNavigate } from 'react-router-dom';

import { IconLogo } from '@/shared/assets/images';
import { cn } from '@/shared/lib/utils';

type LogoSize = 'sm' | 'md' | 'lg';

const sizes = {
	sm: { icon: 'size-5', text: 'text-xl' },
	md: { icon: 'size-6', text: 'text-2xl' },
	lg: { icon: 'size-8', text: 'text-3xl' },
} satisfies Record<LogoSize, { icon: string; text: string }>;

interface LogoProps {
	isLink?: boolean;
	className?: string;
	size?: LogoSize;
}

export const Logo = ({ isLink, className, size = 'md' }: LogoProps) => {
	const navigate = useNavigate();

	const currentSize = sizes[size];

	return (
		<div
			className={cn('flex items-center gap-2 select-none', isLink && 'cursor-pointer', className)}
			title={isLink ? 'Перейти на главную страницу' : ''}
			onClick={() => (isLink ? navigate('/') : null)}
		>
			<img
				alt="Логотип"
				className={cn('no-touch-callout', currentSize.icon)}
				decoding="async"
				loading="lazy"
				src={IconLogo}
			/>
			<h1 className={cn('trim font-semibold', currentSize.text)}>
				<span className="text-(--accent-primary-text)">One</span>
				<span className="text-(--color-accent)">Mate</span>
			</h1>
		</div>
	);
};
