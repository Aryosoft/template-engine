export const TypeHelper: {
    geStringName: (x: any) => string,
    isPlainObject: (x: any) => boolean,
    isFunc: (x: any) => boolean,
    isArray: (x: any) => boolean,
    isDate: (x: any) => boolean,
    isBoolean: (x: any) => boolean,
    isNumber: (x: any) => boolean,
    isString: (x: any) => boolean

} = Object.freeze({
    geStringName: (x: any): string => Object.prototype.toString.call(x).slice(8, -1),
    isPlainObject: (x: any): boolean => TypeHelper.geStringName(x) === 'Object',
    isFunc: (x: any): boolean => TypeHelper.geStringName(x) === 'Function',
    isArray: (x: any): boolean => TypeHelper.geStringName(x) === 'Array',
    isDate: (x: any): boolean => TypeHelper.geStringName(x) === 'Date',
    isBoolean: (x: any): boolean => TypeHelper.geStringName(x) === 'Boolean',
    isNumber: (x: any): boolean => TypeHelper.geStringName(x) === 'Number',
    isString: (x: any): boolean => TypeHelper.geStringName(x) === 'String',
});


export const MiscHelper: {
    isJavaScriptIdentifier: (input: string) => boolean,
    escapeRegExpChars: (input: string) => string,
    escapeXML: (markup?: string) => string,
    isEmptyString: (value: string | null | undefined) => boolean,
    stringTrimEnd: (value: string, args?: string[]) => string,
    stringCoalesce: (...args: Array<string | null | undefined>) => string | undefined,
} = Object.freeze({
    isEmptyString: (value: string | null | undefined): boolean => (value || '').toString().trim() === '',
    stringTrimEnd: (value: string, args?: string[]): string => {
        if (MiscHelper.isEmptyString(value)) return value;
        if (!(args instanceof Array)) args = [];
        let i = value.length, excepts = args.concat(Array.from('\r\n\t '));
        while (i >= 0) {
            if (excepts.indexOf(value[i - 1]) < 0)
                break;
            i--;
        }
        return value.substring(0, i);
    },
    stringCoalesce: (...args: Array<string | null | undefined>): string | undefined => {
        if (!args || args.length < 1) return undefined;
        return args.find(x => !MiscHelper.isEmptyString(x)) ?? undefined;
    },
    isJavaScriptIdentifier: (input: string): boolean => /^[a-zA-Z_$][0-9a-zA-Z_$]*$/.test(input),
    escapeRegExpChars: (input: string): string => MiscHelper.isEmptyString(input) ? '' : input.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&'),
    escapeXML: (markup?: string) => MiscHelper.isEmptyString(markup) ? '' : markup!.toString().replace(/[&<>'"]/g, encodeChar),
});

const _ENCODE_HTML_RULES: { [key: string]: string } = Object.freeze({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&#34;',
    "'": '&#39;'
})
    , encodeChar = (c: string): string => _ENCODE_HTML_RULES[c] || c;

