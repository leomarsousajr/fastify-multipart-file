import {
  parseFieldValue,
  parseFieldPath,
  hasArrayNotation,
  setNestedValue,
} from "../../parsers";
import { MultipartField, SchemaProperty } from "../../types";

export function processTextField(
  field: MultipartField,
  property: SchemaProperty | undefined,
  fieldName: string,
  processedBody: Record<string, unknown>,
): void {
  if (field.value === undefined) {
    return;
  }

  const parsedValue = property
    ? parseFieldValue(field.value, property)
    : field.value;

  if (hasArrayNotation(fieldName)) {
    const path = parseFieldPath(fieldName);
    setNestedValue(processedBody, path, parsedValue);
  } else {
    processedBody[fieldName] = parsedValue;
  }
}
