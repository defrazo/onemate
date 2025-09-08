import { observer } from 'mobx-react-lite';

import { useCopy } from '@/shared/lib/hooks';
import { cn } from '@/shared/lib/utils';
import { Preloader, SelectExt, Textarea } from '@/shared/ui';

import type { TranslatorStore } from '../model';
import { TranslatorBoxActions } from '.';

interface TranslatorBoxProps {
	store: TranslatorStore;
	text: string;
	language: string;
	type: 'source' | 'target';
	onChangeLang: (value: string) => void;
	onClear?: () => void;
}

export const TranslatorBox = observer(({ store, text, language, type, onChangeLang, onClear }: TranslatorBoxProps) => {
	const isSource = type === 'source';
	const copy = useCopy();

	return (
		<div className="core-border relative flex flex-1 flex-col rounded-xl">
			<div className="flex-1">
				{store.isLoading && !isSource ? (
					<div className="flex h-full items-center justify-center">
						<Preloader className="size-15" />
					</div>
				) : (
					<Textarea
						className="hide-scrollbar h-full min-h-28 overflow-auto px-2 pt-10 text-sm"
						readOnly={!isSource}
						size="custom"
						value={text}
						variant="custom"
						onChange={(e) => store.updateTextbox(0, 'text', e.target.value)}
					/>
				)}
				<TranslatorBoxActions
					disabled={text === '' || store.isLoading}
					type={type}
					onClear={onClear}
					onCopy={() => copy(text, `${isSource ? 'Оригинал' : 'Перевод'} скопирован!`)}
				/>
			</div>
			<div className={cn(isSource ? 'pr-4 pl-2' : 'pr-2 pl-4')}>
				<SelectExt
					className="rounded-none border-t border-[var(--border-color)] text-sm"
					options={store.languages}
					value={language}
					variant="mobile"
					visibleDown={false}
					visibleKey={false}
					onChange={(value) => onChangeLang(value)}
				/>
			</div>
		</div>
	);
});
