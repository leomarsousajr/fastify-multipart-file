import { JsonHelper } from "../utils/json.helper";
import { reconstructFileBuffer } from "../parsers";
import { SerializedFile } from "../types";

export async function preHandlerHook(request: any): Promise<void> {
  if (!request.isMultipart()) {
    return;
  }

  const body = request.body as Record<string, unknown>;
  const filesRestored: Record<string, unknown> = {};

  for (const [fieldName, fieldValue] of Object.entries(body)) {
    if (!fieldValue) {
      continue;
    }

    // Handle array of serialized files
    if (Array.isArray(fieldValue)) {
      filesRestored[fieldName] = fieldValue.map((item) => {
        if (typeof item !== "string") return item;
        const parsed = JsonHelper.parse<SerializedFile>(item);
        if (parsed?.type === "file" && parsed?.file) {
          return reconstructFileBuffer(parsed);
        }
        return item;
      });
      continue;
    }

    // Handle single serialized file
    if (typeof fieldValue === "string") {
      const parsedField = JsonHelper.parse<SerializedFile>(fieldValue);
      if (parsedField?.type === "file" && parsedField?.file) {
        filesRestored[fieldName] = reconstructFileBuffer(parsedField);
      }
    }
  }

  request.body = { ...(body || {}), ...filesRestored };
}
