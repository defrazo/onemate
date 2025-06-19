import React, { useEffect, useState } from 'react';
import { getDaysInMonth } from 'date-fns';
import { observer } from 'mobx-react-lite';

import { cityStore } from '@/entities/city';
import { userStore } from '@/entities/user';
import { userProfileStore } from '@/entities/userProfile';
import SearchCity from '@/features/search-city';
import { IconBack } from '@/shared/assets/icons';
import { AVATAR_OPTIONS } from '@/shared/lib/constants';
import { capitalizeFirstLetter } from '@/shared/lib/utils';
import { appStore } from '@/shared/store/appStore';
import { Avatar, AvatarPicker, Button, Input, Radio, SelectExt } from '@/shared/ui';

import { profileStore } from '../model';

export const ProfileInfo = observer(() => {
	const [firstName, setFirstName] = useState<string>(userProfileStore.profile?.firstName || '');
	const [lastName, setLastName] = useState<string>(userProfileStore.profile?.lastName || '');
	const [username, setUsername] = useState<string>(userStore.user?.username || '');
	const [year, setYear] = useState<string>(userProfileStore.profile?.birthDate.year || '');
	const [month, setMonth] = useState<string>(userProfileStore.profile?.birthDate.month || '');
	const [day, setDay] = useState<string>(userProfileStore.profile?.birthDate.day || '');
	const [gender, setGender] = useState<'male' | 'female' | null>(userProfileStore.profile?.gender || null);
	const [days, setDays] = useState<string[]>([]);

	const genderOptions: { value: 'male' | 'female'; label: string }[] = [
		{ value: 'male', label: 'Мужской' },
		{ value: 'female', label: 'Женский' },
	];

	useEffect(() => {
		if (year && month) {
			const count = getDaysInMonth(new Date(+year, +month));
			setDays(Array.from({ length: count }, (_, i) => (i + 1).toString()));
		}
	}, [year, month]);

	const saveChanges = () => {
		userProfileStore.updateFirstName(firstName);
		userProfileStore.updateLastName(lastName);
		userStore.updateUsername(username);
		userProfileStore.updateBirthDate({ year, month, day });
		userProfileStore.updateGender(gender);
		userProfileStore.updateLocation(cityStore.cityName);
		appStore.setSuccess('Данные успешно сохранены');
	};

	const handleGenderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setGender(event.target.value as 'male' | 'female');
	};

	return (
		<div className="core-card core-base flex flex-col gap-2">
			<div className="relative flex items-center">
				<Button
					centerIcon={<IconBack className="size-6" />}
					className="absolute left-0 md:hidden"
					size="custom"
					variant="mobile"
					onClick={() => profileStore.setActiveTab('profile')}
				/>
				<h1 className="core-header">Личные данные</h1>
			</div>
			<div className="flex flex-col gap-4 md:flex-row">
				<div className="flex flex-col items-center gap-2 md:w-1/3">
					<Avatar
						alt="avatar"
						className="size-1/2 md:size-fit"
						src={userProfileStore.profile?.avatarUrl || AVATAR_OPTIONS[0]}
						onClick={() =>
							appStore.setModal(
								<AvatarPicker onSelect={(newAvatar) => userProfileStore.updateAvatar(newAvatar)} />
							)
						}
					/>
					<Button
						className="w-full"
						onClick={() => {
							appStore.setModal(
								<AvatarPicker onSelect={(newAvatar) => userProfileStore.updateAvatar(newAvatar)} />
							);
						}}
					>
						Изменить
					</Button>
				</div>
				<div className="flex w-full flex-col justify-center gap-4">
					<div>
						<h3>Имя</h3>
						<Input
							placeholder="Ваше имя"
							value={firstName}
							variant="ghost"
							onChange={(e) => setFirstName(e.target.value)}
						/>
					</div>
					<div>
						<h3>Фамилия</h3>
						<Input
							placeholder="Ваша фамилия"
							value={lastName}
							variant="ghost"
							onChange={(e) => setLastName(e.target.value)}
						/>
					</div>
					<div>
						<h3>Никнейм</h3>
						<Input
							placeholder="Ваш никнейм"
							value={username}
							variant="ghost"
							onChange={(e) => setUsername(e.target.value)}
						/>
					</div>
					<div>
						<h3>Дата рождения</h3>
						<div className="flex gap-2">
							<SelectExt
								justify="center"
								options={Array.from({ length: 100 }, (_, i) => {
									const y = (new Date().getFullYear() - i).toString();
									return { value: y, label: y };
								})}
								placeholder="Год"
								value={year}
								variant="ghost"
								onChange={(value) => (setYear(value), setDay(''))}
							/>
							<SelectExt
								justify="center"
								options={Array.from({ length: 12 }, (_, i) => ({
									value: i.toString(),
									label: capitalizeFirstLetter(
										new Date(0, i).toLocaleString('ru', { month: 'long' })
									),
								}))}
								placeholder="Месяц"
								value={month}
								variant="ghost"
								onChange={(value) => (setMonth(value), setDay(''))}
							/>
							<SelectExt
								disabled={!year || month === ''}
								justify="center"
								options={days.map((d) => ({ value: d, label: d }))}
								placeholder="День"
								value={day}
								variant="ghost"
								onChange={(value) => setDay(value)}
							/>
						</div>
					</div>
					<div>
						<h3>Пол:</h3>
						<Radio
							className="gap-4"
							name="gender"
							options={genderOptions}
							value={gender}
							onChange={handleGenderChange}
						/>
					</div>
					<div className="w-full">
						<h3>Город</h3>
						<SearchCity />
					</div>
					<div className="flex justify-center gap-4 md:justify-start">
						<Button variant="accent" onClick={saveChanges}>
							Сохранить
						</Button>
						<Button
							className="rounded-xl hover:bg-[var(--status-error)]"
							variant="custom"
							onClick={() => profileStore.setActiveTab('profile')}
						>
							Отменить
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
});
