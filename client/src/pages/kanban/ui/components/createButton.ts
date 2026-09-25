import { cn } from '@/shared/lib/utils';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'icon';

type ButtonSize = 'sm' | 'md';

type CreateButtonProps = {
	text?: string;
	variant?: ButtonVariant;
	size?: ButtonSize;
	type?: 'button' | 'submit';
	className?: string;
	onClick?: () => void;
};

const base =
	'inline-flex cursor-pointer items-center justify-center rounded-lg transition-colors select-none disabled:pointer-events-none disabled:opacity-50';

const variants: Record<ButtonVariant, string> = {
	primary: 'bg-(--accent-default) text-(--accent-text) hover:bg-(--accent-hover)',
	secondary: 'bg-white/5 text-(--color-primary) hover:bg-white/10',
	ghost: 'text-(--color-secondary) hover:bg-white/5 hover:text-(--color-primary)',
	danger: 'text-(--status-error) hover:bg-red-500/10',
	icon: 'text-(--color-secondary) hover:bg-white/5 hover:text-(--color-primary)',
};

const sizes: Record<ButtonSize, string> = {
	sm: 'h-8 min-w-20 gap-1.5 px-2 text-sm',
	md: 'h-9 min-w-24 gap-2 px-4 text-sm',
};

export const createButton = ({
	text,
	variant = 'secondary',
	size = 'md',
	type = 'button',
	className,
	onClick,
}: CreateButtonProps) => {
	const button = document.createElement('button');
	button.type = type;

	if (text) button.textContent = text;

	button.className = cn(base, variants[variant], sizes[size], className);

	if (onClick) button.addEventListener('click', onClick);

	return button;
};
