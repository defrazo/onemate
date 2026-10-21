import { useState } from 'react';
import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import { Collapse, PhoneInput } from '@/shared/ui';

import { normalizeArray, withEmptySlot } from '../../../lib';
import { FormActions, RemoveButton } from '..';

const MAX_PHONES = 3;

export const PhonesSection = observer(() => {
	const { notifyStore, userProfileStore } = useStore();

	const [phones, setPhones] = useState(() => withEmptySlot(userProfileStore.phones ?? [], MAX_PHONES));
	const [isLoading, setIsLoading] = useState(false);

	const isEmpty = (value: string) => !value.trim() || value === '+7';

	const normalizePhones = (values: string[]): string[] => normalizeArray(values).filter((value) => !isEmpty(value));

	const savedPhones = normalizePhones(userProfileStore.phones ?? []);
	const currentPhones = normalizePhones(phones);

	const isChanged = JSON.stringify(currentPhones) !== JSON.stringify(savedPhones);

	const handleChange = (idx: number, value: string) => {
		setPhones((prev) => {
			const next = [...prev];
			next[idx] = value;

			if (next.length > 1 && isEmpty(next[next.length - 2]) && isEmpty(next[next.length - 1])) next.pop();
			if (next.length < MAX_PHONES && !isEmpty(next[next.length - 1])) next.push('');

			return next;
		});
	};

	const handleRemove = (idx: number) => {
		setPhones((prev) =>
			withEmptySlot(
				prev.filter((_, i) => i !== idx),
				MAX_PHONES
			)
		);
	};

	const handleCancel = () => {
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
			<div className="flex flex-col gap-2">
				{phones.map((phone, idx) => {
					const isLast = idx === phones.length - 1;
					const isEmptyField = isEmpty(phone);
					const canRemove = !(isLast && isEmptyField);

					return (
						<PhoneInput
							key={idx}
							id={`phone-${idx}`}
							name={`phone-${idx}`}
							rightIcon={canRemove && <RemoveButton onClick={() => handleRemove(idx)} />}
							value={phone}
							variant="tone"
							onChange={(value) => handleChange(idx, value)}
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
