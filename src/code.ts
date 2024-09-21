import * as types from './engine/types';
import { Engine } from './engine';
import { Compiler } from './engine/compiler';
import { ConsoleLogger } from './engine/console-logger';
import fs from 'fs';
import path from 'path';

const templateRootPath: string = 'D:/Aryosoft/Projects/template-engine/src/templates';

const TemplateLoader: types.ITemplateLoader = Object.freeze({
    load: (filename: string): string => {
        if (String.isEmpty(path.extname(filename)))
            filename += '.html';

        filename = path.resolve(templateRootPath, `${filename}`);
        return fs.readFileSync(filename, 'utf-8');
    },
    loadAsync: (filename: string): Promise<string> => new Promise<string>((resolve, reject) => {
        if (String.isEmpty(path.extname(filename)))
            filename += '.html';

        filename = path.resolve(templateRootPath, `${filename}`);
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
            //content: 'index',
            pageTitle: '',
            people: this.getPeople(limit)
        });

        return html;
    }

    public renderAsync(templateName: string, limit: number): Promise<string> {
        return this.engine.renderAsync({
            template: { template: templateName, isFile: true },
            cache: { key: templateName, duration: 10 }
        }, {
            pageTitle: 'ASYNC',
            people: this.getPeople(limit)
        }).then(html => {
            return html;
        })
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