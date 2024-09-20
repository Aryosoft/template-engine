export type PlainObject = { [key: string]: any }



export type EngineOptions =
    {
        delimiter?: string,
        openDelimiter?: string,
        closeDelimiter?: string,
        removeWhitespaces?: boolean,
        clientMode?: boolean,
       // renderContext?: any,
        compileDebug?: boolean,
        debug?: boolean,
        useStrict?: boolean,
        //useWithStatement?: boolean,
    }

export type CompilOptions = {
    delimiter: string,
    openDelimiter: string,
    closeDelimiter: string,
    removeWhitespaces: boolean,
    clientMode: boolean,
  //  renderContext: any,
    compileDebug: boolean,
    debug: boolean,
    useStrict: boolean,
   // useWithStatement: boolean,
    templateFilename: string,
    outputFunctionName?: string,
    localsName: string,
    destructuredLocals: string[],
    escape?: (input?: string) => string
}

export type CompileModel = {
    template: { template: string, isFile?: boolean },
    cache?: { key: string, duration: number }

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
}

export interface ITemplateLoader {
    load(filename: string): string;
    loadAsync(filename: string): Promise<string>;
}

export interface ILogger {
    error(where: string, err: Error, data?: PlainObject): void;
    info(where: string, message: string, data?: PlainObject): void;
    debug(message: string): void;
}

export interface ICompiler {
    compile(templte: string, templateFilename?: string): SyncRenderDelegate;
    compileAsync(templte: string, templateFilename?: string): AsyncRenderDelegate;
}

export class ArgumentNullError extends Error {
    constructor(argName: string, message?: string) {
        super(`The argument ${argName} cannot be null. ${message ?? ''}`.trim());
        this.name = this.constructor.name;
        this.cause = 'MISSING_REQUIRED_FIELD';
        Error.captureStackTrace(this, this.constructor);
    }
}

export class TypeError extends Error {
    constructor(refName: string, correctTypeName: string, message?: string) {
        super(`Invalid value of the "${refName}", it must be a/an "${correctTypeName}". ${message ?? ''}`.trim());
        this.name = this.constructor.name;
        this.cause = 'TYPE_ERROR';
        Error.captureStackTrace(this, this.constructor);
    }
}