import { ReactElement } from 'react';

import { IconEye, IconEyeSlash } from '@/shared/assets/icons';

export function renderPasswordToggle({
	show,
	toggle,
	visible,
}: {
	show: boolean;
	toggle: () => void;
	visible: boolean;
}): ReactElement | null {
	if (!visible) return null;

	const Icon = show ? IconEyeSlash : IconEye;

	return <Icon className="mr-1 size-6 cursor-pointer hover:text-[var(--accent-hover)]" onClick={toggle} />;
}
