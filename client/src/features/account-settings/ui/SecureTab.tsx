import { IconDevicesPin, IconKey, IconTrashX } from '@tabler/icons-react';

import { Divider } from '@/shared/ui';

import { SectionHeader } from './components';
import { DeleteAccountSection, DeviceActivitySection, PasswordSection } from './components/secure';

export const SecureTab = () => {
	return (
		<div className="core-gap flex flex-col">
			<div className="core-surface-contrast flex flex-col gap-2 bg-(--bg-secondary) md:p-3 md:shadow-(--shadow-contrast)">
				<SectionHeader icon={IconKey} title="Пароль" />
				<PasswordSection />
			</div>
			<Divider className="mb-1 md:hidden" />
			<div className="core-surface-contrast flex flex-col gap-2 bg-(--bg-secondary) md:p-3 md:shadow-(--shadow-contrast)">
				<SectionHeader icon={IconDevicesPin} title="Устройства и активность" />
				<DeviceActivitySection />
			</div>
			<Divider className="mb-1 md:hidden" />
			<div className="core-surface-contrast flex flex-col gap-2 bg-(--bg-secondary) md:p-3 md:shadow-(--shadow-contrast)">
				<SectionHeader icon={IconTrashX} title="Удаление аккаунта" />
				<DeleteAccountSection />
			</div>
		</div>
	);
};
