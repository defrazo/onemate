import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import { LoadFallback } from '@/shared/ui';

import { useProfile } from '../model';
import { Row } from '.';

export const OverviewTab = observer(() => {
	const { cityStore, deviceActivityStore, profileStore: store, userStore } = useStore();
	const { formattedBirthDate, formattedDate } = useProfile();

	const renderList = (items: string[]) =>
		items.filter((x) => x.trim()).length === 0
			? 'Не указано'
			: items.map((item, idx) => <span key={idx}>{item}</span>);

	if (!store.isReady) return <LoadFallback />;

	return (
		<div className="flex flex-col gap-4">
			<div className="core-base flex flex-col justify-center rounded-xl py-4">
				<h1 className="core-header mb-2 px-4">Личные данные</h1>
				<div className="grid w-full -space-y-px">
					<Row label="Имя" value={store.firstName || 'Не указано'} />
					<Row label="Фамилия" value={store.lastName || 'Не указано'} />
					<Row label="Никнейм" value={userStore.username || 'Пользователь'} />
					<Row label="Пол" value={store.genderLabel} />
					<Row label="Дата рождения" value={formattedBirthDate} />
					<Row label="Город" value={cityStore.name || 'Не указано'} />
				</div>
			</div>
			<div className="core-base flex flex-col justify-center rounded-xl py-4">
				<h1 className="core-header mb-2 px-4">Контакты и адреса</h1>
				<div className="grid w-full -space-y-px">
					<Row isColumn label="Номер телефона" value={renderList(store.phone)} />
					<Row label="Основная почта" value={userStore.user?.email} />
					<Row isColumn label="Резервная почта" value={renderList(store.email)} />
				</div>
			</div>
			<div className="core-base flex flex-col justify-center rounded-xl py-4">
				<h1 className="core-header mb-2 px-4">Безопасность</h1>
				<div className="grid w-full -space-y-px">
					<Row label="Ваш пароль был изменен" value={formattedDate} />
					<Row
						label="Текущее устройство"
						value={`${deviceActivityStore.deviceInfo?.browser} (IP: ${deviceActivityStore.deviceInfo?.ip})`}
					/>
				</div>
			</div>
		</div>
	);
});
