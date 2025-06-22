import { useIsMobile } from '@/shared/lib/hooks';
import { uiStore } from '@/shared/stores';
import { Button, Divider, Input } from '@/shared/ui';

import { profileStore } from '../model';

export const ProfileSecure = () => {
	const isMobile = useIsMobile();
	return (
		<div className="core-card core-base flex flex-col gap-2">
			<h1 className="core-header">Безопасность</h1>
			<div className="core-border flex flex-col rounded-xl p-4">
				<div className="flex flex-col gap-2">
					<h2 className="text-xl font-bold">Пароль</h2>
					<div>
						<h3>Новый пароль</h3>
						<Input variant="ghost" />
					</div>
					<div>
						<h3>Повторите новый пароль</h3>
						<Input variant="ghost" />
					</div>
					<div>
						<h3>Старый пароль</h3>
						<Input variant="ghost" />
					</div>
				</div>
			</div>
			<div className="mt-2 flex justify-center gap-4">
				<Button
					className="bg-[var(--accent-default)] text-[var(--accent-text)] hover:bg-[var(--accent-hover)]"
					variant="accent"
					// onClick={saveChanges}
				>
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
			<Divider />
			<div className="flex flex-col gap-2">
				<h2 className="text-xl font-bold">Удалить аккаунт</h2>
				<p className="text-justify">
					При желании вы можете удалить свою учетную запись. После удаления вашей учетной записи вы можете
					зарегистрироваться снова, используя тот же адрес электронной почты.
				</p>
			</div>
			<div className="mt-2 flex justify-center gap-4">
				<Button variant="warning">Удалить мой аккаунт</Button>
			</div>
		</div>
	);
};
