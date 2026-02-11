import { isValidFile } from "../../validators";
import { SchemaProperty } from "../../types";

export function isFileArraySchema(property?: SchemaProperty): boolean {
  return Boolean(
    property?.type === "array" && property.items && isValidFile(property.items),
  );
}
