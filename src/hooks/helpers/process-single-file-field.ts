import { isValidFile } from "../../validators";
import { processFileField } from "../../file-processor";
import { MultipartField, SchemaProperty } from "../../types";
import { isFileArraySchema } from "./is-file-array-schema";

export function processSingleFileField(
  field: MultipartField,
  property: SchemaProperty,
  fieldName: string,
): { value: string | string[]; handled: true } | { handled: false } {
  if (isFileArraySchema(property)) {
    return {
      value: [processFileField(field, property.items!, fieldName)],
      handled: true,
    };
  }

  if (isValidFile(property)) {
    return {
      value: processFileField(field, property, fieldName),
      handled: true,
    };
  }

  return { handled: false };
}
