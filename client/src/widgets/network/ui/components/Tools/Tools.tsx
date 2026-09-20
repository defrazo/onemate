import { useState } from 'react';
import { Icon, IconCertificate, IconLink, IconPlugConnected, IconPlus } from '@tabler/icons-react';

import { AddressCheck, PortCheck, SslCheck } from '.';

type ToolId = 'address' | 'port' | 'ssl';

interface ToolsProps {
	onAddResource: () => void;
}

const tools = [
	{
		id: 'address',
		icon: IconLink,
		title: 'Проверка адреса',
		description: 'Проверить доступность сайта или сервера',
	},
	{
		id: 'port',
		icon: IconPlugConnected,
		title: 'Проверка порта',
		description: 'Проверить доступность порта',
	},
	{
		id: 'ssl',
		icon: IconCertificate,
		title: 'Проверка SSL',
		description: 'Проверить сертификат и срок действия',
	},
] satisfies { id: ToolId; icon: Icon; title: string; description: string }[];

export const Tools = ({ onAddResource }: ToolsProps) => {
	const [activeTool, setActiveTool] = useState<ToolId | null>(null);

	if (activeTool === 'address') {
		return <AddressCheck onBack={() => setActiveTool(null)} />;
	}

	if (activeTool === 'port') {
		return <PortCheck onBack={() => setActiveTool(null)} />;
	}

	if (activeTool === 'ssl') {
		return <SslCheck onBack={() => setActiveTool(null)} />;
	}
	return (
		<div className="flex min-h-0 flex-1 flex-col gap-2">
			{tools.map(({ id, icon: Icon, title, description }) => (
				<button
					key={id}
					className="core-border flex min-h-16 items-center gap-3 bg-(--bg-secondary) px-3 text-left transition hover:bg-white/2"
					type="button"
					onClick={() => setActiveTool(id)}
				>
					<div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-(--accent-default)/10">
						<Icon className="size-4 text-(--accent-default)" />
					</div>
					<div className="flex min-w-0 flex-col">
						<span className="text-sm text-(--color-primary)">{title}</span>
						<span className="truncate text-xs text-(--color-secondary)">{description}</span>
					</div>
				</button>
			))}

			<div className="mt-1 border-t border-(--border-color) pt-2">
				<button
					className="core-border flex min-h-16 w-full items-center gap-3 rounded-xl px-3 text-left transition hover:bg-(--accent-default)/5"
					type="button"
					onClick={onAddResource}
				>
					<div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-(--accent-default)/10">
						<IconPlus className="size-4 text-(--accent-default)" />
					</div>

					<div className="flex min-w-0 flex-col">
						<span className="text-sm text-(--color-primary)">Добавить ресурс</span>
						<span className="text-xs text-(--color-secondary)">Добавить сайт или сервис в мониторинг</span>
					</div>
				</button>
			</div>
		</div>
	);
};
