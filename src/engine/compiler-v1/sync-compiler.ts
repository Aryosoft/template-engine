import * as types from '../types';
import { CompilerBase } from './compiler-base';
import { SyncRenderDelegate } from './delegates';

export class SyncCompiler extends CompilerBase {
    constructor(
        template: string,
        options: types.CompilOptions,
        loader: types.ITemplateLoader,
        logger: types.ILogger
    ) {
        super(template, options, loader, logger);
    }

    public compile(): types.SyncRenderDelegate {
        this.template = this.layoutResolver.resolve(this.template);

        return (function (context: SyncCompiler, data?: types.PlainObject): string {
            let fn = context.getDelegate();
            return fn.apply({ ...context }, [{ ...data }, context.options.escape, context.include, context.rethrow]);
        }).bind(this, this);
    }

    private delegate: SyncRenderDelegate | null = null;

    private getDelegate = (): SyncRenderDelegate => {
        if (!(this.delegate instanceof Function)) {
            let src = this.prepareSource(false);
            this.delegate = this.generateDelegate(src);
        }

        return this.delegate!;
    }

    private generateDelegate = (source: string): SyncRenderDelegate => {
        try {
            return (new Function('$model', 'escapeFn', 'include', 'rethrow', source).bind(this));
        }
        catch (e) {
            if (e instanceof SyntaxError && !String.isEmpty(this.options.templateFilename))
                e.message += ` in "${this.options.templateFilename}".`;
            throw e;
        }
    }

    private include(partialName: string, includeData?: types.PlainObject): string {
        let template = this.loader.load(partialName);
        return this.clone(template)
            .compile()
            .call(this, includeData);
    }

    private clone = (template: string): SyncCompiler => new SyncCompiler(template, this.options, this.loader, this.logger);
}