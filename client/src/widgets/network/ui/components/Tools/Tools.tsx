import { useState } from 'react';
import { Icon, IconCertificate, IconLink, IconNetwork, IconPlus } from '@tabler/icons-react';

import { Button } from '@/shared/ui';

import { PortCheck, ServiceCheck, SslCheck } from '.';

type ToolId = 'service' | 'port' | 'ssl';

const tools = [
	{
		id: 'service',
		icon: IconLink,
		title: 'Проверка сервиса',
		description: 'Проверить доступность сайта или сервиса',
	},
	{
		id: 'port',
		icon: IconNetwork,
		title: 'Проверка порта',
		description: 'Проверить доступность сетевого порта',
	},
	{
		id: 'ssl',
		icon: IconCertificate,
		title: 'Проверка SSL',
		description: 'Проверить сертификат и срок действия',
	},
] satisfies { id: ToolId; icon: Icon; title: string; description: string }[];

export const Tools = ({ onAddService }: { onAddService: () => void }) => {
	const [activeTool, setActiveTool] = useState<ToolId | null>(null);

	if (activeTool === 'service') return <ServiceCheck onBack={() => setActiveTool(null)} />;
	if (activeTool === 'port') return <PortCheck onBack={() => setActiveTool(null)} />;
	if (activeTool === 'ssl') return <SslCheck onBack={() => setActiveTool(null)} />;

	return (
		<div className="flex min-h-0 flex-1 flex-col gap-2">
			{tools.map(({ id, icon: Icon, title, description }) => (
				<Button
					key={id}
					className="min-h-0 rounded-xl bg-white/5 px-3 py-2 hover:bg-white/10 xl:min-h-16"
					leftIcon={
						<div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-(--accent-default)/10">
							<Icon className="size-4 text-(--accent-default)" />
						</div>
					}
					size="custom"
					type="button"
					variant="custom"
					onClick={() => setActiveTool(id)}
				>
					<div className="flex min-w-0 flex-1 flex-col items-start">
						<span className="text-sm text-(--color-primary)">{title}</span>
						<span className="truncate text-xs text-(--color-secondary)">{description}</span>
					</div>
				</Button>
			))}
			<Button
				className="mt-auto min-h-0 rounded-xl bg-(--accent-default)/5 px-3 py-2 transition-colors hover:bg-(--accent-default)/10 xl:min-h-16"
				leftIcon={
					<div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-(--accent-default)/10">
						<IconPlus className="size-4 text-(--accent-default)" />
					</div>
				}
				size="custom"
				type="button"
				variant="custom"
				onClick={onAddService}
			>
				<div className="flex min-w-0 flex-1 flex-col items-start">
					<span className="text-sm text-(--color-primary)">Добавить сервис</span>
					<span className="truncate text-xs text-(--color-secondary)">Добавить в постоянный мониторинг</span>
				</div>
			</Button>
		</div>
	);
};
