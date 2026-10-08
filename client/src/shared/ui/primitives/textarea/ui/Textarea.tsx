import type { Ref, TextareaHTMLAttributes } from 'react';

import { type Padding, resolveStyles, type variants } from '@/shared/lib/design';
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
	padding?: Padding;
}

export const Textarea = ({
	ref,

	resize = 'none',
	error = false,

	variant = 'default',
	padding = 'md',

	disabled,
	className,
	...props
}: TextareaProps) => {
	const styles = resolveStyles({
		component: 'textarea',
		variant,
		padding,
		className: cn(resizeStyles[resize], className),
	});

	return <textarea {...props} ref={ref} aria-invalid={error || undefined} className={styles} disabled={disabled} />;
};
