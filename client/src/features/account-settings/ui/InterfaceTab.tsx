import { IconCategory, IconLanguage, IconPalette } from '@tabler/icons-react';

import { SectionHeader } from './components';
import { AppearanceSection, LanguageSection, WidgetsSection } from './components/interface';

export const InterfaceTab = () => {
	return (
		<div className="flex flex-col gap-4 divide-y divide-(--border-color) xl:divide-y-0">
			<div className="core-base flex flex-col gap-2 pb-4 md:p-4 md:shadow-(--shadow) xl:rounded-xl">
				<SectionHeader icon={IconCategory} title="Виджеты" />
				<WidgetsSection />
			</div>
			<div className="core-base flex flex-col gap-2 pb-4 md:p-4 md:shadow-(--shadow) xl:rounded-xl">
				<SectionHeader icon={IconPalette} title="Внешний вид" />
				<AppearanceSection />
			</div>
			<div className="core-base flex flex-col gap-2 pb-4 md:p-4 md:shadow-(--shadow) xl:rounded-xl">
				<SectionHeader icon={IconLanguage} title="Язык" />
				<LanguageSection />
			</div>
		</div>
	);
};
