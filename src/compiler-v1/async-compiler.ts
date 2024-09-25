import * as types from '../types';
import { CompilerBase } from './compiler-base';
import { AsyncRenderDelegate } from './delegates';
import { MiscHelper } from '../helpers';

export class AsyncCompiler extends CompilerBase {
    constructor(
        template: string,
        options: types.CompilOptions,
        loader: types.ITemplateLoader,
        logger: types.ILogger
    ) {
        super(template, options, loader, logger);
    }

    public compile(): Promise<AsyncRenderDelegate> {
        return new Promise<AsyncRenderDelegate>((resolve, reject) => {
            this.layoutResolver
                .resolveAsync(this.template)
                .then(tmpl => {
                    this.template = tmpl;

                    let func = (function (context: AsyncCompiler, data?: types.PlainObject): Promise<string> {
                        let fn = context.getDelegate();
                        context.logRendererFunc(fn);
                        return fn.apply(context, [{ ...data }, context.options.escape, context.include, context.rethrow]);
                    }).bind(this, this);
                    

                    resolve(func);
                })
                .catch(reject);
        });





        /* let fn = this.getDelegate();
 
         let renderFunc = this.options.clientMode ? fn : (data?: types.PlainObject) => {
 
             let include = (partialName: string, includeData: types.PlainObject) => {
 
                 return new Promise<string>((resolve, reject) => {
                     this.asyncInclude(partialName)
                         .then(compiler => {
                             
                         })
                         .catch(reject);
                 });
             };
 
             return fn.apply({}, [data || {}, this.options.escape, include, this.rethrow]);
             // return fn.apply(this.options.renderContext, [data || {}, this.options.escape, include, this.rethrow]);
         };
 
         return renderFunc;*/
    }

    private delegate: AsyncRenderDelegate | null = null;

    private getDelegate = (): AsyncRenderDelegate => {
        if (!(this.delegate instanceof Function)) {
            let src = this.prepareSource(true);
            this.delegate = this.generateDelegate(src);
        }

        return this.delegate!;
    }

    private generateDelegate = (source: string): AsyncRenderDelegate => {
        try {
            let AsyncFunc = Object.getPrototypeOf(async function () { }).constructor;
            return (new AsyncFunc('$model', 'escapeFn', 'include', 'rethrow', source));//.bind(this);
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
            this.loader.loadAsync(partialName)
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

    private clone = (template: string): AsyncCompiler => new AsyncCompiler(template, this.options, this.loader, this.logger);
}

