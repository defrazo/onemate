import React, { useEffect, useState } from 'react';
import { getDaysInMonth } from 'date-fns';
import { observer } from 'mobx-react-lite';

import { userStore } from '@/entities/user';
import { userProfileStore } from '@/entities/userProfile';
import SearchCity from '@/features/search-city';
import { capitalizeFirstLetter } from '@/shared/lib/utils';
import { appStore } from '@/shared/store/appStore';
import { Avatar, AvatarPicker, Button, Input, Radio, Select } from '@/shared/ui';

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

	const handleFocus = (field: string) => {
		if (field === 'firstName') setFirstName('');
		if (field === 'lastName') setLastName('');
		if (field === 'username') setUsername('');
	};

	const handleBlur = (field: string) => {
		if (field === 'firstName' && firstName.trim() === '') setFirstName(userProfileStore.profile?.firstName || '');
		if (field === 'lastName' && lastName.trim() === '') setLastName(userProfileStore.profile?.lastName || '');
		if (field === 'username' && username.trim() === '') setUsername(userStore.username || '');
	};

	const saveChanges = () => {
		userProfileStore.updateFirstName(firstName);
		userProfileStore.updateLastName(lastName);
		userStore.updateUsername(username);
		userProfileStore.updateBirthDate({ year, month, day });
		userProfileStore.updateGender(gender);
	};

	const handleGenderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setGender(event.target.value as 'male' | 'female');
	};
	return (
		<div className="core-card core-base flex flex-col gap-2">
			<h1 className="core-header">Личные данные</h1>
			<div className="flex flex-col gap-4 md:flex-row">
				<div className="flex flex-col items-center gap-2 md:w-1/3">
					<Avatar
						alt="avatar"
						src={userProfileStore.profile?.avatarUrl || ''}
						onClick={() =>
							appStore.setModal(
								<AvatarPicker onSelect={(newAvatar) => userProfileStore.updateAvatarUrl(newAvatar)} />
							)
						}
					/>
					<Button
						className="w-full"
						onClick={() => {
							appStore.setModal(
								<AvatarPicker onSelect={(newAvatar) => userProfileStore.updateAvatarUrl(newAvatar)} />
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
							onBlur={() => handleBlur('firstName')}
							onChange={(e) => setFirstName(e.target.value)}
							onFocus={() => handleFocus('firstName')}
						/>
					</div>
					<div>
						<h3>Фамилия</h3>
						<Input
							placeholder="Ваша фамилия"
							value={lastName}
							variant="ghost"
							onBlur={() => handleBlur('lastName')}
							onChange={(e) => setLastName(e.target.value)}
							onFocus={() => handleFocus('lastName')}
						/>
					</div>
					<div>
						<h3>Никнейм</h3>
						<Input
							placeholder="Ваш никнейм"
							value={username}
							variant="ghost"
							onBlur={() => handleBlur('username')}
							onChange={(e) => setUsername(e.target.value)}
							onFocus={() => handleFocus('username')}
						/>
					</div>
					<div>
						<h3>Дата рождения</h3>
						<div className="flex flex-wrap gap-2 md:flex-nowrap">
							<Select
								align="center"
								fullWidth
								options={Array.from({ length: 100 }, (_, i) => {
									const y = (new Date().getFullYear() - i).toString();
									return { value: y, label: y };
								})}
								placeholder="Год"
								value={year}
								variant="ghost"
								onChange={(e) => (setYear(e.target.value), setDay(''))}
							/>
							<Select
								align="center"
								fullWidth
								options={Array.from({ length: 12 }, (_, i) => ({
									value: i.toString(),
									label: capitalizeFirstLetter(
										new Date(0, i).toLocaleString('ru', { month: 'long' })
									),
								}))}
								placeholder="Месяц"
								value={month}
								variant="ghost"
								onChange={(e) => (setMonth(e.target.value), setDay(''))}
							/>
							<Select
								align="center"
								disabled={!year || month === ''}
								fullWidth
								options={days.map((d) => ({ value: d, label: d }))}
								placeholder="День"
								value={day}
								variant="ghost"
								onChange={(e) => {
									setDay(e.target.value);
								}}
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
					<div className="flex justify-start gap-4">
						<Button
							className="bg-[var(--accent-default)] text-[var(--accent-text)] hover:bg-[var(--accent-hover)]"
							variant="custom"
							onClick={saveChanges}
						>
							Сохранить
						</Button>
						<Button className="hover:bg-[var(--status-error)]" variant="custom">
							Отменить
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
});
