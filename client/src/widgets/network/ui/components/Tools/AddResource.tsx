import { type FormEvent, useState } from 'react';
import { IconArrowLeft, IconPlus } from '@tabler/icons-react';

import { Button, Input } from '@/shared/ui';
import { NetworkStore } from '@/widgets/network/model';

interface AddResourceProps {
	store: NetworkStore;
	onBack: () => void;
	onCreated: () => void;
}

export const AddResource = ({ store, onBack, onCreated }: AddResourceProps) => {
	const [name, setName] = useState('');
	const [url, setUrl] = useState('');
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		const trimmedName = name.trim();
		const trimmedUrl = url.trim();

		if (!trimmedName || !trimmedUrl) {
			setError('Заполните название и адрес.');
			return;
		}

		setError(null);
		setIsLoading(true);

		try {
			await store.addService({
				name: trimmedName,
				url: trimmedUrl,
			});

			onCreated();
		} catch (error) {
			setError(error instanceof Error ? error.message : 'Не удалось добавить ресурс.');
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="flex min-h-0 flex-1 flex-col">
			<div className="flex items-center gap-3">
				<Button type="button" onClick={onBack}>
					<IconArrowLeft className="size-4" />
					Назад
				</Button>

				<span className="font-bold text-(--color-primary)">Добавить ресурс</span>
			</div>
			<form className="mt-4 flex min-h-0 flex-1 flex-col gap-3" onSubmit={handleSubmit}>
				<Input
					maxLength={100}
					placeholder="Название"
					value={name}
					onChange={(event) => setName(event.target.value)}
				/>
				<Input
					maxLength={2048}
					placeholder="https://example.com"
					value={url}
					onChange={(event) => setUrl(event.target.value)}
				/>
				{error && <span className="text-sm text-(--status-error)">{error}</span>}
				<Button className="mt-auto" disabled={isLoading} type="submit">
					<IconPlus className="size-4" />
					{isLoading ? 'Добавление...' : 'Добавить ресурс'}
				</Button>
			</form>
		</div>
	);
};
