import { useNavigate } from 'react-router-dom';

import { IconLogo } from '@/shared/assets/images';
import { cn } from '@/shared/lib/utils';

type LogoSize = 'sm' | 'md' | 'lg';

const sizes = {
	sm: { icon: 'size-5', text: 'text-xl' },
	md: { icon: 'size-6', text: 'text-2xl' },
	lg: { icon: 'size-10 xl:size-7 md:landscape:size-8 xl:landscape:size-7', text: 'text-2xl xl:text-3xl' },
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
			<h1 className={cn('trim', currentSize.text)}>
				<span className="text-(--accent-primary-text)">One</span>
				<span className="font-bold text-(--accent-secondary)">Mate</span>
			</h1>
		</div>
	);
};
