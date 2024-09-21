import { ArgumentNullError, SyncRenderDelegate, AsyncRenderDelegate } from './types';

class MemoryCache<T> {
    constructor() {
        setInterval(this.clean.bind(this), 10_000);
    }

    private items: { [key: string]: { expireTime: number, val: T } } = {};

    put(info: { key: string, duration: number }, value: T): void {
        if (String.isEmpty(info?.key)) throw new ArgumentNullError('info.key');

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

    clean(): void {
        let now = Date.now();

        Object.keys(this.items)
            .filter(key => this.items[key].expireTime > 0 && this.items[key].expireTime < now)
            .forEach(key => delete this.items[key]);
    }
}

export class AsyncRenderCache extends MemoryCache<AsyncRenderDelegate> { }
export class SyncRenderCache extends MemoryCache<SyncRenderDelegate> { }