import { MiscHelper } from '../helpers';
import { LayoutResolver } from '../layout-resolver';
import * as types from '../types';

enum Modes {
    EVAL = 'eval',
    ESCAPED = 'escaped',
    RAW = 'raw',
    COMMENT = 'comment',
    LITERAL = 'literal'
}

export abstract class CompilerBase {
    constructor(
        protected template: string,
        protected readonly options: types.CompilOptions,
        protected readonly loader: types.ITemplateLoader,
        protected readonly logger: types.ILogger
    ) {
        this.regex = this.createRegex();
        this.layoutResolver = new LayoutResolver(loader);
    }

    protected readonly layoutResolver: LayoutResolver = null!;

    //#region Private Fields
    private _source: string = '';
    private truncate = false;
    private currentLine = 1;
    //  private renderer?: Function;
    private mode: Modes | null = null;
    private readonly regex: RegExp = null!;
    //#endregion
    //#region private-methods
    protected get source(): string {
        return this._source;
    }


    protected prepareSource = (async: boolean): string => {
        if (!String.isEmpty(this._source)) return this._source;

        let sanitizedFilename = String.isEmpty(this.options.templateFilename) ? JSON.stringify(this.options.templateFilename) : 'undefined';

        let src = '', prepended = '', appended = '';

        // if (StringHelper.isEmpty(this.source)) {
        this.generateSource(async);

        prepended += 'let __output = ""; \n function __append(s) { if (s !== undefined && s !== null) __output += s }\n';
        /* if (!String.isEmpty(this.options.outputFunctionName)) {
             if (!MiscHelper.isJavaScriptIdentifier(this.options.outputFunctionName!)) throw new Error('outputFunctionName is not a valid JS identifier.');
             prepended += `  var ${this.options.outputFunctionName} = __append;\n`;//'  var ' + this.options.outputFunctionName + ' = __append;' + '\n';
         }*/
        if (!String.isEmpty(this.options.localsName) && !MiscHelper.isJavaScriptIdentifier(this.options.localsName)) throw new Error('localsName is not a valid JS identifier.');

        if (this.options.destructuredLocals instanceof Array && this.options.destructuredLocals.length) {
            var destructuring = `  var __locals = (${this.options.localsName} || {}),\n`; //'  var __locals = (' + this.options.localsName + ' || {}),\n';
            for (let i = 0; i < this.options.destructuredLocals.length; i++) {
                var name = this.options.destructuredLocals[i];
                if (!MiscHelper.isJavaScriptIdentifier(name)) throw new Error(`destructuredLocals.${name} is not a valid JS identifier.`);
                if (i > 0) destructuring += ',\n  ';
                destructuring += `${name} = __locals.${name}`; //name + ' = __locals.' + name;
            }
            prepended += destructuring + ';\n';
        }
        /* if (this.options.useWithStatement !== false) {
             prepended += '  with (' + this.options.localsName + ' || {}) {\n';
             appended += '  }\n';
         }*/
        appended += 'return __output;\n';

        this._source = prepended + this._source + appended;
        //  }
        if (this.options.compileDebug) {
            src = `var __line = 1\n`
                + `  , __lines =  ${JSON.stringify(this.template)} \n`
                + `  , __filename = ${sanitizedFilename};\n` //'  , __filename = ' + sanitizedFilename + ';' + '\n'
                + `try {\n${this._source}} catch (e) {\n rethrow(e, __lines, __filename, __line, escapeFn);\n }\n`;
        }
        else {
            src = this._source;
        }

        if (this.options.clientMode) {
            src = `escapeFn = escapeFn || ${this.options.escape!.toString()};\n${src}`; // src = 'escapeFn = escapeFn || ' + this.options.escape.toString() + ';' + '\n' + src;
            if (this.options.compileDebug)
                src = `rethrow = rethrow || ${this.rethrow.toString()};\n${src}`; // src = 'rethrow = rethrow || ' + this.rethrow.toString() + ';' + '\n' + src;
        }

        if (this.options.useStrict) src = '"use strict";\n' + src;
        if (this.options.debug) this.logger.debug(src);
        if (this.options.compileDebug && !String.isEmpty(this.options.templateFilename))
            src = `${src}\n//# sourceURL=${sanitizedFilename}\n`; //src + '\n' + '//# sourceURL=' + sanitizedFilename + '\n';

        this._source = src;

        return this._source;
    };

    private generateSource = (async: boolean): void => {
        if (this.options.removeWhitespaces) {
            // Have to use two separate replace here as `^` and `$` operators don't
            // work well with `\r` and empty lines don't work well with the `m` flag.
            this.template = this.template.replace(/[\r\n]+/g, '\n').replace(/^\s+|\s+$/gm, '');
        }

        // Slurp spaces and tabs before <%_ and after _%>
        this.template = this.template.replace(/[ \t]*<%_/gm, '<%_').replace(/_%>[ \t]*/gm, '_%>');

        var matches = this.parseTemplateText(this.template);
        let od = this.options.openDelimiter + this.options.delimiter;
        let odd = this.options.openDelimiter + this.options.delimiter + this.options.delimiter;
        let dc = this.options.delimiter + this.options.closeDelimiter;
        let _dc = `_${dc}`, dash_dc = `-${dc}`;

        if (matches && matches.length) {
            matches.forEach((line, index) => {
                var closing;

                if (async && /^\s*include\s*\(/.test(line)) {
                    line = ' await ' + line.trim();
                }

                if (line.indexOf(od) === 0 && line.indexOf(odd) !== 0) { // If it is a tag and is not escaped
                    closing = matches[index + 2];
                    if (!(closing == dc || closing == dash_dc || closing == _dc))
                        throw new Error(`Could not find matching close tag for "${line}".`);
                }
                this.scanLine(line);
            });
        }

    };

    private parseTemplateText = (template: string): string[] => {
        let result = this.regex.exec(template), arr = [], i = 0;

        while (result) {
            i = result.index;

            if (i !== 0) {
                arr.push(template.substring(0, i));
                template = template.slice(i);
            }

            arr.push(result[0]);
            template = template.slice(result[0].length);
            result = this.regex.exec(template);
        }

        if (!String.isEmpty(template)) arr.push(template);

        return arr;
    };

    private scanLine = (line: string): void => {
        let od = this.options.openDelimiter + this.options.delimiter, od_ = `${od}_`, od_dash = `${od}-`, od_eq = `${od}=`, od_hash = `${od}#`, odd = this.options.openDelimiter + this.options.delimiter + this.options.delimiter, dc = this.options.delimiter + this.options.closeDelimiter, ddc = this.options.delimiter + this.options.delimiter + this.options.closeDelimiter, dash_dc = `-${dc}`, _dc = `_${dc}`;
        var newLineCount = 0;

        newLineCount = (line.split('\n').length - 1);

        // if(/\bthis\.useLayout\s*\(/.test(line)){
        //     line = line.replace(/\bthis\.useLayout\s*\(/, '__layout = this.useLayout(')
        // }
        switch (line) {
            case od:
            case od_:
                this.mode = Modes.EVAL;
                break;
            case od_eq:
                this.mode = Modes.ESCAPED;
                break;
            case od_dash:
                this.mode = Modes.RAW;
                break;
            case od_hash:
                this.mode = Modes.COMMENT;
                break;
            case odd:
                this.mode = Modes.LITERAL;
                this._source += `    ; __append("${line.replace(odd, od)}")\n`; // this.source += '    ; __append("' + line.replace(odd, od) + '")' + '\n';
                break;
            case ddc:
                this.mode = Modes.LITERAL;
                this._source += `    ; __append("${line.replace(ddc, dc)}")\n`; //this.source += '    ; __append("' + line.replace(ddc, dc) + '")' + '\n';
                break;
            case dc:
            case dash_dc:
            case _dc:
                if (this.mode == Modes.LITERAL) this._addOutput(line);
                this.mode = null;
                this.truncate = line.indexOf('-') === 0 || line.indexOf('_') === 0;
                break;
            default:
                // In script mode, depends on type of tag
                if (this.mode) {
                    // If '//' is found without a line break, add a line break.
                    switch (this.mode) {
                        case Modes.EVAL:
                        case Modes.ESCAPED:
                        case Modes.RAW:
                            if (line.lastIndexOf('//') > line.lastIndexOf('\n')) line += '\n';
                    }

                    switch (this.mode) {
                        // Just executing code
                        case Modes.EVAL:
                            this._source += `    ; ${line}\n`; // this.source += '    ; ' + line + '\n';
                            break;
                        // Exec, esc, and output
                        case Modes.ESCAPED:
                            this._source += `    ; __append(escapeFn(${this.stripSemi(line)}))\n`; // this.source += '    ; __append(escapeFn(' + this.stripSemi(line) + '))' + '\n';
                            break;
                        // Exec and output
                        case Modes.RAW:
                            this._source += `    ; __append(${this.stripSemi(line)})\n`; // this.source += '    ; __append(' + this.stripSemi(line) + ')' + '\n';
                            break;
                        case Modes.COMMENT:
                            // Do nothing
                            break;
                        // Literal <%% mode, append as raw output
                        case Modes.LITERAL:
                            this._addOutput(line);
                            break;
                    }
                }

                // In string mode, just add the output
                else {
                    this._addOutput(line);
                }
        }

        if (this.options.compileDebug && newLineCount) {
            this.currentLine += newLineCount;
            this._source += `    ; __line = ${this.currentLine}\n`; // this.source += '    ; __line = ' + this.currentLine + '\n';
        }
    };

    private _addOutput = (line: string): void => {
        if (this.truncate) {
            line = line.replace(/^(?:\r\n|\r|\n)/, '');
            this.truncate = false;
        }

        if (!line) return;

        // Preserve literal slashes
        line = line.replace(/\\/g, '\\\\');

        // Convert linebreaks
        line = line.replace(/\n/g, '\\n').replace(/\r/g, '\\r');

        // Escape double-quotes
        // - this will be the delimiter during execution
        line = line.replace(/"/g, '\\"');
        this._source += `    ; __append("${line}")\n`; //this.source += '    ; __append("' + line + '")' + '\n';
    };

    private stripSemi = (str: string): string => str.replace(/;(\s*$)/, '$1');

    protected rethrow = (err: Error, str: string, flnm: string, lineno: number, esc: (input: string) => string): void => {
        let lines = str.split('\n'), start = Math.max(lineno - 3, 0), end = Math.min(lines.length, lineno + 3), filename = esc(flnm);

        // Error context
        let context = lines.slice(start, end).map((line, i) => {
            let curr = i + start + 1;
            return `${curr == lineno ? ' >> ' : '    '}${curr}| ${line}`;
        }).join('\n');

        err.cause = filename;
        err.message = `${filename ?? ''}:`.trimEndX(':');
        err.message = `${(`${filename ?? ''}:`.trimEndX(':'))}${lineno}\n${context}\n\n${err.message}`;

        throw err;
    };

    private createRegex = () => {
        let delim = MiscHelper.escapeRegExpChars(this.options.delimiter), open = MiscHelper.escapeRegExpChars(this.options.openDelimiter), close = MiscHelper.escapeRegExpChars(this.options.closeDelimiter);

        let str = '(<%%|%%>|<%=|<%-|<%_|<%#|<%|%>|-%>|_%>)'
            .replace(/%/g, delim)
            .replace(/</g, open)
            .replace(/>/g, close);
        return new RegExp(str);
    };
}
