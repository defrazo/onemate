import { useState } from 'react';

import { userStore } from '@/entities/user/model';
import { userProfileStore } from '@/entities/userProfile';
import { IconAdd, IconBack, IconTrash } from '@/shared/assets/icons';
import { appStore } from '@/shared/store/appStore';
import { Button, Divider, Input } from '@/shared/ui';

import { profileStore } from '../model';

export const ProfileContacts = () => {
	const [phones, setPhones] = useState<string[]>(
		userProfileStore.profile?.phone?.length ? userProfileStore.profile.phone : ['']
	);

	const [emails, setEmails] = useState<string[]>(
		userProfileStore.profile?.email?.length ? userProfileStore.profile.email : ['']
	);

	const [email, setEmail] = useState<string>(userStore.user?.email || '');

	const handleFocus = (field: string) => {
		// if (field === 'phone') setPhone('');
		if (field === 'email') setEmail('');
	};

	const handleBlur = (field: string) => {
		// if (field === 'phone' && phone.trim() === '') setPhone(userProfileStore.profile?.phone || '');
		if (field === 'email' && email.trim() === '') setEmail(userStore.user?.email || '');
	};

	const updatePhone = (index: number, value: string) => {
		const updated = [...phones];
		updated[index] = value;
		setPhones(updated);
	};

	const updateEmail = (index: number, value: string) => {
		const updated = [...emails];
		updated[index] = value;
		setEmails(updated);
	};

	const removePhone = (index: number) => {
		const updated = phones.filter((_, i) => i !== index);
		setPhones(updated.length ? updated : ['']);
	};

	const removeEmail = (index: number) => {
		const updated = emails.filter((_, i) => i !== index);
		setEmails(updated.length ? updated : ['']);
	};

	const addPhone = () => setPhones([...phones, '']);
	const addEmail = () => setEmails([...emails, '']);

	const saveChanges = () => {
		userProfileStore.updatePhone(phones);
		userProfileStore.updateEmail(emails);
		appStore.setSuccess('Данные успешно сохранены');
	};

	return (
		<div className="core-card core-base flex flex-col gap-2">
			<div className="relative flex items-center">
				<Button
					centerIcon={<IconBack className="size-6" />}
					className="absolute left-0 md:hidden"
					size="custom"
					variant="mobile"
					onClick={() => profileStore.setActiveTab('profile')}
				/>
				<h1 className="core-header">Контактные данные</h1>
			</div>
			<div className="core-border flex flex-col rounded-xl p-4">
				<div className="flex flex-col gap-2">
					<h2 className="text-xl font-semibold">Телефон</h2>
					<div className="flex flex-col gap-2">
						{phones.map((phone, index) => (
							<div key={index} className="flex">
								<Input
									placeholder="+7 ..."
									value={phone}
									variant="ghost"
									onChange={(e) => updatePhone(index, e.target.value)}
								/>
								<Button
									centerIcon={<IconTrash className="h-6" />}
									className="hover:text-[var(--status-error)]"
									size="sm"
									variant="custom"
									onClick={() => removePhone(index)}
								/>
							</div>
						))}
					</div>
					<Button
						centerIcon={<IconAdd className="h-6" />}
						size="custom"
						variant="rounded"
						onClick={addPhone}
					/>
				</div>
			</div>
			<Divider />
			<div className="core-border flex flex-col rounded-xl p-4">
				<div className="flex flex-col gap-4">
					<h2 className="text-xl font-semibold">Почта</h2>
					<div className="flex flex-col gap-2">
						<h3>Основная почта</h3>
						<Input
							placeholder="Введите электронную почту"
							value={email}
							variant="ghost"
							onBlur={() => handleBlur('email')}
							onChange={(e) => setEmail(e.target.value)}
							onFocus={() => handleFocus('email')}
						/>
					</div>
					<div className="flex flex-col gap-2">
						<h3>Резервная почта</h3>
						{emails.map((email, index) => (
							<div key={index} className="flex">
								<Input
									placeholder="Введите email"
									value={email}
									variant="ghost"
									onChange={(e) => updateEmail(index, e.target.value)}
								/>
								<Button
									centerIcon={<IconTrash className="h-6" />}
									className="hover:text-[var(--status-error)]"
									size="sm"
									variant="custom"
									onClick={() => removeEmail(index)}
								/>
							</div>
						))}
					</div>
					<Button
						centerIcon={<IconAdd className="size-6" />}
						size="custom"
						variant="rounded"
						onClick={addEmail}
					/>
				</div>
			</div>
			<div className="mt-2 flex justify-center gap-4">
				<Button variant="accent" onClick={saveChanges}>
					Сохранить
				</Button>
				<Button
					className="rounded-xl hover:bg-[var(--status-error)]"
					variant="custom"
					onClick={() => profileStore.setActiveTab('profile')}
				>
					Отменить
				</Button>
			</div>
		</div>
	);
};
