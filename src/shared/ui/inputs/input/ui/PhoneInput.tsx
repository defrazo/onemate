import type { ChangeEvent } from 'react';

import { formatPhone } from '@/shared/lib/utils';

import Input from '.';

type InputChangeEvent = ChangeEvent<HTMLInputElement> & {
	nativeEvent: InputEvent;
};

interface PhoneInputProps {
	value: string;
	onChange: (value: string) => void;
	className?: string;
}

export const PhoneInput = ({ value, onChange, className }: PhoneInputProps) => {
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
			placeholder="+7"
			value={value}
			variant="ghost"
			onBlur={handleBlur}
			onChange={handleChange}
			onFocus={handleFocus}
		/>
	);
};
