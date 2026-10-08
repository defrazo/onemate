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
	primary: 'bg-(--accent-primary) text-(--text-on-accent) hover:bg-(--accent-primary-hover)',
	secondary: 'core-tone-strong text-(--text-primary)',
	ghost: 'text-(--text-secondary) hover:bg-(--tone-strong) hover:text-(--text-primary)',
	danger: 'text-(--danger) hover:bg-(--danger-hover) hover:text-(--text-on-accent)',
	icon: 'text-(--text-secondary) hover:bg-(--tone-strong) hover:text-(--text-primary)',
};

const sizes: Record<ButtonSize, string> = {
	sm: 'h-7 min-w-20 gap-1.5 px-2',
	md: 'h-8 min-w-24 gap-2 px-4',
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
