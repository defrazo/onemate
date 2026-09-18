import { IconDeviceDesktop, IconKey, IconTrashX } from '@tabler/icons-react';

import { SectionHeader } from './components';
import { DeleteAccountSection, DeviceActivitySection, PasswordSection } from './components/secure';

export const SecureTab = () => {
	return (
		<div className="flex flex-col gap-4 divide-y divide-(--border-color) xl:divide-y-0">
			<div className="core-base flex flex-col gap-2 pb-4 md:p-4 md:shadow-(--shadow) xl:rounded-xl">
				<SectionHeader icon={IconKey} title="Пароль" />
				<PasswordSection />
			</div>
			<div className="core-base flex flex-col gap-2 pb-4 md:p-4 md:shadow-(--shadow) xl:rounded-xl">
				<SectionHeader icon={IconDeviceDesktop} title="Устройства и активность" />
				<DeviceActivitySection />
			</div>
			<div className="core-base flex flex-col gap-2 pb-4 md:p-4 md:shadow-(--shadow) xl:rounded-xl">
				<SectionHeader icon={IconTrashX} title="Удаление аккаунта" />
				<DeleteAccountSection />
			</div>
		</div>
	);
};
