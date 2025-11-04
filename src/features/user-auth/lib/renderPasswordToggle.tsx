import type { ReactElement } from 'react';

import { IconEye, IconEyeSlash } from '@/shared/assets/icons';

interface PasswordToggleProps {
	show: boolean;
	toggle: () => void;
	visible: boolean;
}

export const renderPasswordToggle = ({ show, toggle, visible }: PasswordToggleProps): ReactElement | null => {
	if (!visible) return null;

	const Icon = show ? IconEyeSlash : IconEye;

	return <Icon className="mr-1 size-6 cursor-pointer hover:text-(--accent-hover)" onClick={toggle} />;
};
