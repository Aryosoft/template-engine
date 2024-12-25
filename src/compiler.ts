import * as types from './types';
import * as v1 from './compiler-v1/index';
import { MiscHelper, TypeHelper } from './utils';

export class Compiler implements types.ICompiler {
    constructor(
        private readonly loader: types.ITemplateLoader,
        private readonly logger: types.ILogger,
        options: types.EngineSettings = {}
    ) {
        this.options = TypeHelper.isPlainObject(options) ? options! : {};
    }

    compile = (template: string, options?:  types.CompileOptions): types.SyncRenderDelegate => 
    {
        options = options ?? {};
        return new v1.SyncCompiler(options.renderService ?? {}, options.loaderMetaData ?? {}, template, this.getCompilerOptions(options.templateFilename), this.loader, this.logger)
            .compile();
    }

    compileAsync = (template: string, options?:  types.CompileOptions): Promise<types.AsyncRenderDelegate> => 
    {
        options = options ?? {};
        return new v1.AsyncCompiler(options.renderService ?? {}, options.loaderMetaData ?? {}, template, this.getCompilerOptions(options.templateFilename), this.loader, this.logger).compile();
    }

    private readonly options: types.EngineSettings = null!;

    private getCompilerOptions(templateFilename?: string): types.CompilerSettings {
        return {
            delimiter: MiscHelper.stringCoalesce(this.options.delimiter, '%')!,
            openDelimiter: MiscHelper.stringCoalesce(this.options.openDelimiter, '<')!,
            closeDelimiter: MiscHelper.stringCoalesce(this.options.closeDelimiter, '>')!,
            removeWhitespaces: Boolean(this.options.removeWhitespaces),
            clientMode: Boolean(this.options.clientMode),
            // renderContext: this.options.renderContext ?? {},
            compileDebug: Boolean(this.options.compileDebug),
            debug: Boolean(this.options.debug),
            useStrict: Boolean(this.options.useStrict),
            //suseWithStatement: this.options.useWithStatement !== false,
            templateFilename: templateFilename ?? '',
            outputFunctionName: '_renderTemplate',
            localsName: 'locals',
            destructuredLocals: [],
            escape: MiscHelper.escapeXML,
            renderFuncLogger: this.options.renderFuncLogger
        }
    }
}