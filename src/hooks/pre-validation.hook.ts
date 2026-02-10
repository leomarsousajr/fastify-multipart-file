import { isValidFileField } from "../validators";
import { processFileField } from "../file-processor";
import {
  parseFieldValue,
  parseFieldPath,
  hasArrayNotation,
  setNestedValue,
} from "../parsers";
import { MultipartField, SchemaBody } from "../types";

export async function preValidationHook(request: any): Promise<void> {
  if (!request.isMultipart()) {
    return;
  }

  const schemaBody = request.routeOptions?.schema?.body as
    | SchemaBody
    | undefined;
  const properties = schemaBody?.properties;
  if (!properties) {
    return;
  }

  const body = (request.body || {}) as Record<string, MultipartField>;
  const processedBody: Record<string, unknown> = {};

  for (const [fieldName, field] of Object.entries(body)) {
    const property = properties[fieldName];

    if (isValidFileField(field as MultipartField, property)) {
      if (hasArrayNotation(fieldName)) {
        const path = parseFieldPath(fieldName);
        const value = processFileField(
          field as MultipartField,
          property,
          fieldName,
        );
        setNestedValue(processedBody, path, value);
      } else {
        processedBody[fieldName] = processFileField(
          field as MultipartField,
          property,
          fieldName,
        );
      }
      continue;
    }

    const typedField = field as MultipartField;
    if (typedField?.value !== undefined) {
      const parsedValue = property
        ? parseFieldValue(typedField.value, property)
        : typedField.value;

      if (hasArrayNotation(fieldName)) {
        const path = parseFieldPath(fieldName);
        setNestedValue(processedBody, path, parsedValue);
      } else {
        processedBody[fieldName] = parsedValue;
      }
    }
  }
  request.body = processedBody;
}
