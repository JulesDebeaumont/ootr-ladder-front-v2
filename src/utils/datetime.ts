import { date } from 'quasar'


export function formatTimeStampToDate(dateArg: Date | string) {
    return date.formatDate(dateArg, 'DD-MM-YYYY')
}

export function formatTimeStampToDateISO(dateArg: string) {
    const dateParts = dateArg.split('-');
    return new Date(Number(dateParts[2]), Number(dateParts[1]) - 1, Number(dateParts[0]));
}

export function generateEvolutionId() {
    const today = new Date();
    return today.getMonth() + '_' + today.getFullYear();
}

export function dateToLocalString(dateArg: Date | string) {
    return new Date(date.formatDate(dateArg, 'MM-DD-YYYY')).toLocaleDateString()
}
