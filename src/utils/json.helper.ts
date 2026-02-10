export class JsonHelper {
  static stringify<T>(value: T): string | null {
    if (value === null || value === undefined) {
      return null;
    }

    try {
      return JSON.stringify(value);
    } catch {
      return null;
    }
  }

  static parse<T>(value: string | null | undefined): T | null {
    if (value === null || value === undefined) {
      return null;
    }

    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  }
}
