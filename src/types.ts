export interface FileUploadFile extends File {
  bytesRead: number;
}

export interface FileUpload {
  filename: string;
  mimetype: string;
  encoding: string;
  file: FileUploadFile;
  _buf: Buffer;
}

export interface MultipartField {
  type?: string;
  value?: string;
  mimetype?: string;
  encoding?: string;
  filename?: string;
  limit?: boolean;
  [key: string]: unknown;
}

export interface SchemaProperty {
  type?: string;
  format?: string;
  maxLength?: number;
  accept?: string[];
  default?: unknown;
  [key: string]: unknown;
}

export interface SchemaBody {
  properties?: Record<string, SchemaProperty>;
}

export interface SerializedFile {
  type: 'file';
  file: ProcessedFile;
}

export interface ProcessedFile {
  name?: string;
  mimetype?: string;
  encoding?: string;
  buffer: Buffer | { type: 'Buffer'; data: number[] };
  size: number;
  originalName?: string;
}
