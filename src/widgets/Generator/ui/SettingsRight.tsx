import { observer } from 'mobx-react-lite';

import { useIsMobile } from '@/shared/lib/hooks';
import { Button, CheckboxBool, Divider, FileUploader, Input } from '@/shared/ui';

import { downloadGridSvg } from '../lib';
import { genStore, useGenModel } from '../model';

export const SettingsRight = observer(() => {
	const isMobile = useIsMobile();
	if (isMobile) return undefined;

	const { selectedFileName, handleUpload, setSelectedFileName } = useGenModel();

	return (
		<div className="core-base core-card top-4 flex w-full flex-col gap-2">
			<FileUploader accept=".svg" selectedFileName={selectedFileName} onUpload={handleUpload} />
			<Divider />
			{genStore.width > 0 && genStore.height > 0 && (
				<>
					<div className="core-border flex flex-col gap-2 rounded-xl p-2">
						<div className="text-sm text-[var(--color-disabled)]">
							<div>Размеры файла:</div>
							<div>Ширина: {genStore.widthMm} мм</div>
							<div>Высота: {genStore.heightMm} мм</div>
						</div>
					</div>
					<Divider />
				</>
			)}
			<div className="core-border flex flex-col gap-1 rounded-xl p-2">
				<label className="flex w-full flex-col gap-1">
					<div className="flex items-center justify-between">
						<span>Линия реза:</span>
						<CheckboxBool
							checked={genStore.isCutLine}
							className="h-5"
							disabled={!genStore.svgWithText}
							label=""
							onChange={() => genStore.updateCutLine('visible', !genStore.isCutLine)}
						/>
					</div>
					<div className="flex w-full items-center justify-between">
						<span>Отступ:</span>
						<Input
							className="w-20 rounded-xl text-center"
							disabled={!genStore.svgWithText}
							justify="end"
							min={0}
							size="sm"
							type="number"
							value={genStore.padding}
							onChange={(e) => genStore.updateCutLine('paddingMm', Number(e.target.value))}
						/>
					</div>
					<div className="flex w-full items-center justify-between">
						<span>Скругление:</span>
						<Input
							className="w-20 self-end rounded-xl text-center"
							disabled={!genStore.svgWithText}
							justify="end"
							min={0}
							size="sm"
							type="number"
							value={genStore.radius}
							onChange={(e) => genStore.updateCutLine('radiusMm', Number(e.target.value))}
						/>
					</div>
				</label>
			</div>
			<Divider />
			<div className="core-border flex flex-col gap-1 rounded-xl p-2">
				<label className="flex w-full flex-col gap-1">
					<div className="flex justify-between">
						<span>Итоговая сетка:</span>
						<span className="text-[var(--color-disabled)]">
							{genStore.cols} x {genStore.rows}
						</span>
					</div>
					<div className="flex w-full items-center justify-between">
						<span>Количество:</span>
						<Input
							className="w-20 self-end rounded-xl text-center"
							disabled={!genStore.svgWithText}
							justify="end"
							min={1}
							size="sm"
							type="number"
							value={genStore.count}
							onChange={(e) => genStore.setCount(Number(e.target.value))}
						/>
					</div>
				</label>
				<label className="flex w-full items-center justify-between">
					<span>Столбцы:</span>
					<Input
						className="w-20 self-end rounded-xl text-center"
						disabled={!genStore.svgWithText}
						justify="end"
						min={1}
						size="sm"
						type="number"
						value={genStore.cols}
						onChange={(e) => genStore.setGrid([Number(e.target.value), genStore.rows])}
					/>
				</label>
				<label className="flex w-full items-center justify-between">
					<span>Строки:</span>
					<Input
						className="w-20 self-end rounded-xl text-center"
						disabled={!genStore.svgWithText}
						justify="end"
						min={1}
						size="sm"
						type="number"
						value={genStore.rows}
						onChange={(e) => genStore.setGrid([genStore.cols, Number(e.target.value)])}
					/>
				</label>
			</div>
			<Divider />
			<Button disabled={!genStore.svgWithText} onClick={() => downloadGridSvg(genStore.svgWithText)}>
				Скачать
			</Button>
			<div className="mt-auto">
				<Button
					className="w-full"
					disabled={!genStore.svgWithText}
					variant="warning"
					onClick={() => {
						genStore.resetGenerator();
						setSelectedFileName('');
					}}
				>
					Сбросить
				</Button>
			</div>
		</div>
	);
});
