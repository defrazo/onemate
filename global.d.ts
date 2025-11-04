declare module '*.png' {
	const content: string;
	export default content;
}

declare module '*.webp' {
	const content: string;
	export default content;
}

declare module '*.svg' {
	import { ReactComponent as ReactComponent } from 'react';
	export { ReactComponent };
}

declare module '*.svg?react' {
	import React from 'react';
	const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>;
	export default ReactComponent;
}

declare module '*.svg' {
	const content: string;
	export default content;
}
