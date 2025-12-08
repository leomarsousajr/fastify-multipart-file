import multipart from '@fastify/multipart';
import { JsonHelper } from './helpers/json.helper';
import { isValidFileField } from './validators';
import { processFileField } from './file-processor';
import { parseFieldValue, reconstructFileBuffer, parseFieldPath, hasArrayNotation, setNestedValue } from './parsers';
import { MultipartField, SchemaBody, SerializedFile } from './types';

export const register = async (fastify: any, opts?: { limits?: { fileSize?: number } }): Promise<void> => {
  // Register @fastify/multipart first on the main instance
  // Default file size limit: 1000MB (can be overridden via opts.limits.fileSize)
  const defaultFileSize = 1000 * 1024 * 1024; // 10MB

  await fastify.register(multipart, {
    attachFieldsToBody: true,
    limits: {
      fileSize: opts?.limits?.fileSize ?? defaultFileSize,
    },
  });

  // Then add our custom hooks
  fastify.addHook('preValidation', async (request: any) => {
    if (!request.isMultipart()) {
      return;
    }

    const schemaBody = request.routeOptions?.schema?.body as SchemaBody | undefined;
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
          const value = processFileField(field as MultipartField, property, fieldName);
          setNestedValue(processedBody, path, value);
        } else {
          processedBody[fieldName] = processFileField(field as MultipartField, property, fieldName);
        }
        continue;
      }

      const typedField = field as MultipartField;
      if (typedField?.value !== undefined) {
        const parsedValue = property ? parseFieldValue(typedField.value, property) : typedField.value;

        if (hasArrayNotation(fieldName)) {
          const path = parseFieldPath(fieldName);
          setNestedValue(processedBody, path, parsedValue);
        } else {
          processedBody[fieldName] = parsedValue;
        }
      }
    }
    request.body = processedBody;
  });

  fastify.addHook('preHandler', async (request: any) => {
    if (!request.isMultipart()) {
      return;
    }

    const body = request.body as Record<string, string>;
    const filesRestored: Record<string, ReturnType<typeof reconstructFileBuffer>> = {};

    for (const [fieldName, fieldValue] of Object.entries(body)) {
      if (!fieldValue) {
        continue;
      }

      const parsedField = JsonHelper.parse<SerializedFile>(fieldValue);

      if (parsedField?.type === 'file' && parsedField?.file) {
        filesRestored[fieldName] = reconstructFileBuffer(parsedField);
      }
    }

    request.body = { ...(body || {}), ...filesRestored };
  });
};

// Export types and utilities
export * from './types';
export * from './file';
export * from './file-mapper';
export * from './validators';
export * from './parsers';
export * from './file-processor';
export * from './errors/unprocessed-entity.error';
export * from './helpers/json.helper';
export * from './helpers/uuid.helper';
