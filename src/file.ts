export class File {
  name?: string;
  mimetype?: string;
  encoding?: string;
  buffer: Buffer;
  size: number;
  originalName?: string;

  constructor() {
    this.name = '';
    this.mimetype = '';
    this.encoding = '';
    this.buffer = Buffer.from([]);
    this.size = 0;
  }
}
