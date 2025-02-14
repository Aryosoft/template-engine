import { ITemplateLoader, TemplateNotFoundException, PlainObject } from './types';
import fs from 'fs';

export const FileTemplateLoader: ITemplateLoader = Object.freeze({
    load: (filename: string, metaData: PlainObject): string => {
        if (!fs.existsSync(filename))
            throw new TemplateNotFoundException(filename);
        
        return fs.readFileSync(filename, 'utf-8');
    },
    loadAsync: (filename: string, metaData: PlainObject): Promise<string> => new Promise<string>((resolve, reject) => {
        if (!fs.existsSync(filename))
            return reject(new TemplateNotFoundException(filename));

        fs.readFile(filename, 'utf-8', (err, data) => {
            if (err)
                reject(err);
            else
                resolve(data);
        });
    })
});