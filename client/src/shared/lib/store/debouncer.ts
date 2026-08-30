export class Debouncer {
	private timer: ReturnType<typeof setTimeout> | null = null;

	schedule(callback: () => void, delay: number): void {
		this.cancel();

		this.timer = setTimeout(() => {
			this.timer = null;
			callback();
		}, delay);
	}

	cancel(): void {
		if (!this.timer) return;

		clearTimeout(this.timer);
		this.timer = null;
	}
}
