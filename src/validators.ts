import { UnprocessedEntityError } from "./errors/unprocessed-entity.error";
import { File } from "./file";
import { SchemaProperty } from "./types";

export const isValidFile = (item: SchemaProperty): boolean => {
  return Boolean(
    item.type === "string" &&
    item.format === "binary" &&
    item.typeFile &&
    item.maxLength &&
    item.accept,
  );
};

export const validateFileSize = (
  file: File,
  maxSize: number,
  fieldName: string,
): void => {
  if (file.size > maxSize) {
    const error = new UnprocessedEntityError([
      `File size exceeds the maximum allowed size of ${maxSize} bytes.`,
    ]);
    error.validation[0].field = fieldName;
    throw error;
  }
};

export const validateFileMimeType = (
  file: File,
  allowedTypes: string[],
  fieldName: string,
): void => {
  if (!file.mimetype || !allowedTypes.includes(file.mimetype)) {
    const error = new UnprocessedEntityError([
      `Invalid file type. Allowed types: ${allowedTypes.join(", ")}.`,
    ]);
    error.validation[0].field = fieldName;
    throw error;
  }
};
