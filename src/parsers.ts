import { JsonHelper } from "./utils/json.helper";
import { SchemaProperty, SerializedFile, ProcessedFile } from "./types";

export const parseFieldValue = (
  value: string,
  property?: SchemaProperty,
): unknown => {
  let inferredType = property?.type;

  if (!inferredType) {
    if (value === "true" || value === "false") {
      inferredType = "boolean";
    } else if (/^-?\d+$/.test(value)) {
      inferredType = "integer";
    } else if (/^-?\d+\.?\d*$/.test(value)) {
      inferredType = "number";
    } else if (value.startsWith("[") || value.startsWith("{")) {
      const parsed = JsonHelper.parse(value);
      if (parsed) {
        inferredType = "object";
      }
    }
  }

  if (!inferredType) {
    return value;
  }

  try {
    switch (inferredType) {
      case "number": {
        const parsed = Number(value);
        return isNaN(parsed) ? value : parsed;
      }
      case "boolean":
        return value === "true" || value === "1";
      case "object":
        return JsonHelper.parse(value) || value;
      case "integer": {
        const parsed = Number(value);
        return isNaN(parsed) ? value : parsed;
      }
      case "array":
        return JsonHelper.parse(value) || value;
      default:
        return value;
    }
  } catch {
    return value;
  }
};

export const reconstructFileBuffer = (
  serializedFile: SerializedFile,
): ProcessedFile => {
  const fileData = serializedFile.file;
  return {
    ...fileData,
    buffer: fileData?.buffer
      ? Buffer.from(fileData.buffer as any)
      : Buffer.from([]),
  };
};

export const parseFieldPath = (fieldName: string): string[] => {
  return fieldName
    .replace(/\[/g, ".")
    .replace(/\]/g, "")
    .split(".")
    .filter(Boolean);
};

export const hasArrayNotation = (fieldName: string): boolean => {
  return /\[\d+\]/.test(fieldName);
};

export const setNestedValue = (
  obj: Record<string, unknown>,
  path: string[],
  value: unknown,
): void => {
  let current: any = obj;

  for (let i = 0; i < path.length - 1; i++) {
    const key = path[i];
    const nextKey = path[i + 1];
    const isNextKeyNumeric = /^\d+$/.test(nextKey);

    if (!(key in current)) {
      current[key] = isNextKeyNumeric ? [] : {};
    }

    current = current[key];
  }

  const lastKey = path[path.length - 1];
  current[lastKey] = value;
};
