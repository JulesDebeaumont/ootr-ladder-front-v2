import { LocalStorage, Dark } from 'quasar'

const DARK_MODE = 'dark_mode'

export function setDarkModeStorage(state: boolean) {
    Dark.set(state)
    LocalStorage.set(DARK_MODE, state)
}
export function getDarkModeStateStorage(): boolean {
    return LocalStorage.getItem(DARK_MODE) ?? true
}
