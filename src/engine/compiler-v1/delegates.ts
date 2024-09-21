import * as types from '../types';

export type RethrowFunc = (err: Error, str: string, flnm: string, lineno: number, esc: (input: string) => string) => void;
export type AsyncRenderDelegate = (data?: types.PlainObject, esacpe?: (input?: string) => string, include?: (name: string, data: types.PlainObject) => Promise<string>, rethrow?: RethrowFunc) => Promise<string>;
export type SyncRenderDelegate = (data?: types.PlainObject, esacpe?: (input?: string) => string, include?: (name: string, data: types.PlainObject) => string, rethrow?: RethrowFunc) => string;