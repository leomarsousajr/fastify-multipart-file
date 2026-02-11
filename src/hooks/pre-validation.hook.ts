import { MultipartField, SchemaBody } from "../types";
import { processArrayField } from "./helpers/process-array-field";
import { processSingleFileField } from "./helpers/process-single-file-field";
import { processTextField } from "./helpers/process-text-field";

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

  const body = (request.body || {}) as Record<
    string,
    MultipartField | MultipartField[]
  >;
  const processedBody: Record<string, unknown> = {};

  for (const [fieldName, field] of Object.entries(body)) {
    const property = properties[fieldName];

    if (Array.isArray(field)) {
      processedBody[fieldName] = processArrayField(field, property, fieldName);
      continue;
    }

    if (field?.type === "file" && property) {
      const result = processSingleFileField(field, property, fieldName);
      if (result.handled) {
        processedBody[fieldName] = result.value;
        continue;
      }
    }

    processTextField(field as MultipartField, property, fieldName, processedBody);
  }

  request.body = processedBody;
}
