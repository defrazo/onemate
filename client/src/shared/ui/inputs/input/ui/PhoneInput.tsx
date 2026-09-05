import type { ChangeEvent, ReactNode } from 'react';

import { formatPhone } from '@/shared/lib/utils';

import Input from '.';

type InputChangeEvent = ChangeEvent<HTMLInputElement> & {
	nativeEvent: InputEvent;
};

interface PhoneInputProps {
	id: string;
	value: string;
	onChange: (value: string) => void;
	className?: string;
	name: string;
	variant: string;
	leftIcon?: ReactNode;
	rightIcon?: ReactNode;
}

export const PhoneInput = ({ id, value, onChange, className, name, variant, leftIcon, rightIcon }: PhoneInputProps) => {
	const handleChange = (e: InputChangeEvent) => {
		const isErase = e.nativeEvent.inputType === 'deleteContentBackward';
		const formatted = formatPhone(e.target.value, isErase);
		onChange(formatted);
	};

	const handleFocus = () => !value && onChange('+7');
	const handleBlur = () => value === '+7' && onChange('');

	return (
		<Input
			className={className}
			id={id}
			leftIcon={leftIcon}
			name={name}
			placeholder="+7 (999) 999-99-99"
			rightIcon={rightIcon}
			value={value}
			variant={variant}
			onBlur={handleBlur}
			onChange={handleChange}
			onFocus={handleFocus}
		/>
	);
};
