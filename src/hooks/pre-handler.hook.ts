import { JsonHelper } from "../utils/json.helper";
import { reconstructFileBuffer } from "../parsers";
import { SerializedFile } from "../types";

export async function preHandlerHook(request: any): Promise<void> {
  if (!request.isMultipart()) {
    return;
  }

  const body = request.body as Record<string, string>;
  const filesRestored: Record<
    string,
    ReturnType<typeof reconstructFileBuffer>
  > = {};

  for (const [fieldName, fieldValue] of Object.entries(body)) {
    if (!fieldValue) {
      continue;
    }

    const parsedField = JsonHelper.parse<SerializedFile>(fieldValue);

    if (parsedField?.type === "file" && parsedField?.file) {
      filesRestored[fieldName] = reconstructFileBuffer(parsedField);
    }
  }

  request.body = { ...(body || {}), ...filesRestored };
}
