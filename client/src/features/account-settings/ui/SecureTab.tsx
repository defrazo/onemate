import { IconDevicesPin, IconKey, IconTrashX } from '@tabler/icons-react';

import { Divider } from '@/shared/ui';

import { SectionHeader } from './components';
import { DeleteAccountSection, DeviceActivitySection, PasswordSection } from './components/secure';

export const SecureTab = () => {
	return (
		<div className="core-gap flex flex-col divide-y divide-(--border-primary) xl:divide-y-0">
			<div className="core-surface-contrast flex flex-col gap-2 bg-(--bg-secondary) md:p-4 md:shadow-(--shadow-contrast)">
				<SectionHeader icon={IconKey} title="Пароль" />
				<PasswordSection />
			</div>
			<Divider className="xl:hidden" />
			<div className="core-surface-contrast flex flex-col gap-2 bg-(--bg-secondary) md:p-4 md:shadow-(--shadow-contrast)">
				<SectionHeader icon={IconDevicesPin} title="Устройства и активность" />
				<DeviceActivitySection />
			</div>
			<Divider className="xl:hidden" />
			<div className="core-surface-contrast flex flex-col gap-2 bg-(--bg-secondary) md:p-4 md:shadow-(--shadow-contrast)">
				<SectionHeader icon={IconTrashX} title="Удаление аккаунта" />
				<DeleteAccountSection />
			</div>
		</div>
	);
};
