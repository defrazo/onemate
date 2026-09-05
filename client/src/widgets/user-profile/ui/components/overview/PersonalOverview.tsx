import { IconUserFilled } from '@tabler/icons-react';
import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';

import { genderOptions } from '../../../lib';
import { useProfile } from '../../../model';
import { OverviewRow, OverviewSection } from '.';

export const PersonalOverview = observer(() => {
	const { userProfileStore, userStore } = useStore();
	const { formattedBirthDate } = useProfile();

	const gender = genderOptions.find((option) => option.value === userProfileStore.gender)?.label;

	return (
		<OverviewSection icon={IconUserFilled} title="Личные данные">
			<OverviewRow label="Имя" value={userProfileStore.firstName} />
			<OverviewRow label="Фамилия" value={userProfileStore.lastName} />
			<OverviewRow label="Никнейм" value={userStore.username} />
			<OverviewRow label="Пол" value={gender} />
			<OverviewRow label="Дата рождения" value={formattedBirthDate} />
		</OverviewSection>
	);
});
