import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import type { Gender } from '@/entities/user-profile';
import LocationSearch from '@/features/location';
import { AvatarPicker } from '@/features/user-avatar';
import { IconTrash } from '@/shared/assets/icons';
import { generateMonth, generateYears } from '@/shared/lib/utils';
import { validateName, validateUsername } from '@/shared/lib/validators';
import { Button, Input, LoadFallback, Radio, SelectExt, Thumbnail } from '@/shared/ui';

import { genderOptions } from '../lib';
import { useProfile } from '../model';

export const PersonalTab = observer(() => {
	const { cityStore, modalStore, notifyStore, profileStore: store, userProfileStore } = useStore();
	const { isMobile, navigate } = useProfile();

	const handleSave = async () => {
		try {
			if (store.firstName) await validateName(store.firstName);
			if (store.lastName) await validateName(store.lastName);
			if (store.username) await validateUsername(store.username);

			await store.saveChanges();
			notifyStore.setNotice('Данные успешно сохранены', 'success');
		} catch (error: any) {
			notifyStore.setNotice(error.message || 'Проверьте введенные данные', 'error');
		}
	};

	if (!store.isReady) return <LoadFallback />;

	return (
		<div className="core-card core-base flex cursor-default flex-col gap-4 select-none">
			<h1 className="core-header">Личные данные</h1>
			<div className="flex flex-col gap-4 md:flex-row">
				<div className="flex flex-col items-center gap-2 md:w-1/3">
					<Thumbnail
						alt="avatar"
						className="size-1/2 cursor-pointer ring-[var(--accent-hover)] hover:ring-1 md:size-fit"
						src={userProfileStore.avatar}
						title="Сменить аватар"
						onClick={() => modalStore.setModal(<AvatarPicker />)}
					/>
					<Button className="w-full" onClick={() => modalStore.setModal(<AvatarPicker />)}>
						Изменить
					</Button>
				</div>
				<div className="flex w-full flex-col justify-center gap-4">
					<div className="flex flex-col gap-1">
						<h3 className="opacity-60">Имя</h3>
						<div className="flex gap-2">
							<Input
								autoComplete="new-password"
								placeholder="Ваше имя"
								value={store.firstName}
								variant="ghost"
								onBlur={(e) => store.updateField('first_name', e.target.value.trim())}
								onChange={(e) => store.updateField('first_name', e.target.value)}
							/>
						</div>
					</div>
					<div className="flex flex-col gap-1">
						<h3 className="opacity-60">Фамилия</h3>
						<Input
							autoComplete="new-password"
							placeholder="Ваша фамилия"
							value={store.lastName}
							variant="ghost"
							onBlur={(e) => store.updateField('last_name', e.target.value.trim())}
							onChange={(e) => store.updateField('last_name', e.target.value)}
						/>
					</div>
					<div className="flex flex-col gap-1">
						<h3 className="opacity-60">Никнейм</h3>
						<Input
							placeholder="Ваш никнейм"
							value={store.username}
							variant="ghost"
							onBlur={(e) => store.updateField('username', e.target.value.trim())}
							onChange={(e) => store.updateField('username', e.target.value)}
						/>
					</div>
					<div className="flex flex-col gap-1">
						<h3 className="opacity-60">Дата рождения</h3>
						<div className="flex gap-2">
							<SelectExt
								justify="center"
								options={generateYears()}
								placeholder="Год"
								value={store.birthYear}
								variant="ghost"
								onChange={(value) => {
									store.updateField('birth_year', value);
									store.updateField('birth_day', '');
								}}
							/>
							<SelectExt
								justify="center"
								options={generateMonth()}
								placeholder="Месяц"
								value={store.birthMonth}
								variant="ghost"
								onChange={(value) => {
									store.updateField('birth_month', value);
									store.updateField('birth_day', '');
								}}
							/>
							<SelectExt
								disabled={!store.birthYear || store.birthMonth === ''}
								justify="center"
								options={store.days.map((d) => ({ value: d, label: d }))}
								placeholder="День"
								value={store.birthDay}
								variant="ghost"
								onChange={(value) => store.updateField('birth_day', value)}
							/>
						</div>
					</div>
					<div className="flex flex-col gap-1">
						<h3 className="opacity-60">Пол:</h3>
						<Radio
							className="gap-4"
							name="gender"
							options={genderOptions}
							value={store.gender}
							onChange={(e) => store.updateField('gender', e.target.value as Gender)}
						/>
					</div>
					<div className="flex flex-col gap-1">
						<h3 className="opacity-60">Город</h3>
						<div className="flex gap-2">
							<LocationSearch />
							<Button
								centerIcon={<IconTrash className="size-6" />}
								className="hover:text-[var(--status-error)]"
								size="custom"
								title="Удалить"
								variant="custom"
								onClick={() => {
									cityStore.deleteCity();
									notifyStore.setNotice('Данные о местоположении удалены!', 'success');
								}}
							/>
						</div>
					</div>
					<div className="flex justify-center gap-4 md:justify-start">
						<Button
							className="w-28"
							disabled={!store.isDirty}
							loading={store.isLoading}
							variant="accent"
							onClick={handleSave}
						>
							Сохранить
						</Button>
						<Button
							className="rounded-xl hover:bg-[var(--status-error)]"
							variant="custom"
							onClick={() =>
								isMobile ? modalStore.modal?.back?.() : navigate('/account/profile?tab=overview')
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
