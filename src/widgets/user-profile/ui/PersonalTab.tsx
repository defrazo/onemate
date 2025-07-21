import { observer } from 'mobx-react-lite';

import SearchCity from '@/features/search-city';
import { AvatarPicker } from '@/features/user-avatar';
import { AVATAR_OPTIONS } from '@/shared/lib/constants';
import { generateMonth, generateYears } from '@/shared/lib/utils';
import { validateName, validateUsername } from '@/shared/lib/validators';
import { notifyStore, uiStore } from '@/shared/stores';
import { Button, Input, LoadFallback, Radio, SelectExt, Thumbnail } from '@/shared/ui';

import { genderOptions } from '../lib';
import type { DraftProfile } from '../model';
import { profileStore, useProfile } from '../model';

export const PersonalTab = observer(() => {
	const { isMobile, navigate } = useProfile();
	const store = profileStore;

	const openAvatarPicker = () => {
		uiStore.setModal(<AvatarPicker onSelect={(newAvatar) => store.updateField('avatar', newAvatar)} />);
	};

	const handleSave = async () => {
		try {
			await validateName(store.firstName);
			await validateName(store.lastName);
			await validateUsername(store.username);
			await store.saveChanges();
		} catch (error: any) {
			notifyStore.setError(error.message || 'Проверьте введенные данные');
		}
	};

	if (!store.isProfileUploaded) return <LoadFallback />;

	return (
		<div className="core-card core-base flex flex-col gap-2">
			<h1 className="core-header">Личные данные</h1>
			<div className="flex min-h-52 flex-col gap-4 md:flex-row">
				<div className="flex flex-col items-center gap-2 md:w-1/3">
					<Thumbnail
						alt="avatar"
						className="size-1/2 cursor-pointer ring-[var(--accent-hover)] hover:ring-1 md:size-fit"
						src={store.avatar || AVATAR_OPTIONS[0]}
						title="Сменить аватар"
						onClick={openAvatarPicker}
					/>
					<Button className="w-full" onClick={openAvatarPicker}>
						Изменить
					</Button>
				</div>
				<div className="flex w-full flex-col justify-center gap-4">
					<div className="flex flex-col gap-1">
						<h3>Имя</h3>
						<Input
							placeholder="Ваше имя"
							value={store.firstName}
							variant="ghost"
							onBlur={(e) => store.updateField('firstName', e.target.value.trim())}
							onChange={(e) => store.updateField('firstName', e.target.value)}
						/>
					</div>
					<div className="flex flex-col gap-1">
						<h3>Фамилия</h3>
						<Input
							placeholder="Ваша фамилия"
							value={store.lastName}
							variant="ghost"
							onBlur={(e) => store.updateField('lastName', e.target.value.trim())}
							onChange={(e) => store.updateField('lastName', e.target.value)}
						/>
					</div>
					<div className="flex flex-col gap-1">
						<h3>Никнейм</h3>
						<Input
							placeholder="Ваш никнейм"
							value={store.username}
							variant="ghost"
							onBlur={(e) => store.updateField('username', e.target.value.trim())}
							onChange={(e) => store.updateField('username', e.target.value)}
						/>
					</div>
					<div className="flex flex-col gap-1">
						<h3>Дата рождения</h3>
						<div className="flex gap-2">
							<SelectExt
								justify="center"
								options={generateYears()}
								placeholder="Год"
								value={store.birthYear}
								variant="ghost"
								onChange={(value) => {
									store.updateField('birthYear', value);
									store.updateField('birthDay', '');
								}}
							/>
							<SelectExt
								justify="center"
								options={generateMonth()}
								placeholder="Месяц"
								value={store.birthMonth}
								variant="ghost"
								onChange={(value) => {
									store.updateField('birthMonth', value);
									store.updateField('birthDay', '');
								}}
							/>
							<SelectExt
								disabled={!store.birthYear || store.birthMonth === ''}
								justify="center"
								options={store.days.map((d) => ({ value: d, label: d }))}
								placeholder="День"
								value={store.birthDay}
								variant="ghost"
								onChange={(value) => store.updateField('birthDay', value)}
							/>
						</div>
					</div>
					<div className="flex flex-col gap-1">
						<h3>Пол:</h3>
						<Radio
							className="gap-4"
							name="gender"
							options={genderOptions}
							value={store.gender}
							onChange={(e) => store.updateField('gender', e.target.value as DraftProfile['gender'])}
						/>
					</div>
					<div className="flex flex-col gap-1">
						<h3>Город</h3>
						<SearchCity />
					</div>
					<div className="flex justify-center gap-4 md:justify-start">
						<Button variant="accent" onClick={handleSave}>
							Сохранить
						</Button>
						<Button
							className="rounded-xl hover:bg-[var(--status-error)]"
							variant="custom"
							onClick={() =>
								isMobile ? uiStore.modal?.back?.() : navigate('/account/profile?tab=overview')
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
