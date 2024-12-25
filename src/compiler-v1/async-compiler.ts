import * as types from '../types';
import { CompilerBase } from './compiler-base';
import { MiscHelper , TypeHelper} from '../utils';
import { AsyncCompilerFunc } from './delegates';


export class AsyncCompiler extends CompilerBase {
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

    public compile(): Promise<types.AsyncRenderDelegate> {
        return new Promise<types.AsyncRenderDelegate>((resolve, reject) => {
            this.layoutResolver
                .resolveAsync(this.template, this.loadTemplateMetaData)
                .then(tmpl => {
                    this.template = tmpl;

                    let func = (function (self: AsyncCompiler, viewModel?: types.PlainObject): Promise<string> {
                        let fn = self.getDelegate();
                        self.logRendererFunc(fn);
                        return fn.apply(global, [self.service, viewModel, self.options.escape, self.include.bind(self), self.rethrow]);
                    }).bind(this, this);
                    

                    resolve(func);
                })
                .catch(reject);
        });
    }

    private delegate: AsyncCompilerFunc | null = null;

    private getDelegate = (): AsyncCompilerFunc => {
        if (!TypeHelper.isFunc(this.delegate)) {
            let src = this.prepareSource(true);
            this.delegate = this.generateDelegate(src);
        }

        return this.delegate!;
    }

    private generateDelegate = (source: string): types.AsyncRenderDelegate => {
        try {
            let AsyncFunc = Object.getPrototypeOf(async function () { }).constructor;
            return (new AsyncFunc('$service, $model', 'escapeFn', 'include', 'rethrow', source));//.bind(this);
        }
        catch (e) {
            if (e instanceof SyntaxError && !MiscHelper.isEmptyString(this.options.templateFilename))
                e.message += ` in "${this.options.templateFilename}".`;
            throw e;
        }
        /*catch (e) {
            if (e instanceof SyntaxError)
                throw new Error('This environment does not support async/await');
            else
                throw e;
        }*/
    }

    private include(partialName: string, includeData?: types.PlainObject): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            this.loader.loadAsync(partialName, this.loadTemplateMetaData)
                .then(template => {
                    this.clone(template)
                        .compile()
                        .then(compiler => {
                            compiler.call(this, includeData)
                                .then(resolve)
                                .catch(reject);
                        })
                        .catch(reject);
                })
                .catch(reject);
        });
    }

    private clone = (template: string): AsyncCompiler => new AsyncCompiler(this.service, this.loadTemplateMetaData, template, this.options, this.loader, this.logger);
}

