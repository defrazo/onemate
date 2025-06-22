// import { makeAutoObservable } from 'mobx';

// import { notify } from '../lib/notify';

// class AppStore {
// theme: 'light' | 'dark' = 'dark';
// success = '';
// error = '';
// warning = '';
// info = '';
// modal: { content: React.ReactNode } | null = null;
// back: (() => void) | null = null;
// setModal(content: React.ReactNode, onBack?: () => void) {
// 	this.modal = { content };
// 	this.back = onBack || null;
// }
// setBack(handler: () => void) {
// 	this.back = handler;
// }
// resetBack() {
// 	this.back = null;
// }
// closeModal() {
// 	this.modal = null;
// 	this.back = null;
// }
// constructor() {
// 	makeAutoObservable(this);
// this.initTheme();
// }
// setTheme(theme: 'light' | 'dark') {
// 	this.theme = theme;
// 	localStorage.setItem('theme', theme);
// 	this.applyTheme(theme);
// }
// toggleTheme() {
// 	const newTheme = this.theme === 'dark' ? 'light' : 'dark';
// 	this.setTheme(newTheme);
// }
// private initTheme() {
// 	const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
// 	if (savedTheme) this.setTheme(savedTheme);
// 	else {
// 		const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
// 		this.setTheme(prefersDark ? 'dark' : 'light');
// 	}
// }
// private applyTheme(theme: 'light' | 'dark') {
// 	document.body.classList.toggle('light-theme', theme === 'light');
// 	document.body.classList.toggle('dark-theme', theme === 'dark');
// }
// setSuccess(message: string) {
// 	this.success = message;
// 	this.showNotification(message, 'success');
// }
// setError(message: string) {
// 	this.error = message;
// 	this.showNotification(message, 'error');
// }
// setWarning(message: string) {
// 	this.warning = message;
// 	this.showNotification(message, 'warning');
// }
// setInfo(message: string) {
// 	this.info = message;
// 	this.showNotification(message, 'info');
// }
// clearMessages() {
// 	this.success = '';
// 	this.error = '';
// }
// showNotification(message: string, type: 'success' | 'error' | 'warning' | 'info') {
// 	switch (type) {
// 		case 'success':
// 			notify.success(message);
// 			break;
// 		case 'error':
// 			notify.error(message);
// 			break;
// 		case 'warning':
// 			notify.warning(message);
// 			break;
// 		case 'info':
// 			notify.info(message);
// 			break;
// 		default:
// 			notify.warning(message);
// 	}
// 	setTimeout(() => {
// 		this.clearMessages();
// 	}, 3000);
// }
// }

// export const appStore = new AppStore();
