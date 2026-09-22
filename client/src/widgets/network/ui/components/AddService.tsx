import { useState } from 'react';
import { IconAlertCircle, IconLink, IconServer, IconWorldWww, IconX } from '@tabler/icons-react';

import { useStore } from '@/app/providers';
import { Button, Input, InputLabel } from '@/shared/ui';

import { ViewHeader } from '.';

export const AddService = ({ onBack, onCreated }: { onBack: () => void; onCreated: () => void }) => {
	const { networkStore, notifyStore } = useStore();

	const [name, setName] = useState('');
	const [url, setUrl] = useState('');

	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	const isValid = name.trim() !== '' && url.trim() !== '';

	const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
		event.preventDefault();

		if (!isValid || isLoading) return;

		setError(null);
		setIsLoading(true);

		try {
			await networkStore.addService({ name: name.trim(), url: url.trim() });
			onCreated();
			notifyStore.setNotice('Сервис успешно добавлен', 'success');
		} catch (error) {
			error instanceof Error ? setError(error.message) : notifyStore.setNotice('Что-то пошло не так', 'error');
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="flex h-full min-h-0 flex-col gap-2">
			<ViewHeader icon={IconServer} title="Добавить сервис" onBack={onBack} />
			<form className="flex flex-col gap-3" onSubmit={handleSubmit}>
				<div className="flex flex-col gap-1">
					<label className="text-(--color-secondary) opacity-70" htmlFor="name">
						Название
					</label>
					<Input
						autoComplete="off"
						id="name"
						leftIcon={<InputLabel htmlFor="name" icon={IconWorldWww} />}
						placeholder="Название сервиса"
						rightIcon={
							name && (
								<IconX
									className="mr-1 ml-1.5 size-5 cursor-pointer text-(--color-secondary) opacity-50 transition-[color,opacity] hover:text-(--accent-default) hover:opacity-100"
									onClick={() => setName('')}
								/>
							)
						}
						type="text"
						value={name}
						variant="ghost"
						onChange={(event) => setName(event.target.value)}
					/>
				</div>
				<div className="flex flex-col gap-1">
					<label className="text-(--color-secondary) opacity-70" htmlFor="url">
						Адрес
					</label>
					<Input
						autoComplete="url"
						id="url"
						inputMode="url"
						leftIcon={<InputLabel htmlFor="url" icon={IconLink} />}
						placeholder="https://example.com"
						rightIcon={
							url && (
								<IconX
									className="mr-1 ml-1.5 size-5 cursor-pointer text-(--color-secondary) opacity-50 transition-[color,opacity] hover:text-(--accent-default) hover:opacity-100"
									onClick={() => {
										setUrl('');
										setError(null);
									}}
								/>
							)
						}
						type="text"
						value={url}
						variant="ghost"
						onChange={(event) => {
							setUrl(event.target.value);
							setError(null);
						}}
					/>
					{error && (
						<div className="flex items-start gap-1.5 px-1 text-xs text-(--status-error)">
							<IconAlertCircle className="mt-px size-3.5 shrink-0" />
							<span>{error}</span>
						</div>
					)}
				</div>
				<Button
					className="ml-auto h-7 rounded-lg px-3 text-sm"
					disabled={!isValid || isLoading}
					loading={isLoading}
					loadingText="Добавляем..."
					size="custom"
					title="Добавить"
					type="submit"
					variant="accent"
				>
					Добавить
				</Button>
			</form>
		</div>
	);
};
