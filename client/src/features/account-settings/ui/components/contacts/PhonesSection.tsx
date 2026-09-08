import { useState } from 'react';
import { IconPhoneFilled } from '@tabler/icons-react';
import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import { InputLabel } from '@/features/user-auth';
import { Collapse, PhoneInput } from '@/shared/ui';

import { normalizeArray, withEmptySlot } from '../../../lib';
import { FormActions, RemoveButton } from '..';

const MAX_PHONES = 3;

export const PhonesSection = observer(() => {
	const { notifyStore, userProfileStore } = useStore();

	const [phones, setPhones] = useState<string[]>(() => withEmptySlot(userProfileStore.phones ?? [], MAX_PHONES));
	const [isLoading, setIsLoading] = useState(false);

	const isEmpty = (value: string): boolean => !value.trim() || value === '+7';

	const normalizePhones = (values: string[]): string[] => normalizeArray(values).filter((value) => !isEmpty(value));

	const savedPhones = normalizePhones(userProfileStore.phones ?? []);
	const currentPhones = normalizePhones(phones);

	const isChanged = JSON.stringify(currentPhones) !== JSON.stringify(savedPhones);

	const handleChange = (index: number, value: string): void => {
		setPhones((prev) => {
			const next = [...prev];
			next[index] = value;

			if (next.length > 1 && isEmpty(next[next.length - 2]) && isEmpty(next[next.length - 1])) next.pop();
			if (next.length < MAX_PHONES && !isEmpty(next[next.length - 1])) next.push('');

			return next;
		});
	};

	const handleRemove = (index: number): void => {
		setPhones((prev) =>
			withEmptySlot(
				prev.filter((_, i) => i !== index),
				MAX_PHONES
			)
		);
	};

	const handleCancel = (): void => {
		setPhones(withEmptySlot(userProfileStore.phones ?? [], MAX_PHONES));
	};

	const handleSave = async (): Promise<void> => {
		if (isLoading || !isChanged) return;

		const normalPhones = normalizeArray(phones);

		try {
			setIsLoading(true);

			await userProfileStore.updateProfile({ phones: normalPhones.length ? normalPhones : null });

			setPhones(withEmptySlot(userProfileStore.phones ?? [], MAX_PHONES));
			notifyStore.setNotice('Телефоны сохранены', 'success');
		} catch {
			notifyStore.setNotice('Проверьте введенные данные', 'error');
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="flex flex-col gap-1">
			<span className="text-(--color-secondary) opacity-70">Телефон</span>
			<div className="flex flex-col gap-2">
				{phones.map((phone, index) => {
					const isLast = index === phones.length - 1;
					const isEmptyField = isEmpty(phone);
					const canRemove = !(isLast && isEmptyField);

					return (
						<PhoneInput
							key={index}
							id={`phone-${index}`}
							leftIcon={<InputLabel htmlFor={`phone-${index}`} icon={IconPhoneFilled} />}
							name={`phone-${index}`}
							rightIcon={canRemove && <RemoveButton onClick={() => handleRemove(index)} />}
							value={phone}
							variant="ghost"
							onChange={(value) => handleChange(index, value)}
						/>
					);
				})}
			</div>
			<Collapse open={isChanged}>
				<FormActions isLoading={isLoading} onCancel={handleCancel} onSave={handleSave} />
			</Collapse>
		</div>
	);
});
