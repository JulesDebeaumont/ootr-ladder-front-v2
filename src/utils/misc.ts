export function getRaceTime(raceTime: string, sessionStart: string): string {
    const deltaInMilliSec = Math.abs(new Date(raceTime).valueOf() - new Date(sessionStart).valueOf());
    const hours = Math.floor(deltaInMilliSec / 3600000);
    const minutes = Math.floor((deltaInMilliSec % 3600000) / 60000);
    const seconds = Math.floor((deltaInMilliSec % 60000) / 1000);
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}.${String(seconds).padStart(2, '0')}`;
}
