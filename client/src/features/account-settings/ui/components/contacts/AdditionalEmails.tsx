import { useState } from 'react';
import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import { useValidation } from '@/shared/lib/hooks';
import { Collapse, Input } from '@/shared/ui';

import { normalizeArray, withEmptySlot } from '../../../lib';
import { FormActions, RemoveButton } from '..';

const MAX_EMAILS = 3;

export const AdditionalEmails = observer(() => {
	const { checkEmail } = useValidation();

	const { notifyStore, userProfileStore } = useStore();

	const [isLoading, setIsLoading] = useState(false);
	const [emails, setEmails] = useState(() => withEmptySlot(userProfileStore.emails ?? [], MAX_EMAILS));

	const savedEmails = normalizeArray(userProfileStore.emails ?? []);
	const currentEmails = normalizeArray(emails);

	const isChanged = JSON.stringify(currentEmails) !== JSON.stringify(savedEmails);

	const handleChange = (idx: number, value: string) => {
		setEmails((prev) => {
			const next = [...prev];
			next[idx] = value;

			return withEmptySlot(next, MAX_EMAILS);
		});
	};

	const handleRemove = (idx: number) => {
		setEmails((prev) =>
			withEmptySlot(
				prev.filter((_, i) => i !== idx),
				MAX_EMAILS
			)
		);
	};

	const handleCancel = () => {
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
			<span className="text-(--text-secondary) opacity-70">Резервная почта</span>
			<div className="flex flex-col gap-2">
				{emails.map((email, idx) => {
					const isLast = idx === emails.length - 1;
					const isEmpty = email.trim() === '';
					const canRemove = !(isLast && isEmpty);

					return (
						<Input
							key={idx}
							autoComplete="off"
							id={`email-${idx}`}
							name={`email-${idx}`}
							placeholder="Введите e-mail"
							rightIcon={canRemove && <RemoveButton onClick={() => handleRemove(idx)} />}
							type="email"
							value={email}
							variant="tone"
							onChange={(e) => handleChange(idx, e.target.value)}
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
