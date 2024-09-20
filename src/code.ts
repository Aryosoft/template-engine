import * as types from './engine/types';
import { Engine } from './engine';
import { Compiler } from './engine/compiler';
import { ConsoleLogger } from './engine/console-logger';
import fs from 'fs';
import path from 'path';

const templateRootPath: string = 'D:/Aryosoft/Projects/template-engine/src/templates';

const TemplateLoader: types.ITemplateLoader = Object.freeze({
    load: (filename: string): string => {
        filename = path.resolve(templateRootPath, `${filename}.ejs`);
        return fs.readFileSync(filename, 'utf-8');
    },
    loadAsync: (filename: string): Promise<string> => new Promise<string>((resolve, reject) => {
        filename = path.resolve(templateRootPath, `${filename}.ejs`);
        fs.readFile(filename, 'utf-8', (err, data) => {
            if (err)
                reject(err);
            else
                resolve(data);
        });
    })
});

export class TestEngine {
    private readonly engine: types.IEngine = new Engine(
        new Compiler(TemplateLoader, ConsoleLogger),
        TemplateLoader
    );

    public render(templateName: string, limit: number): string {
        let html = this.engine.render({
            template: { template: templateName, isFile: true },
            cache: { key: templateName, duration: 10 }
        }, {
            content: 'index',
            pageTitle: 'Index Page',
            people: this.getPeople(limit)
            //items: this.getPeople(limit)
        });

        return html;
        //return '<h3>RENDER</h3>' + (limit > 0 ? `<p>Limit = ${limit}</p>` : '');
    }

    public renderAsync(templateName: string, limit: number): Promise<string> {
        return this.engine.renderAsync({
            template: { template: templateName, isFile: true },
            cache: { key: templateName, duration: 10 }
        }, {
            items: this.getPeople(limit)
        }).then(html => {
            return html;
        })
        // return Promise.resolve('<h3>ASYNC RENDER</h3>' + (limit > 0 ? `<p>Limit = ${limit}</p>` : ''));
    }

    private getPeople(limit: number): TPeople[] {
        return limit > 0
            ? people.slice(0, limit)
            : people;
    }
}

type TPeople = {
    serial: number,
    name: string,
    surname: string
};

const people: TPeople[] = [
    { serial: 100, name: 'Pouya', surname: 'Faridi' },
    { serial: 101, name: 'Parisa', surname: 'Azari' },
    { serial: 102, name: 'Asena', surname: 'Faridi' },
    { serial: 103, name: 'Helia', surname: 'Faridi' },
    { serial: 104, name: 'Abolfazl', surname: 'Faridi' },
];