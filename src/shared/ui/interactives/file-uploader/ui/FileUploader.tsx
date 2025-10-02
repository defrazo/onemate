import type { ChangeEvent } from 'react';

import { Input } from '@/shared/ui';

interface FileUploaderProps {
	selectedFileName: string;
	accept: string;
	onUpload: (e: ChangeEvent<HTMLInputElement>) => void;
}

const FileUploader = ({ selectedFileName, accept, onUpload }: FileUploaderProps) => (
	<label className="inline-block cursor-pointer rounded-xl bg-[var(--accent-default)] px-4 py-2 text-center text-base text-[var(--accent-text)] select-none hover:bg-[var(--accent-hover)]">
		<span className={selectedFileName && 'text-sm'}>{selectedFileName || 'Выберите SVG-файл'}</span>
		<Input accept={accept} className="hidden" type="file" onChange={onUpload} />
	</label>
);

export default FileUploader;
