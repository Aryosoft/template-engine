import * as types from './types';
import * as v1 from './compiler-v1/index';
import { MiscHelper, TypeHelper } from './helpers';

export class Compiler implements types.ICompiler {
    constructor(
        private readonly loader: types.ITemplateLoader,
        private readonly logger: types.ILogger,
        options: types.EngineOptions = {}
    ) {
        this.options = TypeHelper.isPlainObject(options) ? options! : {};
    }

    compile = (templte: string, templateFilename?: string): types.SyncRenderDelegate => new v1.SyncCompiler(templte, this.getCompilerOptions(templateFilename), this.loader, this.logger).compile();
    compileAsync = (templte: string, templateFilename?: string): Promise<types.AsyncRenderDelegate> => new v1.AsyncCompiler(templte, this.getCompilerOptions(templateFilename), this.loader, this.logger).compile();

    private readonly options: types.EngineOptions = null!;

    private getCompilerOptions(templateFilename?: string): types.CompilOptions {
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