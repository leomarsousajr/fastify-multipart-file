import multipart from "@fastify/multipart";
import { preValidationHook } from "./hooks/pre-validation.hook";
import { preHandlerHook } from "./hooks/pre-handler.hook";

export const register = async (
  fastify: any,
  opts?: { limits?: { fileSize?: number } },
): Promise<void> => {
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
  fastify.addHook("preValidation", preValidationHook);
  fastify.addHook("preHandler", preHandlerHook);
};

// Export types and utilities
export * from "./types";
export * from "./file";
export * from "./file-mapper";
export * from "./validators";
export * from "./parsers";
export * from "./file-processor";
export * from "./errors/unprocessed-entity.error";
export * from "./utils/json.helper";
export * from "./utils/uuid.helper";
