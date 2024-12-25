import * as types from '../types';

export type EscapFunc = (input?: string) => string;
export type AsyncIncludeFunc = (name: string, model: types.PlainObject) => Promise<string>;
export type SyncIncludeFunc =  (name: string, model: types.PlainObject) => string;
export type RethrowFunc = (err: Error, str: string, flnm: string, lineno: number, esc: (input: string) => string) => void;

export type AsyncCompilerFunc = (service: types.PlainObject, model?: types.PlainObject, esacpe?: EscapFunc, include?: AsyncIncludeFunc, rethrow?: RethrowFunc) => Promise<string>;
export type SyncCompilerFunc =  (service: types.PlainObject, model?: types.PlainObject,  esacpe?: EscapFunc,  include?: SyncIncludeFunc, rethrow?: RethrowFunc) => string;