import * as types from '../types';
import { CompilerBase } from './compiler-base';
import { SyncCompilerFunc } from './delegates';
import { MiscHelper, TypeHelper } from '../utils';



export class SyncCompiler extends CompilerBase {
    constructor(
        private readonly service: types.PlainObject,
        private readonly loadTemplateMetaData: types.PlainObject, 
        template: string,
        options: types.CompilerSettings,
        loader: types.ITemplateLoader,
        logger: types.ILogger
    ) {
        super(template, options, loader, logger);
    }

    public compile(): types.SyncRenderDelegate {
        this.template = this.layoutResolver.resolve(this.template, this.loadTemplateMetaData);

        let func = (function (self: SyncCompiler, viewModel?: types.PlainObject): string {
            let fn = self.getDelegate();
            self.logRendererFunc(fn);
           
           return fn.apply(global, [self.service, viewModel, self.options.escape, self.include.bind(self), self.rethrow]);
        }).bind(this, this);


        return func;
    }

    private compilerFunc: SyncCompilerFunc | null = null;

    private getDelegate = (): SyncCompilerFunc => {
        if (!TypeHelper.isFunc(this.compilerFunc)) {
            let src = this.prepareSource(false);
            this.compilerFunc = this.generateDelegate(src);
        }

        return this.compilerFunc!;
    }

    private generateDelegate = (source: string): SyncCompilerFunc => {
        try {
            return new Function('$service, $model', 'escapeFn', 'include', 'rethrow', source) as SyncCompilerFunc;//.bind(this));
        }
        catch (e) {
            if (e instanceof SyntaxError && !MiscHelper.isEmptyString(this.options.templateFilename))
                e.message += ` in "${this.options.templateFilename}".`;
            throw e;
        }
    }

    private include(partialName: string, includeData?: types.PlainObject): string {
        let template = this.loader.load(partialName, this.loadTemplateMetaData);
        return this.clone(template)
            .compile()
            .call(this, includeData);
    }

    private clone = (template: string): SyncCompiler => new SyncCompiler(this.loadTemplateMetaData, this.service, template, this.options, this.loader, this.logger);
}