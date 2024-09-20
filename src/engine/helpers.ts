export const TypeHelper = Object.freeze({
    geStringName: (x: any): string => Object.prototype.toString.call(x).slice(8, -1),
    isPlainObject: (x: any): boolean => TypeHelper.geStringName(x) === 'Object',
    isFunc: (x: any): boolean => TypeHelper.geStringName(x) === 'Function',
    isArray: (x: any): boolean => TypeHelper.geStringName(x) === 'Array',
    isDate: (x: any): boolean => TypeHelper.geStringName(x) === 'Date',
    isBoolean: (x: any): boolean => TypeHelper.geStringName(x) === 'Boolean',
    isNumber: (x: any): boolean => TypeHelper.geStringName(x) === 'Number',
    isString: (x: any): boolean => TypeHelper.geStringName(x) === 'String',
});

export const MiscHelper = Object.freeze({
    isJavaScriptIdentifier: (input: string) => /^[a-zA-Z_$][0-9a-zA-Z_$]*$/.test(input),
    escapeRegExpChars: (input: string): string => String.isEmpty(input) ? '' : input.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&'),
    escapeXML: (markup?: string) => String.isEmpty(markup) ? '' : markup!.toString().replace(/[&<>'"]/g, encodeChar),
});

const _ENCODE_HTML_RULES: { [key: string]: string } = Object.freeze({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&#34;',
        "'": '&#39;'
    })
    , encodeChar = (c: string): string => _ENCODE_HTML_RULES[c] || c;

