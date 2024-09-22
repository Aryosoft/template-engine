import * as types from './types';
import * as htmlParser from 'node-html-parser';

type TPageInfo = {
    isPartialPage: boolean,
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

const Tags = Object.freeze({
    /** <partial></partial> */
    partialTagName: 'partial',

    /** <partial layout="layout_name"></partial> */
    partialTagLayoutAttr: 'layout',

    /** <partial layout="layout_name"><body></body></partial> */
    partialBodyQuery: 'partial > body',

    /** <partial layout="layout_name"><code></code></partial> */
    partialCodeQuery: 'partial > code',

    /** <partial layout="layout_name"><section name="section_name"></section></partial> */
    partialSectionQuery: 'partial > section',
    partialSectionTagNameAttr: 'name',

    /**<render-body/>*/
    layoutRenderBodyTagName: 'render-body',

    /**<render-section name="section_name"/>*/
    layoutRenderSectionTagName: 'render-section',
    layoutRenderSectionNameAttr: 'name',
});

const Messages = Object.freeze({
    circularLayout: 'Circular layout reference. A partial page cannot use itself as its layout.',
    missingPartialLayoutAttr: `Missing the required attribute "${Tags.partialTagLayoutAttr}" on the ${Tags.partialTagName} tag.`,
    missingRenderBodyTag: `Missing required tag => <${Tags.layoutRenderBodyTagName}/>`,
});

export class LayoutResolver {
    constructor(private readonly loader: types.ITemplateLoader) { }

    private getPageInfo(template: string): TPageInfo {
        let dom = htmlParser.parse(template);
        let partial = dom.querySelector(Tags.partialTagName);
        let info: TPageInfo = { isPartialPage: Boolean(partial), layoutName: '', body: '', codes: {}, sections: {} };
        if (!info.isPartialPage) return info;
        info.layoutName = partial!.getAttribute(Tags.partialTagLayoutAttr) ?? '';
        if (String.isEmpty(info.layoutName)) throw new Error(Messages.missingPartialLayoutAttr);
        /*------------------------------------------------*/
        info.body = dom.querySelector(Tags.partialBodyQuery)?.innerHTML ?? '';

        dom.querySelectorAll(Tags.partialCodeQuery)
            .forEach((el, i) => {
                let key = i.toString().padStart(6, '0');
                info.codes[key] = el.innerHTML.trim();
            });

        dom.querySelectorAll(Tags.partialSectionQuery)
            .forEach(el => {
                let name = el.getAttribute(Tags.partialSectionTagNameAttr);
                if (!String.isEmpty(name))
                    info.sections[name!] = el.innerHTML.trim();
            });

        return info;
    }

    private getLayoutInfo(layoutName: string): TLayoutInfo {
        let template = this.loader.load(layoutName);
        let info: TLayoutInfo = { documnt: htmlParser.parse(template), body: null, sections: {} };

        info.body = info.documnt.querySelector(Tags.layoutRenderBodyTagName);
        if (!info.body) throw new Error(Messages.missingRenderBodyTag);

        info.documnt.querySelectorAll(Tags.layoutRenderSectionTagName)
            .forEach(el => {
                let name = el.getAttribute(Tags.layoutRenderSectionNameAttr);
                if (!String.isEmpty(name))
                    info.sections[name!] = el;
            });

        let page = this.getPageInfo(template);
        if (page.isPartialPage) {
            if (page.layoutName.trim().toLowerCase() == layoutName.trim().toLowerCase())
                throw new Error(Messages.circularLayout);
            info.parent = this.getLayoutInfo(page.layoutName);
        }
        return info;
    }

    private getLayoutInfoAsync(layoutName: string): Promise<TLayoutInfo> {
        return new Promise<TLayoutInfo>((resolve, reject) => {
            this.loader.loadAsync(layoutName)
                .then(template => {
                    let info: TLayoutInfo = { documnt: htmlParser.parse(template), body: null, sections: {} };

                    info.body = info.documnt.querySelector(Tags.layoutRenderBodyTagName);
                    if (!info.body) return reject(new Error(Messages.missingRenderBodyTag));

                    info.documnt.querySelectorAll(Tags.layoutRenderSectionTagName)
                        .forEach(el => {
                            let name = el.getAttribute(Tags.layoutRenderSectionNameAttr);
                            if (!String.isEmpty(name))
                                info.sections[name!] = el;
                        });

                    let page = this.getPageInfo(template);
                    if (page.isPartialPage) {
                        if (page.layoutName.trim().toLowerCase() == layoutName.trim().toLowerCase())
                            reject(new Error(Messages.circularLayout));
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
        return page.isPartialPage
            ? this.merge(page, this.getLayoutInfo(page.layoutName))
            : template;
    }

    public resolveAsync(template: string): Promise<string> {
        let page = this.getPageInfo(template);
        return page.isPartialPage
            ? this.getLayoutInfoAsync(page.layoutName).then(layout => this.merge(page, layout))
            : Promise.resolve(template);
    }
}