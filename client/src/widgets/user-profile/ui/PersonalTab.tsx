import { useEffect, useMemo, useState } from 'react';
import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import type { Gender, UserProfile } from '@/entities/user-profile';
import { DEFAULT_AVATAR } from '@/entities/user-profile/model';
import LocationSearch from '@/features/location-search';
import { AvatarPicker } from '@/features/user-avatar';
import { IconTrash } from '@/shared/assets/icons';
import { useModalBack } from '@/shared/lib/hooks';
import { generateMonth, generateYears } from '@/shared/lib/utils';
import { validateName, validateUsername } from '@/shared/lib/validators';
import { Button, Input, LoadFallback, Radio, SelectExt, Thumbnail } from '@/shared/ui';
import { MobileUserMenu } from '@/widgets/user-menu';

import { genderOptions, getAvailableDays } from '../lib';
import { useProfile } from '../model';

type PersonalDraft = {
	firstName: string;
	lastName: string;
	username: string;
	birthYear: string;
	birthMonth: string;
	birthDay: string;
	gender: Gender;
};

export const PersonalTab = observer(() => {
	const { modalStore, notifyStore, userStore, userProfileStore } = useStore();
	const { device } = useProfile();

	useModalBack(<MobileUserMenu />);

	const [draft, setDraft] = useState<PersonalDraft>({
		firstName: '',
		lastName: '',
		username: '',
		birthYear: '',
		birthMonth: '',
		birthDay: '',
		gender: '',
	});

	const [isSaving, setIsSaving] = useState(false);

	const createDraft = (): PersonalDraft => ({
		firstName: userProfileStore.firstName,
		lastName: userProfileStore.lastName,
		username: userStore.username,
		birthYear: userProfileStore.birthYear,
		birthMonth: userProfileStore.birthMonth,
		birthDay: userProfileStore.birthDay,
		gender: userProfileStore.gender,
	});

	useEffect(() => {
		if (!userProfileStore.isReady) return;

		setDraft(createDraft());
	}, [userProfileStore.isReady, userStore.id]);

	const days = useMemo(
		() => getAvailableDays(draft.birthYear, draft.birthMonth),
		[draft.birthYear, draft.birthMonth]
	);

	const isDirty =
		draft.firstName !== userProfileStore.firstName ||
		draft.lastName !== userProfileStore.lastName ||
		draft.username !== userStore.username ||
		draft.birthYear !== userProfileStore.birthYear ||
		draft.birthMonth !== userProfileStore.birthMonth ||
		draft.birthDay !== userProfileStore.birthDay ||
		draft.gender !== userProfileStore.gender;

	const updateField = <K extends keyof PersonalDraft>(key: K, value: PersonalDraft[K]): void => {
		setDraft((prev) => ({
			...prev,
			[key]: value,
		}));
	};

	const createBirthDate = (): string | null => {
		if (!draft.birthYear || !draft.birthMonth || !draft.birthDay) {
			return null;
		}

		const month = draft.birthMonth.padStart(2, '0');
		const day = draft.birthDay.padStart(2, '0');

		return `${draft.birthYear}-${month}-${day}`;
	};

	const handleCancel = (): void => {
		setDraft(createDraft());
	};

	const handleSave = async (): Promise<void> => {
		if (!isDirty || isSaving) return;

		try {
			setIsSaving(true);

			if (draft.firstName) {
				await validateName(draft.firstName);
			}

			if (draft.lastName) {
				await validateName(draft.lastName);
			}

			if (draft.username) {
				await validateUsername(draft.username);
			}

			const profile: UserProfile = {
				first_name: draft.firstName.trim(),
				last_name: draft.lastName.trim(),
				birth_date: createBirthDate(),
				gender: draft.gender,

				// Контактные данные эта форма не редактирует.
				phones: userProfileStore.phone,
				additional_emails: userProfileStore.email,
			};

			await userProfileStore.updateProfile(profile);

			if (draft.username !== userStore.username) {
				await userStore.updateUsername(draft.username.trim());
			}

			setDraft(createDraft());

			notifyStore.setNotice('Данные успешно сохранены', 'success');
		} catch (error) {
			notifyStore.setNotice(error instanceof Error ? error.message : 'Проверьте введенные данные', 'error');
		} finally {
			setIsSaving(false);
		}
	};

	if (!userProfileStore.isReady) {
		return <LoadFallback />;
	}

	return (
		<div className="core-base flex cursor-default flex-col gap-4 rounded-xl pb-4 select-none md:p-4 md:shadow-(--shadow)">
			<h1 className="core-header">Личные данные</h1>
			<div className="flex flex-col gap-4 md:flex-row">
				<div className="flex flex-col items-center gap-2 md:w-1/3">
					<Thumbnail
						alt="avatar"
						className="size-1/2 cursor-pointer ring-(--accent-hover) hover:ring-2 md:size-fit"
						src={userProfileStore.avatar || DEFAULT_AVATAR}
						title="Сменить аватар"
						onClick={() => modalStore.setModal(<AvatarPicker />, device === 'mobile' ? 'sheet' : undefined)}
					/>
					<Button
						className="core-elements w-full"
						onClick={() => modalStore.setModal(<AvatarPicker />, device === 'mobile' ? 'sheet' : undefined)}
					>
						Изменить
					</Button>
				</div>
				<div className="flex w-full flex-col justify-center gap-4">
					<div className="flex flex-col gap-1">
						<label className="text-(--color-secondary) opacity-70" htmlFor="firstName">
							Имя
						</label>
						<Input
							autoComplete="new-password"
							id="firstName"
							placeholder="Ваше имя"
							value={draft.firstName}
							variant="ghost"
							onBlur={(e) => updateField('firstName', e.target.value.trim())}
							onChange={(e) => updateField('firstName', e.target.value)}
						/>
					</div>
					<div className="flex flex-col gap-1">
						<label className="text-(--color-secondary) opacity-70" htmlFor="lastName">
							Фамилия
						</label>
						<Input
							autoComplete="new-password"
							id="lastName"
							placeholder="Ваша фамилия"
							value={draft.lastName}
							variant="ghost"
							onBlur={(e) => updateField('lastName', e.target.value.trim())}
							onChange={(e) => updateField('lastName', e.target.value)}
						/>
					</div>
					<div className="flex flex-col gap-1">
						<label className="text-(--color-secondary) opacity-70" htmlFor="username">
							Никнейм
						</label>
						<Input
							autoComplete="username"
							id="username"
							placeholder="Ваш никнейм"
							value={draft.username}
							variant="ghost"
							onBlur={(e) => updateField('username', e.target.value.trim())}
							onChange={(e) => updateField('username', e.target.value)}
						/>
					</div>
					<div className="flex flex-col gap-1">
						<span className="text-(--color-secondary) opacity-70">Дата рождения</span>
						<div className="flex flex-col gap-2 md:flex-row">
							<SelectExt
								justify="center"
								nullable
								options={generateYears()}
								placeholder="Год"
								value={draft.birthYear}
								variant="embedded"
								onChange={(value) =>
									setDraft((prev) => ({
										...prev,
										birthYear: value,
										birthDay: '',
									}))
								}
							/>
							<SelectExt
								direction="up"
								justify="center"
								nullable
								options={generateMonth()}
								placeholder="Месяц"
								value={draft.birthMonth}
								variant="embedded"
								onChange={(value) =>
									setDraft((prev) => ({
										...prev,
										birthMonth: value,
										birthDay: '',
									}))
								}
							/>
							<SelectExt
								disabled={!draft.birthYear || draft.birthMonth === ''}
								justify="center"
								nullable
								options={days.map((day) => ({ value: day, label: day }))}
								placeholder="День"
								value={draft.birthDay}
								variant="embedded"
								onChange={(value) => updateField('birthDay', value)}
							/>
						</div>
					</div>
					<div className="flex flex-col gap-1">
						<span className="text-(--color-secondary) opacity-70">Пол</span>
						<Radio
							className="flex-col gap-4 md:flex-row"
							name="gender"
							options={genderOptions}
							value={draft.gender}
							onChange={(e) => updateField('gender', e.target.value as Gender)}
						/>
					</div>
					<div className="flex flex-col gap-1">
						<label className="text-(--color-secondary) opacity-70" htmlFor="location">
							Город
						</label>
						<div className="flex gap-2">
							<LocationSearch
								value={userProfileStore.location}
								onSelect={(city) => userProfileStore.setLocation(city)}
							/>
							<Button
								centerIcon={<IconTrash className="size-6" />}
								className="hover:text-(--status-error)"
								size="custom"
								title="Удалить"
								variant="custom"
								onClick={async () => {
									try {
										await userProfileStore.deleteLocation();

										notifyStore.setNotice('Данные о местоположении удалены!', 'success');
									} catch (error) {
										notifyStore.setNotice(
											error instanceof Error
												? error.message
												: 'Не удалось удалить местоположение',
											'error'
										);
									}
								}}
							/>
						</div>
					</div>
					<div className="flex justify-center gap-4 md:justify-start">
						<Button
							className="w-28"
							disabled={!isDirty}
							loading={isSaving}
							variant="accent"
							onClick={handleSave}
						>
							Сохранить
						</Button>
						<Button
							disabled={device !== 'mobile' && !isDirty}
							variant="warning"
							onClick={() =>
								device === 'mobile' ? modalStore.setModal(<MobileUserMenu />, 'sheet') : handleCancel()
							}
						>
							Отменить
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
});
