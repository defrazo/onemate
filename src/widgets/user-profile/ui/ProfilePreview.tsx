import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { observer } from 'mobx-react-lite';

import { userStore } from '@/entities/user';
import UserAvatar from '@/features/user-avatar';
import { Button, Divider } from '@/shared/ui';

import { profileStore } from '../model';

export const ProfilePreview = observer(() => {
	const store = profileStore;

	const isValidDate =
		store.birthYear !== undefined &&
		store.birthMonth !== undefined &&
		store.birthDay !== undefined &&
		!Number.isNaN(+store.birthYear) &&
		!Number.isNaN(+store.birthMonth) &&
		!Number.isNaN(+store.birthDay);

	const date = isValidDate ? new Date(+store.birthYear, +store.birthMonth, +store.birthDay) : null;
	const formatted = date ? `${format(date, 'd.M.yyyy', { locale: ru })} г.` : 'Не указано';

	return (
		<div className="flex flex-col gap-4">
			<div className="core-card core-base flex flex-col justify-center gap-2">
				<h1 className="core-header">Личные данные</h1>
				<div className="flex flex-row gap-2">
					<div className="flex w-full flex-col justify-evenly gap-2 md:w-3/4">
						<div className="grid grid-cols-2 grid-rows-3 gap-y-4">
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
								<dd className="text-[var(--accent-default)]">{userStore?.username}</dd>
							</dl>
							<dl className="flex flex-col">
								<dt className="font-semibold">Пол</dt>
								<dd className="flex gap-2 text-[var(--accent-default)]">
									<span>{store.gender || 'Не указано'}</span>
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
					<div className="hidden items-center justify-center md:flex md:w-1/4">
						<UserAvatar className="size-20 md:size-fit" />
					</div>
				</div>
				<Divider />
				<Button className="w-full" onClick={() => store.setActiveTab('info')}>
					Настройки личных данных
				</Button>
			</div>
			<div className="core-card core-base flex flex-col justify-center gap-2">
				<h1 className="core-header">Контакты и адреса</h1>
				<div className="flex flex-col justify-evenly gap-2">
					<div className="grid grid-cols-2 grid-rows-2 gap-y-4">
						<dl className="row-span-2 flex-col">
							<dt className="font-semibold">Номер телефона</dt>
							{store.phone.length === 0 ? (
								<span className="text-[var(--accent-default)]">Не указано</span>
							) : (
								store.phone.map((phone, index) => (
									<dd key={index} className="text-[var(--accent-default)]">
										{phone}
									</dd>
								))
							)}
						</dl>
						<dl className="flex-col">
							<dt className="font-semibold">Основная почта</dt>
							<dd className="text-[var(--accent-default)]">{userStore.user?.email}</dd>
						</dl>
						<dl className="flex-col">
							<dt className="font-semibold">Резервная почта</dt>
							<dd className="text-[var(--accent-default)]">
								{store.email.length === 0 ? 'Не указано' : store.email}
							</dd>
						</dl>
					</div>
				</div>
				<Divider />
				<Button className="w-full" onClick={() => store.setActiveTab('contacts')}>
					Настройки контактных данных
				</Button>
			</div>
			<div className="core-card core-base flex flex-col justify-center gap-2">
				<h1 className="core-header">Безопасность</h1>
				<div className="grid grid-cols-2">
					<dl className="flex-col">
						<dt className="font-semibold">Ваш пароль</dt>
						<dd className="text-[var(--accent-default)]">Был изменён 2 месяца назад</dd>
					</dl>
					<dl className="flex-col">
						<dt className="font-semibold">Устройства и активность</dt>
						<dd className="text-[var(--accent-default)]">Текущее устройство: Chrome</dd>
					</dl>
				</div>
				<Divider />
				<Button className="w-full" onClick={() => store.setActiveTab('secure')}>
					Настройки безопасности
				</Button>
			</div>
		</div>
	);
});
