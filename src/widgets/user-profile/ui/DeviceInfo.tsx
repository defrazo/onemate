import { IconDesktop, IconPhone } from '@/shared/assets/icons';
import { Preloader } from '@/shared/ui';

import type { BrowserInfo } from '../model';

interface DeviceInfoProps {
	ip: string;
	info: BrowserInfo | null;
	city: string;
	region: string;
}

export const DeviceInfo = ({ ip, info, city, region }: DeviceInfoProps) => {
	return (
		<>
			{info ? (
				<div className="flex justify-center gap-2">
					<div className="flex min-w-32 flex-col items-center">
						{info.isPhone ? <IconPhone className="size-25" /> : <IconDesktop className="size-25" />}
						<span className="font-semibold text-[var(--accent-default)]">{info.browser}</span>
					</div>
					<div className="flex flex-col justify-evenly">
						<div className="flex flex-col gap-1">
							Местоположение:
							<span className="text-[var(--accent-default)]">
								{region}, {city}
							</span>
						</div>
						<div className="flex flex-col gap-1">
							IP-адрес:
							<span className="text-[var(--accent-default)]">{ip}</span>
						</div>
					</div>
				</div>
			) : (
				<div className="flex flex-1 items-center justify-center">
					<Preloader className="size-20" />
				</div>
			)}
		</>
	);
};
