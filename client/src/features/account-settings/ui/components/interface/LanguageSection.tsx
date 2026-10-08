import { Select } from '@/shared/ui';

const languages = [
	{ key: 'ru', label: 'Русский', value: 'ru' },
	{ key: 'en', label: 'English', value: 'en' },
];

export const LanguageSection = () => {
	return (
		<section className="flex items-center justify-between select-none">
			<div className="flex items-center gap-2">
				<p className="text-sm whitespace-nowrap text-(--text-secondary) opacity-70 xl:text-base">
					Язык интерфейса
				</p>
				<span className="trim mt-0.5 hidden h-4 rounded-md bg-(--bg-tertiary) px-1.5 py-1 text-[10px] text-(--text-secondary) xl:block">
					Скоро
				</span>
			</div>
			<Select
				disabled
				className="ml-auto max-w-36 xl:max-w-52"
				listClassName="my-1 -mr-1 max-w-52"
				options={languages}
				value="ru"
				onChange={() => {}}
			/>
		</section>
	);
};
