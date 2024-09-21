import * as types from './types';
import * as htmlParser from 'node-html-parser';

type TPageInfo = {
    useLayout: boolean,
    layoutName: string,
    body: string,
    sections: { [key: string]: string },
    codes: { [key: string]: string }
}
type TLayoutInfo = {
    documnt: htmlParser.HTMLElement,
    body: htmlParser.HTMLElement | null,
    sections: { [key: string]: htmlParser.HTMLElement },
    parent?: TLayoutInfo
}
export class LayoutResolver {

    constructor(private readonly loader: types.ITemplateLoader) {

    }

    private getPageInfo(template: string): TPageInfo {
        let info: TPageInfo = { useLayout: false, layoutName: '', body: '', codes: {}, sections: {} };
        let dom = htmlParser.parse(template);
        let layout = dom.querySelector('layout');
        info.useLayout = Boolean(layout);
        if (!info.useLayout) return info;
        info.layoutName = layout!.getAttribute('name') ?? '';
        if (String.isEmpty(info.layoutName)) throw new Error('Layout name is not specified. The layout tag an attribute named "name". ');
        /*------------------------------------------------*/
        info.body = dom.querySelector('layout > body')?.innerHTML ?? '';

        dom.querySelectorAll('layout > code').forEach((el, i) => {
            let key = i.toString().padStart(6, '0');
            info.codes[key] = el.innerHTML.trim();
        });

        dom.querySelectorAll('layout > section').forEach((el, i) => {
            let name = el.getAttribute('name');
            if (!String.isEmpty(name))
                info.sections[name!] = el.innerHTML.trim();
        });

        return info;
    }

    private getLayoutInfo(layoutName: string): TLayoutInfo {
        let template = this.loader.load(layoutName);
        let info: TLayoutInfo = { documnt: htmlParser.parse(template), body: null, sections: {} };

        info.body = info.documnt.querySelector('render-body');
        if (!info.body) throw new Error('Missing required tag => <render-body/>');

        info.documnt.querySelectorAll('render-section')
            .forEach(el => {
                let name = el.getAttribute('name');
                if (!String.isEmpty(name))
                    info.sections[name!] = el;
            });

        let page = this.getPageInfo(template);
        if (page.useLayout) {
            if (page.layoutName.trim().toLowerCase() == layoutName.trim().toLowerCase())
                throw new Error('Circular layout reference. A layout cannot use itself as its layout.');

            info.parent = this.getLayoutInfo(page.layoutName);
        }
        return info;
    }

    private getLayoutInfoAsync(layoutName: string): Promise<TLayoutInfo> {
        return new Promise<TLayoutInfo>((resolve, reject) => {
            this.loader.loadAsync(layoutName)
                .then(template => {
                    let info: TLayoutInfo = { documnt: htmlParser.parse(template), body: null, sections: {} };

                    info.body = info.documnt.querySelector('render-body');
                    if (!info.body) return reject(new Error('Missing required tag => <render-body/>'));

                    info.documnt.querySelectorAll('render-section')
                        .forEach(el => {
                            let name = el.getAttribute('name');
                            if (!String.isEmpty(name))
                                info.sections[name!] = el;
                        });

                    let page = this.getPageInfo(template);
                    if (page.useLayout) {
                        if (page.layoutName.trim().toLowerCase() == layoutName.trim().toLowerCase())
                            reject(new Error('Circular layout reference. A layout cannot use itself as its layout.'));
                        else
                            this.getLayoutInfoAsync(page.layoutName)
                                .then(parent => {
                                    info.parent = parent;
                                    resolve(info);
                                })
                                .catch(reject);
                    }
                    else
                        resolve(info);
                })
                .catch(reject);
        });
    }

    private merge2(page: TPageInfo, layout: TLayoutInfo, codes: string[]): string {
        let code = Object.keys(page.codes).map(key => page.codes[key]).join('\r\n').trim();
        if (!String.isEmpty(code)) codes.push(code);

        layout.body!.replaceWith(page.body);

        Object.keys(layout.sections)
            .forEach(name => {
                if (String.isEmpty(page.sections[name]))
                    layout.sections[name].remove();
                else
                    layout.sections[name].replaceWith(page.sections[name]);
            });

        return layout.parent
            ? this.merge2(this.getPageInfo(layout.documnt.outerHTML), layout.parent, codes)
            : layout.documnt.outerHTML;
    }

    private merge(page: TPageInfo, layout: TLayoutInfo): string {
        let codes: string[] = [];
        let finalMarkup = this.merge2(page, layout, codes);
        return `${codes.join('\r\n').trim()}\r\n${finalMarkup}`.trim();
    }

    public resolve(template: string): string {
        let page = this.getPageInfo(template);
        return page.useLayout
            ? this.merge(page, this.getLayoutInfo(page.layoutName))
            : template;
    }

    public resolveAsync(template: string): Promise<string> {
        let page = this.getPageInfo(template);
        return page.useLayout
            ? this.getLayoutInfoAsync(page.layoutName).then(layout => this.merge(page, layout))
            : Promise.resolve(template);
    }
}