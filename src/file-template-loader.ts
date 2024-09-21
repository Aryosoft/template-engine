import { ITemplateLoader } from './types';
import fs from 'fs';

export const FileTemplateLoader: ITemplateLoader = Object.freeze({
    load: (filename: string): string => fs.readFileSync(filename, 'utf-8'),
    loadAsync: (filename: string): Promise<string> => new Promise<string>((resolve, reject) => {
        fs.readFile(filename, 'utf-8', (err, data) => {
        
            if (err)
                reject(err);
            else
                resolve(data);
        });
    })
});