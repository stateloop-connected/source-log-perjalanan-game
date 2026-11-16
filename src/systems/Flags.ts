/**
 * Penanda progres cerita ("sudah ngobrol dengan Siti", dst).
 * Disimpan ke localStorage supaya progres bertahan kalau tab ditutup.
 */
export class Flags {
  private set = new Set<string>();

  constructor(
    private readonly storageKey?: string,
    private readonly storage: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'> | undefined = globalThis.localStorage,
  ) {
    if (!storageKey || !storage) return;
    try {
      const raw = storage.getItem(storageKey);
      if (raw) for (const f of JSON.parse(raw) as string[]) this.set.add(f);
    } catch {
      // Data rusak atau storage diblokir: mulai dari awal saja.
    }
  }

  has(flag: string): boolean {
    return this.set.has(flag);
  }

  add(flag: string): void {
    if (this.set.has(flag)) return;
    this.set.add(flag);
    this.save();
  }

  reset(): void {
    this.set.clear();
    if (this.storageKey && this.storage) {
      try {
        this.storage.removeItem(this.storageKey);
      } catch {
        /* abaikan */
      }
    }
  }

  private save(): void {
    if (!this.storageKey || !this.storage) return;
    try {
      this.storage.setItem(this.storageKey, JSON.stringify([...this.set]));
    } catch {
      // Storage penuh atau mode privat: progres tetap jalan di memori.
    }
  }
}
