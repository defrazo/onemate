import { IconDeviceDesktop, IconKeyFilled, IconTrashXFilled } from '@tabler/icons-react';

import { useModalBack } from '@/shared/lib/hooks';
import { MobileUserMenu } from '@/widgets/user-menu';

import { SectionHeader } from './components';
import { DeleteAccountSection, DeviceActivitySection, PasswordSection } from './components/secure';

export const SecureTab = () => {
	useModalBack(<MobileUserMenu />);

	return (
		<div className="flex flex-col gap-4">
			<div className="core-base flex flex-col gap-2 rounded-xl pb-4 md:p-4 md:shadow-(--shadow)">
				<SectionHeader icon={IconKeyFilled} title="Пароль" />
				<PasswordSection />
			</div>
			<div className="core-base flex flex-col gap-2 rounded-xl pb-4 md:p-4 md:shadow-(--shadow)">
				<SectionHeader icon={IconDeviceDesktop} title="Устройства и активность" />
				<DeviceActivitySection />
			</div>
			<div className="core-base flex flex-col gap-2 rounded-xl pb-4 md:p-4 md:shadow-(--shadow)">
				<SectionHeader icon={IconTrashXFilled} title="Удаление аккаунта" />
				<DeleteAccountSection />
			</div>
		</div>
	);
};
