export { };

declare global {
    interface Array<T> {
        ascSort(selector?: (item: T) => any): Array<T>;
        chunk(chunksize: number): Array<Array<T>>;
        clear(): Array<T>,
        contains(item: T): boolean;
        descSort(selector?: (item: T) => any): Array<T>;
        distinct(selector?: (item: T) => any): Array<T>;
        remove(item: T): boolean;
        removeAt(index: number): boolean;
        removeWhere(predicate: (x: T) => boolean): number;
        reset(items: Array<T>): Array<T>;
        skip(n: number): Array<T>;
        sum(selector?: (item: T, index: number) => number): number;
        take(n: number): Array<T>;
    }

}

Array.prototype.ascSort = function (selector) {
    return selector && selector instanceof Function
        ? this.sort((a, b) => { let vA = selector(a), vB = selector(b); return vA == vB ? 0 : (vA < vB ? -1 : 1); })
        : this.sort((a, b) => a == b ? 0 : (a < b ? -1 : 1));
}

Array.prototype.chunk = function (chunksize: number) {
    if (chunksize < 1 || chunksize >= this.length) return [this];

    let result = new Array(Math.ceil(this.length / chunksize));

    for (let i = 0, start = 0; i < result.length; start = ++i * chunksize)
        result[i] = this.slice(start, start + chunksize);

    return result;
}

Array.prototype.clear = function () {
    this.splice(0, this.length);
    return this;
}

Array.prototype.contains = function (item) {
    return this.some(x => x == item);
}

Array.prototype.descSort = function (selector) {
    return selector && selector instanceof Function
        ? this.sort((a, b) => { let vA = selector(a), vB = selector(b); return vA == vB ? 0 : (vA < vB ? 1 : -1); })
        : this.sort((a, b) => a == b ? 0 : (a < b ? 1 : -1));
}

Array.prototype.distinct = function (selector) {
    const self = this;
    return selector && selector instanceof Function
        ? this.filter((item, i) => { let val = selector(item); return self.indexOf(self.find(x => selector(x) == val)) == i; })
        : this.filter((item, i) => self.indexOf(item) === i);
}

Array.prototype.remove = function (item) {
    let i = this.indexOf(item);
    return i >= 0 && this.removeAt(i);
}

Array.prototype.removeAt = function (index: number) {
    return this.splice(index, 1).length === 1;
}

Array.prototype.removeWhere = function (predicate) {
    let i = 0, count = this.length;
    while (i < this.length) {
        if (predicate(this[i]))
            this.splice(i, 1);
        else
            i++;
    }

    return count - this.length;
}

Array.prototype.reset = function (items) {
    this.splice(0, this.length);
    this.push.apply(this, items);
    return this;
}

Array.prototype.skip = function (n: number) {
    if(n < 0) n = 0;
    return this.slice(n);
}

Array.prototype.sum = function (selector): number {
    let sum = 0;
    if (selector instanceof Function)
        this.map(selector).filter(x => !isNaN(x)).forEach(x => sum += x)
    else
        this.map(x => Number(x)).filter(x => !isNaN(x)).forEach(x => sum += x)

    return sum;
}

Array.prototype.take = function (n: number) {
    if(n < 0) n = 0;
    return this.slice(0, n);
}
