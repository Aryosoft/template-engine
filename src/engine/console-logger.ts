import { ILogger, PlainObject } from './types';

export const ConsoleLogger: ILogger = Object.freeze({
    error: (where: string, err: Error, data?: PlainObject): void => {
        console.error(`Error at ${where}: ${err.message}`, data);
    },
    info: (where: string, message: string, data?: PlainObject): void => {
        console.info(`${where}: ${message}`, data);
     },
    debug: (message: string): void => {
        console.log(message);
     }
});