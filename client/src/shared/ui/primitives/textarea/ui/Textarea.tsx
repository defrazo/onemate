import { type ReactNode, type Ref, type TextareaHTMLAttributes, useLayoutEffect, useRef } from 'react';

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

	leftIcon?: ReactNode;
	autoResize?: boolean;

	resize?: keyof typeof resizeStyles;
	error?: boolean;

	variant?: keyof typeof variants.textarea;
	padding?: Padding;
	wrapperClassName?: string;
}

export const Textarea = ({
	ref,
	leftIcon,
	autoResize = false,

	resize = 'none',
	error = false,

	variant = 'default',
	padding = 'md',
	wrapperClassName,

	disabled,
	className,
	value,
	defaultValue,
	onChange,
	...props
}: TextareaProps) => {
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	useLayoutEffect(() => {
		if (!autoResize || !textareaRef.current) return;

		const textarea = textareaRef.current;

		textarea.style.height = '0px';

		const styles = getComputedStyle(textarea);
		const minHeight = parseFloat(styles.minHeight);
		const maxHeight = parseFloat(styles.maxHeight);
		const scrollHeight = textarea.scrollHeight;

		const height = Math.max(
			Number.isFinite(minHeight) ? minHeight : 0,
			Number.isFinite(maxHeight) ? Math.min(scrollHeight, maxHeight) : scrollHeight
		);

		textarea.style.height = `${height}px`;
		textarea.style.overflowY = scrollHeight > height ? 'auto' : 'hidden';
	}, [autoResize, value, defaultValue]);

	const styles = resolveStyles({
		component: 'textarea',
		variant,
		padding,
		className: cn(
			resizeStyles[autoResize ? 'none' : resize],
			autoResize && 'box-border',
			leftIcon && 'pl-11.5',
			className
		),
	});

	const setRef = (node: HTMLTextAreaElement | null) => {
		textareaRef.current = node;

		if (typeof ref === 'function') ref(node);
		else if (ref) ref.current = node;
	};

	return (
		<div className={cn('relative min-h-0 w-full', wrapperClassName)}>
			{leftIcon && <span className="absolute top-2 left-1.5 z-10 flex h-6 items-center">{leftIcon}</span>}
			<textarea
				{...props}
				ref={setRef}
				aria-invalid={error || undefined}
				className={styles}
				defaultValue={defaultValue}
				disabled={disabled}
				rows={props.rows}
				value={value}
				onChange={onChange}
			/>
		</div>
	);
};
