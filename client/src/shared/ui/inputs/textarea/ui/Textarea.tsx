import type { Ref, TextareaHTMLAttributes } from 'react';

import { getComponentStyles, sizes, variants } from '@/shared/lib/design';
import { cn } from '@/shared/lib/utils';

const resizeStyles = {
	none: 'resize-none',
	vertical: 'resize-y',
	horizontal: 'resize-x',
	both: 'resize',
} as const;

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
	ref?: Ref<HTMLTextAreaElement>;

	resize?: keyof typeof resizeStyles;
	error?: boolean;

	variant?: keyof typeof variants.textarea;
	size?: keyof typeof sizes.textarea;
}

export const Textarea = ({
	ref,

	resize = 'none',
	error = false,

	variant = 'default',
	size = 'md',

	disabled = false,
	className,
	...props
}: TextareaProps) => {
	const styles = getComponentStyles({ variant, size, error, disabled, component: 'textarea' });

	return (
		<textarea {...props} ref={ref} className={cn(styles, resizeStyles[resize], className)} disabled={disabled} />
	);
};
