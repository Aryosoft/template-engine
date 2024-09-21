import env from 'dotenv'
import express, { Express, Request, Response } from 'express';
import { TestEngine } from './code'

class App {
    constructor() {
        env.config();
        this.engine = new TestEngine();
        this.app = this.configApp(express());
    }

    public run(): Promise<{ host: string }> {

        return new Promise<{ host: string }>((resolve, reject) => {
            let port = +(process.env.PORT ?? '2500').toString();
            port = isNaN(port) ? 2500 : port;

            let server = this.app.listen(port, () => {
                resolve({
                    host: `http://localhost:${port}`
                });
            })
                .on('error', reject)
                .on('close', this.onTerminated.bind(this));
        });


    }

    private readonly app: Express = null!;
    private readonly engine: TestEngine = null!;

    private configApp(app: Express): Express {
        return app.get('/', this.index.bind(this))
            .get('/async', this.asyncRender.bind(this));
    }

    private index(req: Request, resp: Response): void {
        try {
            let limit = this.getListLimit(req)
            , template_name = this.getTemplateName(req);

            let html = this.engine.render(template_name, limit);
            this.success(resp, html);
        }
        catch (err) {
            this.serverError(resp, err);
        }
    }

    private asyncRender(req: Request, resp: Response): void {
        let limit = this.getListLimit(req)
            , template_name = this.getTemplateName(req);

        this.engine.renderAsync(template_name, limit)
            .then(html => this.success(resp, html))
            .catch(err => this.serverError(resp, err));
    }

    private getListLimit(req: Request): number {
        let limit = +(req.query.limit ?? '0').toString().trim();
        if (isNaN(limit) || limit < 1) limit = 0;
        return limit;
    }

    private getTemplateName(req: Request): string {
        let name = (req.query.name ?? '').toString().trim().toLowerCase();
        if (name == '') name = 'index';
        return name;
    }

    private success(resp: Response, html: string) {
        resp.status(200)
            .contentType('text/html')
            .send(html);
    }

    private serverError(resp: Response, error: any) {
        resp.status(500)
            .contentType('text/html')
            .send([
                '<h3>HTTP ERROR 500 - Internal Sever Error</h3>',
                `<p style="color:#f00">${error.message}</p>`
            ].join(''));
    }

    private onTerminated() {
        console.warn('The application is terminated.');
    }
}

export default new App()
    .run()
    .then(info => {
        console.clear();
        console.info(`Server is running on ${info.host}`);
        console.dir(info);
        return info;
    })
    .catch(err => {
        console.clear();
        console.error(`The application cannot be started.\n${err.message}`);
    });