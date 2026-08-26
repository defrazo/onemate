import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import type { Gender } from '@/entities/user-profile';
import LocationSearch from '@/features/location';
import { AvatarPicker } from '@/features/user-avatar';
import { IconTrash } from '@/shared/assets/icons';
import { DEFAULT_AVATAR } from '@/shared/lib/constants';
import { useModalBack } from '@/shared/lib/hooks';
import { generateMonth, generateYears } from '@/shared/lib/utils';
import { validateName, validateUsername } from '@/shared/lib/validators';
import { Button, Input, LoadFallback, Radio, SelectExt, Thumbnail } from '@/shared/ui';
import { MobileUserMenu } from '@/widgets/user-menu';

import { genderOptions } from '../lib';
import { useProfile } from '../model';

export const PersonalTab = observer(() => {
	const { cityStore, modalStore, notifyStore, profileStore: store, userProfileStore } = useStore();
	const { device } = useProfile();
	useModalBack(<MobileUserMenu />);

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
							value={store.firstName}
							variant="ghost"
							onBlur={(e) => store.updateField('first_name', e.target.value.trim())}
							onChange={(e) => store.updateField('first_name', e.target.value)}
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
							value={store.lastName}
							variant="ghost"
							onBlur={(e) => store.updateField('last_name', e.target.value.trim())}
							onChange={(e) => store.updateField('last_name', e.target.value)}
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
							value={store.username}
							variant="ghost"
							onBlur={(e) => store.updateField('username', e.target.value.trim())}
							onChange={(e) => store.updateField('username', e.target.value)}
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
								value={store.birthYear}
								variant="embedded"
								onChange={(value) => {
									store.updateField('birth_year', value);
									store.updateField('birth_day', '');
								}}
							/>
							<SelectExt
								direction="up"
								justify="center"
								nullable
								options={generateMonth()}
								placeholder="Месяц"
								value={store.birthMonth}
								variant="embedded"
								onChange={(value) => {
									store.updateField('birth_month', value);
									store.updateField('birth_day', '');
								}}
							/>
							<SelectExt
								disabled={!store.birthYear || store.birthMonth === ''}
								justify="center"
								nullable
								options={store.days.map((d) => ({ value: d, label: d }))}
								placeholder="День"
								value={store.birthDay}
								variant="embedded"
								onChange={(value) => store.updateField('birth_day', value)}
							/>
						</div>
					</div>
					<div className="flex flex-col gap-1">
						<span className="text-(--color-secondary) opacity-70">Пол</span>
						<Radio
							className="flex-col gap-4 md:flex-row"
							name="gender"
							options={genderOptions}
							value={store.gender}
							onChange={(e) => store.updateField('gender', e.target.value as Gender)}
						/>
					</div>
					<div className="flex flex-col gap-1">
						<label className="text-(--color-secondary) opacity-70" htmlFor="location">
							Город
						</label>
						<div className="flex gap-2">
							<LocationSearch />
							<Button
								centerIcon={<IconTrash className="size-6" />}
								className="hover:text-(--status-error)"
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
							disabled={device !== 'mobile' && !store.isDirty}
							variant="warning"
							onClick={() =>
								device === 'mobile'
									? modalStore.setModal(<MobileUserMenu />, 'sheet')
									: store.loadDraft()
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
