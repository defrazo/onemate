import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { observer } from 'mobx-react-lite';

import { userStore } from '@/entities/user';
import { deviceActivityStore } from '@/features/device-activity';
import UserAvatar from '@/features/user-avatar';
import { Button, Divider, LoadFallback } from '@/shared/ui';

import { profileStore, useProfile } from '../model';

export const OverviewTab = observer(() => {
	const { formattedDate, navigate } = useProfile();
	const store = profileStore;

	const isValidDate =
		store.birthYear !== undefined &&
		store.birthMonth !== undefined &&
		store.birthDay !== undefined &&
		!Number.isNaN(+store.birthYear) &&
		!Number.isNaN(+store.birthMonth) &&
		!Number.isNaN(+store.birthDay);

	const date = isValidDate ? new Date(+store.birthYear, +store.birthMonth, +store.birthDay) : null;
	const formatted = date ? `${format(date, 'dd.MM.yyyy', { locale: ru })} г.` : 'Не указано';

	if (!profileStore.isProfileUploaded) return <LoadFallback />;

	return (
		<div className="flex flex-col gap-4">
			<div className="core-card core-base flex flex-col justify-center gap-4">
				<h1 className="core-header">Личные данные</h1>
				<div className="flex flex-row gap-2">
					<div className="flex w-full flex-col justify-evenly gap-2">
						<div className="grid grid-cols-2 grid-rows-3">
							<dl className="flex flex-col">
								<dt className="font-semibold">Имя</dt>
								<dd className="text-[var(--accent-default)]">{store.firstName || 'Не указано'}</dd>
							</dl>
							<dl className="flex flex-col">
								<dt className="font-semibold">Фамилия</dt>
								<dd className="text-[var(--accent-default)]">{store.lastName || 'Не указано'}</dd>
							</dl>
							<dl className="flex flex-col">
								<dt className="font-semibold">Никнейм</dt>
								<dd className="text-[var(--accent-default)]">{userStore.username}</dd>
							</dl>
							<dl className="flex flex-col">
								<dt className="font-semibold">Пол</dt>
								<dd className="flex gap-2 text-[var(--accent-default)]">
									<span>{store.genderLabel}</span>
								</dd>
							</dl>
							<dl className="flex flex-col">
								<dt className="font-semibold">Дата рождения</dt>
								<dd className="flex gap-2 text-[var(--accent-default)]">
									<span>{formatted} </span>
								</dd>
							</dl>
							<dl className="flex flex-col justify-center">
								<dt className="font-semibold">Город</dt>
								<dd className="flex gap-2 text-[var(--accent-default)]">
									<span>{store.location || 'Не указано'}</span>
								</dd>
							</dl>
						</div>
					</div>
				</div>
				<Divider />
				<Button className="w-full" onClick={() => navigate(`/account/profile?tab=personal`)}>
					Настройки личных данных
				</Button>
			</div>
			<div className="core-card core-base flex flex-col justify-center gap-4">
				<h1 className="core-header">Контакты и адреса</h1>
				<div className="grid grid-cols-2">
					<dl className="flex flex-col">
						<dt className="font-semibold">Номер телефона</dt>
						{store.phone.filter((phone) => phone.trim() !== '').length === 0 ? (
							<dd className="text-[var(--accent-default)]">Не указано</dd>
						) : (
							store.phone.map((phone, idx) => (
								<dd key={idx} className="text-[var(--accent-default)]">
									{phone}
								</dd>
							))
						)}
					</dl>
					<dl className="flex flex-col">
						<dt className="font-semibold">Основная почта</dt>
						<dd className="text-[var(--accent-default)]">{userStore.user?.email}</dd>
						<dt className="font-semibold">Резервная почта</dt>
						<dd className="flex flex-col text-[var(--accent-default)]">
							{store.email.length === 0
								? 'Не указано'
								: store.email.map((email, idx) => <span key={idx}>{email}</span>)}
						</dd>
					</dl>
				</div>
				<Divider />
				<Button className="w-full" onClick={() => navigate(`/account/profile?tab=contacts`)}>
					Настройки контактных данных
				</Button>
			</div>
			<div className="core-card core-base flex flex-col justify-center gap-4">
				<h1 className="core-header">Безопасность</h1>
				<div className="grid grid-cols-2">
					<dl className="flex-col">
						<dt className="font-semibold">Ваш пароль был изменен</dt>
						<dd className="text-[var(--accent-default)]">{formattedDate}</dd>
					</dl>
					<dl className="flex-col">
						<dt className="font-semibold">Устройства и активность</dt>
						<dd className="text-[var(--accent-default)]">
							Текущее устройство: {deviceActivityStore.deviceInfo?.browser}
						</dd>
					</dl>
				</div>
				<Divider />
				<Button className="w-full" onClick={() => navigate(`/account/profile?tab=secure`)}>
					Настройки безопасности
				</Button>
			</div>
		</div>
	);
});
