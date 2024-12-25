import { ArgumentNullException, SyncRenderDelegate, AsyncRenderDelegate } from '../types';
import { MiscHelper } from './misc-helper';

class MemoryCache<T> {
    constructor() {
        setInterval(this.flush.bind(this), 20_000);
    }

    private items: { [key: string]: { expireTime: number, val: T } } = {};

    put(info: { key: string, duration: number }, value: T): void {
        if (MiscHelper.isEmptyString(info?.key)) throw new ArgumentNullException('info.key');

        //if lifetime is less than 1, the value alive for always and never expires.
        delete this.items[info.key];
        this.items[info.key] = {
            expireTime: info.duration < 1 ? 0 : Date.now() + (info.duration * 1_000),
            val: value
        };
    }

    get(key: string): T | null {
        let item = this.items[key];

        if (item && item.expireTime > 0 && item.expireTime < Date.now())
            delete this.items[key];

        return item?.val;
    }

    purge(key: string): void {
        if (MiscHelper.isEmptyString(key)) return;
        delete this.items[key];
    }

    purgeAll(): void {
        Object.keys(this.items)
            .forEach(key => delete this.items[key]);
    }

    /**Removes all expired items from the cache. */
    flush(): void {
        let now = Date.now();

        Object.keys(this.items)
            .filter(key => this.items[key].expireTime > 0 && this.items[key].expireTime < now)
            .forEach(key => delete this.items[key]);
    }
}

export class AsyncRenderCache extends MemoryCache<AsyncRenderDelegate> { }
export class SyncRenderCache extends MemoryCache<SyncRenderDelegate> { }