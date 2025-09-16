import { writable } from 'svelte/store';

export type Toast = {
    id: number;
    message: string;
    duration?: number; // in milliseconds
}

export const toasts = writable<Toast[]>([]);

let _id = 0;
export function showToast(message: string, duration = 3000) {
    const id = ++_id;
    toasts.update(list => [...list, { id, message, duration}]);
    // auto-remove
    setTimeout(() => {
        toasts.update(list => list.filter(t => t.id !== id));
    }, duration);
}