import { isValidFile } from "../../validators";
import { processFileField } from "../../file-processor";
import { MultipartField, SchemaProperty } from "../../types";
import { UnprocessedEntityError } from "../../errors/unprocessed-entity.error";
import { isFileArraySchema } from "./is-file-array-schema";

export function processArrayField(
  field: MultipartField[],
  property: SchemaProperty,
  fieldName: string,
): string[] {
  if (isFileArraySchema(property)) {
    return field.map((item) =>
      processFileField(item as MultipartField, property.items!, fieldName),
    );
  }

  if (isValidFile(property)) {
    const error = new UnprocessedEntityError([
      `Field "${fieldName}" expects a single file, not an array.`,
    ]);
    error.validation[0].field = fieldName;
    throw error;
  }

  return [];
}
