import type { ChangeEvent } from 'react';

import { Input } from '@/shared/ui';

interface FileUploaderProps {
	selectedFileName: string;
	accept: string;
	onUpload: (e: ChangeEvent<HTMLInputElement>) => void;
}

const FileUploader = ({ selectedFileName, accept, onUpload }: FileUploaderProps) => (
	<label className="inline-block cursor-pointer rounded-xl bg-(--accent-default) px-4 py-2 text-center text-base text-(--accent-text) select-none hover:bg-(--accent-hover)">
		<span className={selectedFileName && 'text-sm'}>{selectedFileName || 'Выберите SVG-файл'}</span>
		<Input accept={accept} className="hidden" type="file" onChange={onUpload} />
	</label>
);

export default FileUploader;
