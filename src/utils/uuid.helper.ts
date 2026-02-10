import { randomUUID } from 'crypto';

export class UuidHelper {
  static uuidv4(): string {
    return randomUUID();
  }
}
