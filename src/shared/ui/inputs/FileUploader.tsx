import { Input } from '.';

interface FileUploaderProps {
	onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
	selectedFileName: string;
	accept: string;
}

const FileUploader = ({ onUpload, selectedFileName, accept }: FileUploaderProps) => (
	<label className="core-elements inline-block cursor-pointer rounded-xl px-4 py-2 text-center text-base select-none hover:bg-[var(--accent-hover)]">
		<span>{selectedFileName || 'Выберите SVG-файл'}</span>
		<Input accept={accept} className="hidden" type="file" onChange={onUpload} />
	</label>
);

export default FileUploader;
