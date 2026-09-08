import { useState } from 'react';
import { IconMailOpenedFilled } from '@tabler/icons-react';
import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import { InputLabel, useAuth } from '@/features/user-auth';
import { Collapse, Input } from '@/shared/ui';

import { normalizeArray, withEmptySlot } from '../../../lib';
import { FormActions, RemoveButton } from '..';

const MAX_EMAILS = 3;

export const AdditionalEmails = observer(() => {
	const { notifyStore, userProfileStore } = useStore();
	const { checkEmail } = useAuth();

	const [isLoading, setIsLoading] = useState(false);
	const [emails, setEmails] = useState<string[]>(() => withEmptySlot(userProfileStore.emails ?? [], MAX_EMAILS));

	const savedEmails = normalizeArray(userProfileStore.emails ?? []);
	const currentEmails = normalizeArray(emails);

	const isChanged = JSON.stringify(currentEmails) !== JSON.stringify(savedEmails);

	const handleChange = (index: number, value: string): void => {
		setEmails((prev) => {
			const next = [...prev];
			next[index] = value;

			return withEmptySlot(next, MAX_EMAILS);
		});
	};

	const handleRemove = (index: number): void => {
		setEmails((prev) =>
			withEmptySlot(
				prev.filter((_, i) => i !== index),
				MAX_EMAILS
			)
		);
	};

	const handleCancel = (): void => {
		setEmails(withEmptySlot(userProfileStore.emails ?? [], MAX_EMAILS));
	};

	const handleSave = async (): Promise<void> => {
		if (isLoading || !isChanged) return;

		const normalEmails = normalizeArray(emails);

		for (const email of normalEmails) {
			if (!checkEmail(email)) return;
		}

		try {
			setIsLoading(true);

			await userProfileStore.updateProfile({ additional_emails: normalEmails.length ? normalEmails : null });

			setEmails(withEmptySlot(userProfileStore.emails ?? [], MAX_EMAILS));
			notifyStore.setNotice('Резервная почта сохранена', 'success');
		} catch {
			notifyStore.setNotice('Проверьте введенные данные', 'error');
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="flex flex-col gap-1">
			<span className="text-(--color-secondary) opacity-70">Резервная почта</span>
			<div className="flex flex-col gap-2">
				{emails.map((email, index) => {
					const isLast = index === emails.length - 1;
					const isEmpty = email.trim() === '';
					const canRemove = !(isLast && isEmpty);

					return (
						<Input
							key={index}
							autoComplete="off"
							id={`email-${index}`}
							leftIcon={<InputLabel htmlFor={`email-${index}`} icon={IconMailOpenedFilled} />}
							name={`email-${index}`}
							placeholder="Введите e-mail"
							rightIcon={canRemove && <RemoveButton onClick={() => handleRemove(index)} />}
							type="email"
							value={email}
							variant="ghost"
							onChange={(e) => handleChange(index, e.target.value)}
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
