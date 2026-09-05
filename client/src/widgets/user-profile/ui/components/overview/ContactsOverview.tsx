import { IconBookFilled } from '@tabler/icons-react';
import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';

import { OverviewRow, OverviewSection } from '.';

const renderValues = (values: string[]) => {
	const filtered = values.filter((value) => value.trim());
	if (!filtered.length) return 'Не указано';

	return (
		<div className="flex flex-col gap-1">
			{filtered.map((value) => (
				<span key={value}>{value}</span>
			))}
		</div>
	);
};

export const ContactsOverview = observer(() => {
	const { userProfileStore, userStore } = useStore();

	return (
		<OverviewSection icon={IconBookFilled} title="Контакты и адреса">
			<OverviewRow label="Город" value={userProfileStore.location?.name} />
			<OverviewRow label="Основная почта" value={userStore.email} />
			<OverviewRow label="Номер телефона" value={renderValues(userProfileStore.phones)} />
			<OverviewRow label="Резервная почта" value={renderValues(userProfileStore.emails)} />
		</OverviewSection>
	);
});
