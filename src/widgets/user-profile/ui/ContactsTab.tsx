import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import { IconTrash, IconWarning } from '@/shared/assets/icons';
import { cn } from '@/shared/lib/utils';
import { validateEmail, validatePhone } from '@/shared/lib/validators';
import { Button, Input, LoadFallback, PhoneInput } from '@/shared/ui';

import { useProfile } from '../model';

export const ContactsTab = observer(() => {
	const { modalStore, notifyStore, profileStore: store } = useStore();
	const { isMobile, navigate } = useProfile();

	const handleSave = async () => {
		try {
			for (const phone of store.phone) if (phone.trim()) await validatePhone(phone.trim());

			if (!store.mainEmail.trim()) {
				notifyStore.setNotice('Основной e-mail обязателен', 'info');
				return;
			}

			await validateEmail(store.mainEmail.trim());

			for (const email of store.email) if (email.trim()) await validateEmail(email.trim());

			await store.saveChanges();
			notifyStore.setNotice('Данные успешно сохранены', 'success');
		} catch (error: any) {
			notifyStore.setNotice(error.message || 'Проверьте введенные данные', 'error');
		}
	};

	if (!store.isReady) return <LoadFallback />;

	return (
		<div className="core-card core-base flex cursor-default flex-col gap-4 select-none">
			<h1 className="core-header">Контактные данные</h1>
			<div className="flex flex-col items-center gap-2">
				<h2 className="mr-auto text-xl font-semibold">Телефон</h2>
				<div className="flex w-full flex-col gap-2">
					{store.phone.map((phone, idx) => {
						const isLast = idx === store.phone.length - 1;
						const isEmpty = phone.trim() === '';
						const canRemove = !(isLast && isEmpty);

						return (
							<div key={idx} className="flex gap-2">
								<PhoneInput
									className={cn(!canRemove && 'mr-8')}
									value={phone}
									onChange={(value: string) => store.updateArrayField('phone', idx, value)}
								/>
								{canRemove && (
									<Button
										centerIcon={<IconTrash className="size-6" />}
										className="hover:text-[var(--status-error)]"
										size="custom"
										title="Удалить"
										variant="custom"
										onClick={() => store.removeField('phone', idx)}
									/>
								)}
							</div>
						);
					})}
				</div>
			</div>
			<div className="flex flex-col items-center gap-2">
				<h2 className="mr-auto text-xl font-semibold">Почта</h2>
				<div className="flex w-full flex-col gap-1">
					<h3 className="opacity-60">Основная почта</h3>
					<div className="flex gap-2">
						<Input
							error={!store.mainEmail}
							placeholder="Введите e-mail"
							rightIcon={
								!store.mainEmail && (
									<IconWarning className="mr-1.5 size-5 animate-pulse text-[var(--status-error)]" />
								)
							}
							type="email"
							value={store.mainEmail}
							variant="ghost"
							onBlur={(e) => store.updateField('mainEmail', e.target.value.trim())}
							onChange={(e) => store.updateField('mainEmail', e.target.value)}
						/>
						<Button
							centerIcon={<IconTrash className="size-6" />}
							className="hover:text-[var(--status-error)]"
							size="custom"
							title="Очистить"
							variant="custom"
							onClick={() => store.updateField('mainEmail', '')}
						/>
					</div>
				</div>
				<div className="flex w-full flex-col gap-2">
					<h3 className="opacity-60">Резервная почта</h3>
					{store.email.map((email, idx) => {
						const isLast = idx === store.email.length - 1;
						const isEmpty = email.trim() === '';
						const canRemove = !(isLast && isEmpty);

						return (
							<div key={idx} className="flex gap-2">
								<Input
									autoComplete="new-password"
									className={cn(isLast && 'mr-8')}
									placeholder="Введите e-mail"
									value={email}
									variant="ghost"
									onBlur={(e) => store.updateArrayField('email', idx, e.target.value.trim())}
									onChange={(e) => store.updateArrayField('email', idx, e.target.value)}
								/>
								{canRemove && (
									<Button
										centerIcon={<IconTrash className="size-6" />}
										className="hover:text-[var(--status-error)]"
										size="custom"
										title="Удалить"
										variant="custom"
										onClick={() => store.removeField('email', idx)}
									/>
								)}
							</div>
						);
					})}
				</div>
				<div className="mt-2 flex gap-4">
					<Button
						className="w-28"
						disabled={!store.mainEmail || !store.isDirty}
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
	);
});
