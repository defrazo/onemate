import { useMemo, useState } from 'react';
import { IconAt, IconUserFilled } from '@tabler/icons-react';
import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import type { Gender } from '@/entities/user-profile';
import { InputLabel } from '@/features/user-auth';
import { generateMonth, generateYears } from '@/shared/lib/utils';
import { validateName, validateUsername } from '@/shared/lib/validators';
import { Collapse, Input, Radio, SelectExt } from '@/shared/ui';

import { genderOptions, getAvailableDays } from '../../../lib';
import type { PersonalDraft } from '../../../model';
import { FormActions, RemoveButton } from '..';

export const PersonalDataSection = observer(() => {
	const { notifyStore, userProfileStore, userStore } = useStore();

	const createDraft = (): PersonalDraft => ({
		firstName: userProfileStore.firstName,
		lastName: userProfileStore.lastName,
		username: userStore.username,
		birthYear: userProfileStore.birthYear,
		birthMonth: userProfileStore.birthMonth,
		birthDay: userProfileStore.birthDay,
		gender: userProfileStore.gender,
	});

	const [draft, setDraft] = useState<PersonalDraft>(() => createDraft());
	const [isLoading, setIsLoading] = useState(false);

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
		setDraft((prev) => ({ ...prev, [key]: value }));
	};

	const createBirthDate = (): string | null => {
		if (!draft.birthYear || !draft.birthMonth || !draft.birthDay) return null;

		const month = draft.birthMonth.padStart(2, '0');
		const day = draft.birthDay.padStart(2, '0');

		return `${draft.birthYear}-${month}-${day}`;
	};

	const handleCancel = (): void => setDraft(createDraft());

	const handleSave = async (): Promise<void> => {
		if (isLoading || !isDirty) return;

		const username = draft.username.trim();
		const firstName = draft.firstName.trim();
		const lastName = draft.lastName.trim();

		if (username && validateUsername(username) === 'invalid') {
			notifyStore.setNotice('Некорректный никнейм', 'info');
			return;
		}

		if (firstName && validateName(firstName) === 'invalid') {
			notifyStore.setNotice('Некорректное имя', 'info');
			return;
		}

		if (lastName && validateName(lastName) === 'invalid') {
			notifyStore.setNotice('Некорректная фамилия', 'info');
			return;
		}

		try {
			setIsLoading(true);

			await userProfileStore.updateProfile({
				first_name: firstName,
				last_name: lastName,
				birth_date: createBirthDate(),
				gender: draft.gender,
			});

			if (username !== userStore.username) await userStore.updateUsername(username);

			setDraft(createDraft());
			notifyStore.setNotice('Данные успешно сохранены', 'success');
		} catch {
			notifyStore.setNotice('Проверьте введенные данные', 'error');
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="flex flex-1 flex-col gap-4">
			<div className="flex flex-col gap-1">
				<label className="text-(--color-secondary) opacity-70" htmlFor="username">
					Никнейм
				</label>
				<Input
					autoComplete="username"
					id="username"
					leftIcon={<InputLabel htmlFor="username" icon={IconAt} />}
					placeholder="Ваш никнейм"
					rightIcon={
						draft.username &&
						userStore.username && <RemoveButton onClick={() => updateField('username', '')} />
					}
					value={draft.username}
					variant="ghost"
					onChange={(e) => updateField('username', e.target.value)}
				/>
			</div>
			<div className="flex flex-col gap-1">
				<label className="text-(--color-secondary) opacity-70" htmlFor="firstName">
					Имя
				</label>
				<Input
					autoComplete="given-name"
					id="firstName"
					leftIcon={<InputLabel htmlFor="firstName" icon={IconUserFilled} />}
					placeholder="Ваше имя"
					rightIcon={
						draft.firstName &&
						userProfileStore.firstName && <RemoveButton onClick={() => updateField('firstName', '')} />
					}
					value={draft.firstName}
					variant="ghost"
					onChange={(e) => updateField('firstName', e.target.value)}
				/>
			</div>
			<div className="flex flex-col gap-1">
				<label className="text-(--color-secondary) opacity-70" htmlFor="lastName">
					Фамилия
				</label>
				<Input
					autoComplete="family-name"
					id="lastName"
					leftIcon={<InputLabel htmlFor="lastName" icon={IconUserFilled} />}
					placeholder="Ваша фамилия"
					rightIcon={
						draft.lastName &&
						userProfileStore.lastName && <RemoveButton onClick={() => updateField('lastName', '')} />
					}
					value={draft.lastName}
					variant="ghost"
					onChange={(e) => updateField('lastName', e.target.value)}
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
						onChange={(value) => setDraft((prev) => ({ ...prev, birthYear: value, birthDay: '' }))}
					/>
					<SelectExt
						direction="up"
						justify="center"
						nullable
						options={generateMonth()}
						placeholder="Месяц"
						value={draft.birthMonth}
						variant="embedded"
						onChange={(value) => setDraft((prev) => ({ ...prev, birthMonth: value, birthDay: '' }))}
					/>
					<SelectExt
						disabled={!draft.birthYear || !draft.birthMonth}
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
			<Collapse open={isDirty}>
				<FormActions isLoading={isLoading} onCancel={handleCancel} onSave={handleSave} />
			</Collapse>
		</div>
	);
});
