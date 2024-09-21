import './extensions';
import { TypeHelper, MiscHelper } from './helpers';
import { AsyncRenderCache, SyncRenderCache } from './cache';
import * as types from './types';



export class Engine implements types.IEngine {
    private readonly _syncRenderCache: SyncRenderCache = new SyncRenderCache();
    private readonly _asyncRenderCache: AsyncRenderCache = new AsyncRenderCache();

    constructor(
        private readonly compiler: types.ICompiler,
        private readonly templateLoader: types.ITemplateLoader,
    ) { }

    compile(model: types.CompileModel): types.SyncRenderDelegate {
        this.validate(model);
        if (model.cache) {
            let key = this.getCacheKey(model);
            let renderFunc = this._syncRenderCache.get(key);

            if (!TypeHelper.isFunc(renderFunc)) {
                let template = this.getTemplate(model);
                renderFunc = this.compiler.compile(template, this.getTemplateName(model));
                this._syncRenderCache.put({ key: key, duration: model.cache.duration }, renderFunc);
            }

            return renderFunc!;
        }
        else {
            let template = this.getTemplate(model);
            let renderFunc = this.compiler.compile(template, this.getTemplateName(model));
            return renderFunc;
        }
    }

    compileAsync(model: types.CompileModel): Promise<types.AsyncRenderDelegate> {
        return new Promise<types.AsyncRenderDelegate>((resolve, reject) => {
            this.validate(model, reject);

            if (model.cache) {
                let key = this.getCacheKey(model);
                let renderFunc = this._asyncRenderCache.get(key);
                if (TypeHelper.isFunc(renderFunc)) return resolve(renderFunc!);

                this.getTemplateAsync(model)
                    .then(template => {

                        this.compiler.compileAsync(template, this.getTemplateName(model))
                            .then(renderFunc => {
                                this._asyncRenderCache.put({ key: key, duration: model.cache!.duration }, renderFunc);
                                resolve(renderFunc);
                            })
                            .catch(reject);

                        // let renderFunc = this.compiler.compileAsync(template, this.getTemplateName(model));

                    })
                    .catch(reject);
            }
            else {
                this.getTemplateAsync(model)
                    .then(template => {
                        let renderFunc = this.compiler.compileAsync(template, this.getTemplateName(model));
                        resolve(renderFunc);
                    })
                    .catch(reject);
            }
        });
    }

    render(model: types.CompileModel, data?: types.PlainObject): string {
        return this.compile(model)(data);
    }

    renderAsync(model: types.CompileModel, data?: types.PlainObject): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            this.compileAsync(model)
                .then(renderer => renderer(data).then(resolve).catch(reject))
                .catch(reject);
        });
    }

    private validate(model: types.CompileModel, reject?: (err: any) => void) {
        try {
            if (model === undefined || model == null)
                throw new types.ArgumentNullError('model');

            if (!TypeHelper.isPlainObject(model))
                throw new types.TypeError('model', 'Plain Object');

            if (model.template === undefined || model.template == null)
                throw new types.ArgumentNullError('model.template');

            if (!TypeHelper.isPlainObject(model))
                throw new types.TypeError('model.template', 'Plain Object');

            if (String.isEmpty(model.template.template))
                throw new types.ArgumentNullError('model.template.template', 'Template content or template filename is required.');

            if (TypeHelper.isPlainObject(model.cache)) {
                if (String.isEmpty(model.cache!.key))
                    throw new types.ArgumentNullError('model.cache.key', 'The cache.key is required.');
            }
            else
                delete model.cache;
        }
        catch (err) {
            if (reject instanceof Function)
                reject(err);
            else
                throw err;
        }
    }
    private getCacheKey = (model: types.CompileModel): string => model.template.isFile ? model.template.template.trim().toLowerCase() : model.cache!.key;
    private getTemplateName = (model: types.CompileModel): string => model.template.isFile ? model.template.template : '';
    private getTemplate = (model: types.CompileModel): string => model.template.isFile ? this.templateLoader.load(model.template.template) : model.template.template;
    private getTemplateAsync = (model: types.CompileModel): Promise<string> => model.template.isFile ? this.templateLoader.loadAsync(model.template.template) : Promise.resolve(model.template.template);
}