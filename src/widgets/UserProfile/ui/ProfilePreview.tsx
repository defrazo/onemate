import { UserAvatar, userStore } from '@/entities/user';
import { userProfileStore } from '@/entities/userProfile';
import { Button, Divider } from '@/shared/ui';

import { profileStore } from '../model/profileStore';

export const ProfilePreview = () => {
	return (
		<div className="flex flex-col gap-4">
			<div className="core-card core-base flex flex-col justify-center gap-2">
				<h1 className="core-header">Личные данные</h1>
				<div className="flex flex-col gap-2 md:flex-row">
					<div className="flex flex-col justify-evenly md:w-3/4">
						<dl className="flex gap-2 md:flex-col md:gap-0">
							<dt className="font-semibold">Имя и фамилия</dt>
							<dd className="text-[var(--accent-default)]">
								{userProfileStore.profile?.firstName} {userProfileStore.profile?.lastName}
							</dd>
						</dl>
						<dl className="flex gap-2 md:flex-col md:gap-0">
							<dt className="font-semibold">Дата рождения</dt>
							<dd className="flex gap-2 text-[var(--accent-default)]">
								<span>{userProfileStore.profile?.birthDate.day}</span>
								<span>{userProfileStore.profile?.birthDate.month}</span>
								<span>{userProfileStore.profile?.birthDate.year}</span>
							</dd>
						</dl>
					</div>
					<div className="flex justify-end md:w-1/4">
						<UserAvatar />
					</div>
				</div>
				<Divider />
				<Button className="w-full" onClick={() => profileStore.setActiveTab('info')}>
					Настройки личных данных
				</Button>
			</div>
			<div className="core-card core-base flex flex-col justify-center gap-2">
				<h1 className="core-header">Контакты и адреса</h1>
				<div className="flex flex-col justify-evenly gap-2">
					<dl className="flex-col">
						<dt className="font-semibold">Номер телефона</dt>
						{userProfileStore.profile?.phone.map((phone, index) => (
							<dd key={index} className="text-[var(--accent-default)]">
								{phone}
							</dd>
						))}
					</dl>
					<dl className="flex-col">
						<dt className="font-semibold">Основная почта</dt>
						<dd className="text-[var(--accent-default)]">{userStore.user?.email}</dd>
					</dl>
					<dl className="flex-col">
						<dt className="font-semibold">Резервная почта</dt>
						<dd className="text-[var(--accent-default)]">{userProfileStore.profile?.email}</dd>
					</dl>
				</div>

				<Divider />
				<Button className="w-full" onClick={() => profileStore.setActiveTab('contacts')}>
					Настройки контактных данных
				</Button>
			</div>
			<div className="core-card core-base flex flex-col justify-center gap-2">
				<h1 className="core-header">Безопасность</h1>
				<div className="flex flex-col justify-evenly gap-2">
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
				<Button className="w-full" onClick={() => profileStore.setActiveTab('secure')}>
					Настройки безопасности
				</Button>
			</div>
		</div>
	);
};
