export { }

declare global {
    type TMultiInsert = { [index: number]: string }

    interface StringConstructor {
        isEmpty(input?: string | null): boolean;
        coalesce(...args: Array<string | null | undefined>): string | null | undefined;
        extractNumbers(input: string): string;
    }

    interface String {
        extractNumbers(): string;
        clean(keepCharCase?: boolean): string;
        forEach(callbackfn: (char: string, index: number, value: string) => void): void;
        isEmpty(): boolean;
        insert(i: number, s: string): string;
        multiInsert(options: TMultiInsert): string;
        reduceSpaces(): string;
        reverse(): string;
        removeAt(i: number, n?: number): string;
        some(predicate?: (char: string) => boolean): boolean;
        toPascalCase(): string;
        translateDigitToEnglish(): string;
        trimX(...args: string[]): string;
        trimEndX(...args: string[]): string;
        trimStartX(...args: string[]): string;
    }
}

//#region String - Constructor
String.isEmpty = function (input?: string) {
    return (input || '').toString().trim() === '';
}

String.coalesce = function (...args: string[]): string | null | undefined {
    if (!args || args.length < 1) return null;
    return args.find(x => !String.isEmpty(x));
}

String.extractNumbers = function (input: string): string {
    return input.replace(/\D/g, '');
}
//#endregion

//#region String - Extensions

String.prototype.extractNumbers = function (): string {
    return this.replace(/\D/g, '');
}

String.prototype.clean = function(keepCharCase?: boolean): string{
    let normalized  = this.normalize("NFD").replace(/[\u0300-\u036f]/g, "").reduceSpaces();
    return keepCharCase
        ? normalized
        : normalized.toLowerCase();
}

String.prototype.forEach = function (callbackfn: (char: string, index: number, value: string) => void): void {
    let s = this.toString();
    for (let i = 0; i < s.length; i++)
        callbackfn(s[i], i, s);
}

String.prototype.isEmpty = function () {
    return (this || '').trim() === '';
}

String.prototype.insert = function (i: number, s: string): string {
    if (String.isEmpty(s)) return this.toString();
    if (i < 0) i = 0;
    if (i > (this.length - 1)) i = this.length - 1;
    return this.substring(0, i) + s + this.substring(i);
}

String.prototype.multiInsert = function (options: TMultiInsert): string {
    let s = this.toString();
    Object.keys(options)
        .map(key => {
            let i = +key;
            if (i < 0) i = 0;
            if (i > this.length) i = this.length;
            return i;
        })
        .descSort()
        .forEach(i => {
            if (options[i] !== undefined && options[i] !== null)
                s = s.substring(0, i) + options[i] + s.substring(i)
        });

    return s;
}

String.prototype.reduceSpaces = function(): string{
    return this.replace(/ +(?= )/g,'');
}

String.prototype.reverse = function (): string {
    if (this.isEmpty()) return '';
    let chars = new Array(this.length);
    for (var i = this.length - 1, j = 0; i >= 0; i--, j++)
        chars[j] = this[i];
    return chars.join('');
}

String.prototype.removeAt = function (i: number, n?: number): string {
    if (i == undefined || i == null || i < 0 || i > (this.length - 1)) return this.toString();
    if (n == undefined || n == null) n = 1;
    if (n < 0) n = 0;
    return this.slice(0, i) + this.slice(i + n);
}

String.prototype.some = function (predicate?: (char: string) => boolean): boolean {
    if (predicate instanceof Function) {
        let res = false;
        for (let i = 0; !res && i < this.length; i++)
            res = predicate(this[i]);
        return res;
    }
    else
        return this.length > 0;
}

String.prototype.toPascalCase = function(): string {
    return this.replace(/\w+/g, function(w){return w[0].toUpperCase() + w.slice(1).toLowerCase();});
}

String.prototype.translateDigitToEnglish = function (): string {
    return this
        .replaceAll('٠', '0').replaceAll('۰', '0')
        .replaceAll('١', '1').replaceAll('۱', '1')
        .replaceAll('٢', '2').replaceAll('۲', '2')
        .replaceAll('٣', '3').replaceAll('۳', '3')
        .replaceAll('٤', '4').replaceAll('۴', '4')
        .replaceAll('٥', '5').replaceAll('۵', '5')
        .replaceAll('٦', '6').replaceAll('۶', '6')
        .replaceAll('٧', '7').replaceAll('۷', '7')
        .replaceAll('٨', '8').replaceAll('۸', '8')
        .replaceAll('٩', '9').replaceAll('۹', '9');
}

String.prototype.trimX = function (...args: string[]): string {
    return this.trimStartX(...args).trimEndX(...args);
}

String.prototype.trimEndX = function (...args: string[]): string {
    let i = this.length, excepts = args.concat(Array.from('\r\n\t '));
    while (i >= 0) {
        if (excepts.indexOf(this[i - 1]) < 0)
            break;
        i--;
    }
    return this.substring(0, i);
}

String.prototype.trimStartX = function (...args: string[]): string {
    let i = 0, excepts = args.concat(Array.from('\r\n\t '));

    while (i < this.length) {
        if (excepts.indexOf(this[i]) < 0)
            break;
        i++;
    }

    return this.substring(i);
}
//#endregion