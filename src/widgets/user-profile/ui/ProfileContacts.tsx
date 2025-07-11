import { IconAdd, IconTrash } from '@/shared/assets/icons';
import { uiStore } from '@/shared/stores';
import { Button, Divider, Input } from '@/shared/ui';

import { profileStore, useProfile } from '../model';

export const ProfileContacts = () => {
	const { isMobile, draft, saveChanges, updateDraft, updateArrayField, addField, removeField } = useProfile();

	return (
		<div className="core-card core-base flex flex-col gap-4">
			<h1 className="core-header">Контактные данные</h1>
			<div className="flex flex-col items-center gap-2">
				<h2 className="mr-auto text-xl font-semibold">Телефон</h2>
				<div className="flex w-full flex-col gap-2">
					{draft.phone.map((phone, idx) => (
						<div key={idx} className="flex gap-2">
							<Input
								value={phone}
								variant="ghost"
								onChange={(e) => updateArrayField('phone', idx, e.target.value)}
							/>
							<Button
								centerIcon={<IconTrash className="size-6" />}
								className="hover:text-[var(--status-error)]"
								size="custom"
								variant="custom"
								onClick={() => removeField('phone', idx)}
							/>
						</div>
					))}
				</div>
				<Button
					centerIcon={<IconAdd className="size-6" />}
					className="rounded-full p-2"
					size="custom"
					onClick={() => addField('phone')}
				/>
			</div>
			<Divider />
			<div className="flex flex-col items-center gap-2">
				<h2 className="mr-auto text-xl font-semibold">Почта</h2>
				<div className="flex w-full flex-col gap-1">
					<h3>Основная почта</h3>
					<div className="flex gap-2">
						<Input
							error={!draft.mainEmail}
							placeholder="Введите электронную почту"
							type="email"
							value={draft.mainEmail}
							variant="ghost"
							onChange={(e) => updateDraft('mainEmail', e.target.value)}
						/>
						<Button
							centerIcon={<IconTrash className="size-6" />}
							className="hover:text-[var(--status-error)]"
							size="custom"
							variant="custom"
							onClick={() => updateDraft('mainEmail', '')}
						/>
					</div>
				</div>
				<div className="flex w-full flex-col gap-1">
					<h3>Резервная почта</h3>
					{draft.email.map((email, idx) => (
						<div key={idx} className="flex gap-2">
							<Input
								placeholder="Введите email"
								value={email}
								variant="ghost"
								onChange={(e) => updateArrayField('email', idx, e.target.value)}
							/>
							<Button
								centerIcon={<IconTrash className="size-6" />}
								className="hover:text-[var(--status-error)]"
								size="custom"
								variant="custom"
								onClick={() => removeField('email', idx)}
							/>
						</div>
					))}
				</div>
				<Button
					centerIcon={<IconAdd className="size-6" />}
					className="rounded-full p-2"
					size="custom"
					onClick={() => addField('email')}
				/>
				<div className="mt-2 flex gap-4">
					<Button disabled={!draft.mainEmail} variant="accent" onClick={saveChanges}>
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
	);
};
