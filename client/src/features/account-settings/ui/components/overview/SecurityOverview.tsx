import { IconShieldLock } from '@tabler/icons-react';
import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';

import { useProfile } from '../../../model/useProfile';
import { OverviewRow } from './OverviewRow';
import { OverviewSection } from './OverviewSection';

export const SecurityOverview = observer(() => {
	const { deviceActivityStore } = useStore();
	const { formattedDate } = useProfile();

	const deviceInfo = deviceActivityStore.deviceInfo;
	const currentDevice = deviceInfo ? `${deviceInfo.browser} (IP: ${deviceInfo.ip})` : 'Не указано';

	return (
		<OverviewSection icon={IconShieldLock} title="Безопасность">
			<OverviewRow label="Пароль изменён" value={formattedDate} />
			<OverviewRow label="Текущее устройство" value={currentDevice} />
		</OverviewSection>
	);
});
