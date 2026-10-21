import type { ChangeEvent, ComponentProps } from 'react';

import { formatPhone } from '@/shared/lib/utils';

import { Input } from '.';

type InputChangeEvent = ChangeEvent<HTMLInputElement> & {
	nativeEvent: InputEvent;
};

interface PhoneInputProps extends Omit<ComponentProps<typeof Input>, 'value' | 'onChange'> {
	value: string;
	onChange: (value: string) => void;
}

export const PhoneInput = ({ value, onChange, ...props }: PhoneInputProps) => {
	const handleChange = (e: InputChangeEvent) => {
		const isErase = e.nativeEvent.inputType === 'deleteContentBackward';
		const formattedValue = formatPhone(e.target.value, isErase);

		onChange(formattedValue);
	};

	const handleFocus = () => {
		if (!value) onChange('+7');
	};

	const handleBlur = () => {
		if (value === '+7') onChange('');
	};

	return (
		<Input
			{...props}
			placeholder="+7 (999) 999-99-99"
			value={value}
			onBlur={handleBlur}
			onChange={handleChange}
			onFocus={handleFocus}
		/>
	);
};
