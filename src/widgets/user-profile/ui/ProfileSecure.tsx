import { cityStore } from '@/entities/city';
import { uiStore } from '@/shared/stores';
import { Button, Divider, Input } from '@/shared/ui';

import { profileStore, useProfile } from '../model';
import { DeviceInfo } from '.';

export const ProfileSecure = () => {
	const { isMobile, ip, info } = useProfile();

	return (
		<div className="core-card core-base flex flex-col gap-4">
			<h1 className="core-header">Безопасность</h1>
			<div className="flex flex-col gap-2">
				<div className="flex flex-col gap-2">
					<h2 className="text-xl font-bold">Пароль</h2>
					<span className="text-sm text-[var(--color-disabled)]">
						Ваш пароль был изменен четыре года назад (02.02.2001)
					</span>
					<div className="flex flex-col gap-1">
						<h3>Новый пароль</h3>
						<Input variant="ghost" />
					</div>
					<div className="flex flex-col gap-1">
						<h3>Повторите новый пароль</h3>
						<Input variant="ghost" />
					</div>
					<div className="flex flex-col gap-1">
						<h3>Старый пароль</h3>
						<Input variant="ghost" />
					</div>
				</div>
				<div className="mt-2 flex justify-center gap-2">
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
			</div>
			<Divider />
			<div className="flex flex-col gap-2">
				<div className="flex flex-col gap-2">
					<h2 className="text-xl font-bold">Устройства и активность</h2>
					<div className="flex flex-col gap-1">
						<h3 className="text-sm text-[var(--color-disabled)]">Текущее устройство:</h3>
						<DeviceInfo city={cityStore.cityName} info={info} ip={ip} region={cityStore.cityRegion} />
					</div>
				</div>
			</div>
			<Divider />
			<div className="flex flex-col items-center gap-4">
				<h2 className="mr-auto text-xl font-bold">Удалить аккаунт</h2>
				<p className="text-justify">
					При желании вы можете удалить свою учетную запись. После удаления вашей учетной записи вы можете
					зарегистрироваться снова, используя тот же адрес электронной почты.
				</p>
				<Button className="mt-2" variant="warning">
					Удалить мой аккаунт
				</Button>
			</div>
		</div>
	);
};
