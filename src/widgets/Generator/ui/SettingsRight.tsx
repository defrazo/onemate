import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import { Button, CheckboxBool, Divider, FileUploader, Input } from '@/shared/ui';

import { downloadGridSvg } from '../lib';
import { useGenModel } from '../model';

export const SettingsRight = observer(() => {
	const { genStore } = useStore();
	const { selectedFileName, setSelectedFileName, handleUpload } = useGenModel();

	return (
		<div className="core-base core-card top-4 hidden w-full flex-col gap-4 lg:flex">
			<FileUploader accept=".svg" selectedFileName={selectedFileName} onUpload={handleUpload} />
			<Divider />
			{genStore.width > 0 && genStore.height > 0 && (
				<>
					<div className="core-border flex flex-col gap-1.5 p-2">
						<div className="self-center font-bold select-none">Размеры файла</div>
						<div className="flex justify-between leading-4">
							<div>Ширина:</div>
							<div>{genStore.widthMm} мм</div>
						</div>
						<div className="flex justify-between">
							<div>Высота:</div>
							<div>{genStore.heightMm} мм</div>
						</div>
					</div>
				</>
			)}
			<div className="core-border flex flex-col gap-1 p-2">
				<div className="flex items-center justify-between">
					<label className="select-none" htmlFor="cutline">
						Линия реза:
					</label>
					<CheckboxBool
						checked={genStore.isCutLine}
						className="h-5 bg-transparent"
						disabled={!genStore.svgWithText}
						id="cutline"
						label=""
						onChange={() => genStore.updateCutLine('visible', !genStore.isCutLine)}
					/>
				</div>
				<div className="flex items-center justify-between">
					<label className="select-none" htmlFor="padding">
						Отступ:
					</label>
					<Input
						className="core-border w-20 text-center leading-4"
						disabled={!genStore.svgWithText}
						id="padding"
						justify="end"
						min={0}
						size="sm"
						type="number"
						value={genStore.padding}
						onChange={(e) => genStore.updateCutLine('paddingMm', Number(e.target.value))}
					/>
				</div>
				<div className="flex items-center justify-between">
					<label className="select-none" htmlFor="rounded">
						Cкругление:
					</label>
					<Input
						className="core-border w-20 text-center leading-4"
						disabled={!genStore.svgWithText}
						id="rounded"
						justify="end"
						min={0}
						size="sm"
						type="number"
						value={genStore.radius}
						onChange={(e) => genStore.updateCutLine('radiusMm', Number(e.target.value))}
					/>
				</div>
			</div>
			<div className="core-border flex flex-col gap-1 p-2">
				<div className="flex items-center justify-between">
					<span className="select-none">Итоговая сетка:</span>
					<span
						className={`${!genStore.svgWithText ? 'text-(--color-disabled) opacity-30' : 'text-(--color-secondary)'}`}
					>
						{genStore.cols} x {genStore.rows}
					</span>
				</div>
				<div className="flex items-center justify-between">
					<label className="select-none" htmlFor="count">
						Количество:
					</label>
					<Input
						className="core-border w-20 text-center leading-4"
						disabled={!genStore.svgWithText}
						id="count"
						justify="end"
						min={1}
						size="sm"
						type="number"
						value={genStore.count}
						onChange={(e) => genStore.setCount(Number(e.target.value))}
					/>
				</div>
				<div className="flex items-center justify-between">
					<label className="select-none" htmlFor="cols">
						Столбцы:
					</label>
					<Input
						className="core-border w-20 text-center leading-4"
						disabled={!genStore.svgWithText}
						id="cols"
						justify="end"
						min={1}
						size="sm"
						type="number"
						value={genStore.cols}
						onChange={(e) => genStore.setGrid([Number(e.target.value), genStore.rows])}
					/>
				</div>
				<div className="flex items-center justify-between">
					<label className="select-none" htmlFor="rows">
						Строки:
					</label>
					<Input
						className="core-border w-20 text-center leading-4"
						disabled={!genStore.svgWithText}
						id="rows"
						justify="end"
						min={1}
						size="sm"
						type="number"
						value={genStore.rows}
						onChange={(e) => genStore.setGrid([genStore.cols, Number(e.target.value)])}
					/>
				</div>
			</div>
			<Divider />
			<Button
				disabled={!genStore.svgWithText}
				variant="accent"
				onClick={() => downloadGridSvg(genStore.svgWithText)}
			>
				Скачать
			</Button>
			<Button
				className="mt-auto"
				disabled={!genStore.svgWithText}
				variant="warning"
				onClick={() => {
					genStore.reset();
					setSelectedFileName('');
				}}
			>
				Сбросить
			</Button>
		</div>
	);
});
