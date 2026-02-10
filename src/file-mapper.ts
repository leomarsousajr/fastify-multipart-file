import { File } from "./file";
import { FileUpload } from "./types";
import path from "node:path";
import { UuidHelper } from "./utils/uuid.helper";

export class FileMapper {
  static from(uploadFile: FileUpload): File {
    const name = UuidHelper.uuidv4();
    const extension = path.extname(uploadFile.filename);
    const file = new File();
    file.originalName = uploadFile.filename;
    file.name = `${name}${extension}`;
    file.encoding = uploadFile.encoding;
    file.mimetype = uploadFile.mimetype;
    file.size = uploadFile.file.bytesRead || 0;
    file.buffer = uploadFile._buf;

    return file;
  }
}
