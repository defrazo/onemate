import type { TextareaHTMLAttributes } from 'react';

import { getComponentStyles, sizes, variants } from '@/shared/lib/ui-kit';
import { cn } from '@/shared/lib/utils';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
	variant?: keyof typeof variants.textarea;
	size?: keyof typeof sizes.textarea;
	resize?: 'none' | 'vertical' | 'horizontal' | 'both';
	error?: boolean;
}

const Textarea = ({
	variant = 'default',
	size = 'md',
	resize = 'none',
	error = false,
	className,
	...props
}: TextareaProps) => {
	const styles = getComponentStyles({ variant, size, error, disabled: props.disabled, component: 'textarea' });

	const resizeStyles = {
		none: 'resize-none',
		vertical: 'resize-y',
		horizontal: 'resize-x',
		both: 'resize',
	};

	return <textarea className={cn(styles, resizeStyles[resize], className)} {...props} />;
};

export default Textarea;
