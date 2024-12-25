/**
 * @internal
 * This utility is for internal use within the package only.
 */
export const TypeHelper: {
    geTypeName: (x: any) => string,
    isPlainObject: (x: any) => boolean,
    isFunc: (x: any) => boolean,
    isArray: (x: any) => boolean,
    isDate: (x: any) => boolean,
    isBoolean: (x: any) => boolean,
    isNumber: (x: any) => boolean,
    isString: (x: any) => boolean

} = Object.freeze({
    geTypeName: (x: any): string => Object.prototype.toString.call(x).slice(8, -1),
    isPlainObject: (x: any): boolean => TypeHelper.geTypeName(x) === 'Object',
    isFunc: (x: any): boolean => TypeHelper.geTypeName(x) === 'Function',
    isArray: (x: any): boolean => TypeHelper.geTypeName(x) === 'Array',
    isDate: (x: any): boolean => TypeHelper.geTypeName(x) === 'Date',
    isBoolean: (x: any): boolean => TypeHelper.geTypeName(x) === 'Boolean',
    isNumber: (x: any): boolean => TypeHelper.geTypeName(x) === 'Number',
    isString: (x: any): boolean => TypeHelper.geTypeName(x) === 'String',
});
