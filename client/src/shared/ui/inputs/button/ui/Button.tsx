import type { ButtonHTMLAttributes, MouseEvent, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

import { getComponentStyles, sizes, variants } from '@/shared/lib/ui-kit';
import { cn } from '@/shared/lib/utils';
import { Preloader } from '@/shared/ui';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	navigateTo?: string;
	loading?: boolean;
	active?: boolean;
	leftIcon?: ReactNode;
	centerIcon?: ReactNode;
	rightIcon?: ReactNode;
	variant?: keyof typeof variants.button;
	size?: keyof typeof sizes.button;
	error?: boolean;
}

const Button = ({
	navigateTo,
	onClick,
	loading = false,
	active = false,
	leftIcon,
	centerIcon,
	rightIcon,
	children,
	variant = 'default',
	size = 'md',
	error = false,
	className,
	...props
}: ButtonProps) => {
	const navigate = useNavigate();
	const isDisabled = props.disabled || loading;
	const styles = getComponentStyles({ variant, size, active, error, disabled: isDisabled, component: 'button' });

	const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
		if (isDisabled) return e.preventDefault();

		if (navigateTo) {
			e.preventDefault();
			navigate(navigateTo);
		}

		onClick?.(e);
	};

	return (
		<button
			className={cn(styles, className, 'group')}
			disabled={isDisabled}
			type="button"
			onClick={handleClick}
			{...props}
		>
			{loading ? (
				<Preloader className="size-6 border-3 border-t-(--border-alt)" />
			) : (
				<>
					{leftIcon && <span className="mr-2">{leftIcon}</span>}
					{centerIcon ? <span>{centerIcon}</span> : children}
					{rightIcon && <span className="ml-2">{rightIcon}</span>}
				</>
			)}
		</button>
	);
};

export default Button;
