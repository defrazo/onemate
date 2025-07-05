import { observer } from 'mobx-react-lite';

import SearchCity from '@/features/search-city';
import { AvatarPicker } from '@/features/user-avatar';
import { AVATAR_OPTIONS } from '@/shared/lib/constants';
import { capitalizeFirstLetter } from '@/shared/lib/utils';
import { uiStore } from '@/shared/stores';
import { Button, Input, Radio, SelectExt, Thumbnail } from '@/shared/ui';

import { profileStore, useProfile } from '../model';

export const ProfileInfo = observer(() => {
	const { isMobile, draft, updateDraft, days, genderOptions, saveChanges } = useProfile();

	return (
		<div className="core-card core-base flex flex-col gap-2">
			<h1 className="core-header">Личные данные</h1>
			<div className="flex flex-col gap-4 md:flex-row">
				<div className="flex flex-col items-center gap-2 md:w-1/3">
					<Thumbnail
						alt="avatar"
						className="size-1/2 cursor-pointer ring-[var(--accent-hover)] hover:ring-1 md:size-fit"
						src={draft.avatar || AVATAR_OPTIONS[0]}
						title="Сменить аватар"
						onClick={() =>
							uiStore.setModal(
								<AvatarPicker onSelect={(newAvatar) => updateDraft('avatar', newAvatar)} />
							)
						}
					/>
					<Button
						className="w-full"
						onClick={() => {
							uiStore.setModal(
								<AvatarPicker onSelect={(newAvatar) => updateDraft('avatar', newAvatar)} />
							);
						}}
					>
						Изменить
					</Button>
				</div>
				<div className="flex w-full flex-col justify-center gap-4">
					<div className="flex flex-col gap-1">
						<h3>Имя</h3>
						<Input
							placeholder="Ваше имя"
							value={draft.firstName}
							variant="ghost"
							onChange={(e) => updateDraft('firstName', e.target.value)}
						/>
					</div>
					<div className="flex flex-col gap-1">
						<h3>Фамилия</h3>
						<Input
							placeholder="Ваша фамилия"
							value={draft.lastName}
							variant="ghost"
							onChange={(e) => updateDraft('lastName', e.target.value)}
						/>
					</div>
					<div className="flex flex-col gap-1">
						<h3>Никнейм</h3>
						<Input
							placeholder="Ваш никнейм"
							value={draft.username}
							variant="ghost"
							onChange={(e) => updateDraft('username', e.target.value)}
						/>
					</div>
					<div className="flex flex-col gap-1">
						<h3>Дата рождения</h3>
						<div className="flex gap-2">
							<SelectExt
								justify="center"
								options={Array.from({ length: 100 }, (_, i) => {
									const y = (new Date().getFullYear() - i).toString();
									return { value: y, label: y };
								})}
								placeholder="Год"
								value={draft.year}
								variant="ghost"
								onChange={(value) => (updateDraft('year', value), updateDraft('day', ''))}
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
								value={draft.month}
								variant="ghost"
								onChange={(value) => {
									updateDraft('month', value);
									updateDraft('day', '');
								}}
							/>
							<SelectExt
								disabled={!draft.year || draft.month === ''}
								justify="center"
								options={days.map((d) => ({ value: d, label: d }))}
								placeholder="День"
								value={draft.day}
								variant="ghost"
								onChange={(value) => updateDraft('day', value)}
							/>
						</div>
					</div>
					<div className="flex flex-col gap-1">
						<h3>Пол:</h3>
						<Radio
							className="gap-4"
							name="gender"
							options={genderOptions}
							value={draft.gender}
							onChange={(e) => updateDraft('gender', e.target.value as 'male' | 'female' | null)}
						/>
					</div>
					<div className="flex flex-col gap-1">
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
							onClick={() => {
								isMobile ? uiStore.modal?.back?.() : profileStore.setActiveTab('profile');
							}}
						>
							Отменить
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
});
