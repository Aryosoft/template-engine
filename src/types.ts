export type PlainObject = { [key: string]: any }

export type EngineSettings =
    {
        delimiter?: string,
        openDelimiter?: string,
        closeDelimiter?: string,
        removeWhitespaces?: boolean,
        renderFuncLogger?: (renderer: string) => void,
        clientMode?: boolean,
        compileDebug?: boolean,
        debug?: boolean,
        useStrict?: boolean,
    }

export type CompilerSettings = {
    delimiter: string,
    openDelimiter: string,
    closeDelimiter: string,
    removeWhitespaces: boolean,
    clientMode: boolean,
    compileDebug: boolean,
    debug: boolean,
    useStrict: boolean,
    templateFilename: string,
    outputFunctionName?: string,
    localsName: string,
    destructuredLocals: string[],
    escape?: (input?: string) => string,
    renderFuncLogger?: (renderer: string) => void,
}

export type CompileModel = {
    template: { template: string, isFile?: boolean },
    /** The meta data is available inside the load-template functions.*/
    templateLoadingMetaData?: PlainObject,
    /** The renderService is available inside the render function. This object can contain functions, data, etc.*/
    renderService?: PlainObject,
    cache?: {
        /**A mandatory unique string key. It is better to leave a Guid as key.*/
        key: string,
        /** A number in seconds that indicates how long to cache the compiled template.
         * For lifetime caching leave this value zero.
        */
        duration: number
    }
};

export type TViewModel = {
    layout?: {}
}

export type AsyncRenderDelegate = ($model?: PlainObject) => Promise<string>;
export type SyncRenderDelegate = ($model?: PlainObject) => string;

export interface IEngine {
    compile(model: CompileModel): SyncRenderDelegate;
    compileAsync(model: CompileModel): Promise<AsyncRenderDelegate>;

    render(model: CompileModel, $model?: PlainObject): string;
    renderAsync(model: CompileModel, $model?: PlainObject): Promise<string>;

    cache: { purgeItem: (key: string) => void, purgeEveryThings: () => void };

}

export interface ITemplateLoader {
    load(filename: string, metaData: PlainObject): string;
    loadAsync(filename: string, metaData: PlainObject): Promise<string>;
}

export interface ILogger {
    error(where: string, err: Error, data?: PlainObject): void;
    info(where: string, message: string, data?: PlainObject): void;
    debug(message: string): void;
}

// export interface ICompiledViewCache{
//     readAsync(key: string): Promise<string | undefined>;
//     read(key: string): string | undefined;
//     writeAsync(key: string, compilerSourceCode: string): Promise<string | undefined>;
//     write(key: string, compilerSourceCode: string): string | undefined;
// }

export type CompileOptions = {
    /** The service is available inside the render function. This object can contain functions, data, etc.*/
    renderService?: PlainObject,
    /** The meta data is available inside the load-template functions.*/
    loaderMetaData?: PlainObject,

    templateFilename?: string
}

export interface ICompiler {
    compile(template: string, options?: CompileOptions): SyncRenderDelegate;
    compileAsync(template: string, options?: CompileOptions): Promise<AsyncRenderDelegate>;
}

//#region ----- Errors ----------------------
export enum ErrorCauses {
    MissingRequiredFiled = 'MISSING_REQUIRED_FIELD',
    TemplateNotFound = 'TEMPLATE_NOTFOUND',
    TypeError = 'TYPE_ERROR',
}

export class ArgumentNullException extends Error {
    constructor(argName: string, message?: string) {
        super(`The argument ${argName} cannot be null. ${message ?? ''}`.trim());
        this.name = this.constructor.name;
        this.cause = ErrorCauses.MissingRequiredFiled;
        Error.captureStackTrace(this, this.constructor);
    }
}

export class TypeMismatchException extends Error {
    constructor(refName: string, correctTypeName: string, message?: string) {
        super(`Invalid value of the "${refName}", it must be a/an "${correctTypeName}". ${message ?? ''}`.trim());
        this.name = this.constructor.name;
        this.cause = ErrorCauses.TypeError;
        Error.captureStackTrace(this, this.constructor);
    }
}

export class TemplateNotFoundException extends Error {
    constructor(templateName: string, message?: string) {
        super(`The template "${templateName}" is not found.${message ?? ''}`.trim());
        this.name = this.constructor.name;
        this.cause = ErrorCauses.TemplateNotFound;
        Error.captureStackTrace(this, this.constructor);
    }
}
//#endregion