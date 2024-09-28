import * as types from '../types';
import { CompilerBase } from './compiler-base';
import { SyncRenderDelegate } from './delegates';
import { MiscHelper } from '../helpers';

export class SyncCompiler extends CompilerBase {
    constructor(
        private loaderModel: types.PlainObject, 
        template: string,
        options: types.CompilOptions,
        loader: types.ITemplateLoader,
        logger: types.ILogger
    ) {
        super(template, options, loader, logger);
    }

    public compile(): types.SyncRenderDelegate {
        this.template = this.layoutResolver.resolve(this.template, this.loaderModel);

        let func = (function (context: SyncCompiler, data?: types.PlainObject): string {
            let fn = context.getDelegate();
            context.logRendererFunc(fn);
           return fn.apply(context, [{ ...data }, context.options.escape, context.include, context.rethrow]);
        }).bind(this, this);


        return func;
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
            return new Function('$model', 'escapeFn', 'include', 'rethrow', source) as SyncRenderDelegate;//.bind(this));
        }
        catch (e) {
            if (e instanceof SyntaxError && !MiscHelper.isEmptyString(this.options.templateFilename))
                e.message += ` in "${this.options.templateFilename}".`;
            throw e;
        }
    }

    private include(partialName: string, includeData?: types.PlainObject): string {
        let template = this.loader.load(partialName, this.loaderModel);
        return this.clone(template)
            .compile()
            .call(this, includeData);
    }

    private clone = (template: string): SyncCompiler => new SyncCompiler(this.loaderModel, template, this.options, this.loader, this.logger);
}