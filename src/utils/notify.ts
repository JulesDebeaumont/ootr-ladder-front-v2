import { Notify } from 'quasar';

export function notifyError(message?: string) {
    Notify.create({
        type: 'negative',
        message: message ?? 'An error has occured'
    })
}
