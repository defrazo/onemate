import { useState } from 'react';
import { IconEye, IconEyeClosed, IconLockFilled } from '@tabler/icons-react';

import { Input } from '@/shared/ui';

import { InputLabel } from '.';

export const PasswordInput = (props: React.ComponentProps<typeof Input>) => {
	const [showPassword, setShowPassword] = useState(false);

	const Icon = showPassword ? IconEyeClosed : IconEye;

	return (
		<Input
			{...props}
			leftIcon={<InputLabel htmlFor={props.id} icon={IconLockFilled} />}
			rightIcon={
				<Icon
					className="mr-1 ml-2 size-6 cursor-pointer hover:text-(--accent-primary-hover)"
					onClick={() => setShowPassword((prev) => !prev)}
				/>
			}
			type={showPassword ? 'text' : 'password'}
			variant="ghost"
		/>
	);
};
