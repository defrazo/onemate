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
		<div className="core-border relative flex flex-1 flex-col">
			<div className="flex h-full min-h-28 flex-1 items-center justify-center">
				{store.isLoading && !isSource ? (
					<Preloader className="z-20 size-15" />
				) : (
					<>
						<Textarea
							className="hide-scrollbar h-full overflow-auto px-2 pt-10 text-base"
							readOnly={!isSource}
							size="custom"
							value={text}
							variant="custom"
							onChange={(e) => store.updateTextbox(0, 'text', e.target.value)}
						/>
						<TranslatorBoxActions
							disabled={text === '' || store.isLoading}
							type={type}
							onClear={onClear}
							onCopy={() => copy(text, `${isSource ? 'Оригинал' : 'Перевод'} скопирован!`)}
						/>
					</>
				)}
			</div>
			<div className={cn('pr-2 pl-2', isSource ? 'md:pr-4' : 'md:pl-4')}>
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
