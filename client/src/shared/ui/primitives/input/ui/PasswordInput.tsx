import { useEffect, useState } from 'react';
import { IconEye, IconEyeClosed, IconLockFilled } from '@tabler/icons-react';

import { Input, InputLabel } from '.';

export const PasswordInput = (props: React.ComponentProps<typeof Input>) => {
	const [showPassword, setShowPassword] = useState(false);

	const Icon = showPassword ? IconEyeClosed : IconEye;

	useEffect(() => {
		if (!props.value) setShowPassword(false);
	}, [props.value]);

	return (
		<Input
			{...props}
			leftIcon={
				props.leftIcon !== undefined ? (
					props.leftIcon
				) : (
					<InputLabel className="border-(--border-tone)" htmlFor={props.id} icon={IconLockFilled} />
				)
			}
			rightIcon={
				props.value !== '' && (
					<Icon
						className="mr-1 ml-2 size-6 cursor-pointer text-(--text-primary)/80 transition-colors hover:text-(--accent-primary-hover)"
						onClick={() => setShowPassword((prev) => !prev)}
					/>
				)
			}
			type={showPassword ? 'text' : 'password'}
		/>
	);
};
