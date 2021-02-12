export function error(...args: unknown[]): void {
    // eslint-disable-next-line no-console
    console.error(...args);
}

export function debug(...args: unknown[]): void {
    // eslint-disable-next-line no-console
    console.debug(...args);
}

export function info(...args: unknown[]): void {
    // eslint-disable-next-line no-console
    console.info(...args);
}

export function warn(...args: unknown[]): void {
    // eslint-disable-next-line no-console
    console.warn(...args);
}

export default {
    error,
    info,
    warn,
    debug
};
