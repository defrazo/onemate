/**
 * useBroadcastChannel — хук для обмена сообщениями между вкладками через BroadcastChannel.
 *
 * Позволяет отправлять и принимать сообщения между вкладками браузера с одинаковым channelName.
 * Нужен для синхронизации состояния между вкладками (заметки, авторизация).
 *
 * @param channelName — имя канала для общения
 * @param onMessage — функция, вызываемая при получении сообщения
 *
 * @returns объект с методом postMessage для отправки сообщения
 */

import { useEffect, useRef } from 'react';

type Callback<T = unknown> = (message: T) => void;

export const useBroadcastChannel = <T = unknown>(channelName: string, onMessage: Callback<T>) => {
	const channelRef = useRef<BroadcastChannel | null>(null);

	useEffect(() => {
		const channel = new BroadcastChannel(channelName);
		channelRef.current = channel;

		channel.onmessage = (event) => onMessage(event.data as T);

		return () => channel.close();
	}, [channelName, onMessage]);

	const postMessage = (message: T) => channelRef.current?.postMessage(message);

	return { postMessage };
};
