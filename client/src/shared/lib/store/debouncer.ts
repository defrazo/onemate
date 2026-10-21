export class Debouncer {
	private timer: ReturnType<typeof setTimeout> | null = null;

	schedule(callback: () => void, delay: number) {
		this.cancel();

		this.timer = setTimeout(() => {
			this.timer = null;
			callback();
		}, delay);
	}

	cancel() {
		if (!this.timer) return;

		clearTimeout(this.timer);
		this.timer = null;
	}
}
