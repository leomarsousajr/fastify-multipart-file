# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Fastify plugin (`fastify-multipart-file`) for handling multipart/form-data with file validation, type coercion, and nested object support. Wraps `@fastify/multipart` and adds preValidation/preHandler hooks for automatic file processing. Supports Fastify v4 and v5.

## Build Commands

- **Build:** `npm run build` (runs `npx tsc`)
- **Dev/watch:** `npm run dev` (runs `npx tsc --watch`)
- **No test or lint scripts are configured.**

## Architecture

The plugin registers via a default export function `register(fastify, opts)` in `src/index.ts`. It installs two Fastify lifecycle hooks:

1. **preValidation hook** — processes raw multipart fields: detects file uploads, validates file size/MIME type against schema (`maxLength`, `accept`), performs type coercion on string values, and handles nested object notation (`items[0].name`). Files are JSON-serialized (buffer → `{type: 'Buffer', data: number[]}`).

2. **preHandler hook** — reconstructs file Buffers from serialized form, merges file objects back into `request.body`.

### Module Responsibilities

- **`types.ts`** — All TypeScript interfaces (`FileUpload`, `MultipartField`, `SchemaProperty`, `SchemaBody`, `SerializedFile`, `ProcessedFile`)
- **`file.ts`** — `File` class (name, mimetype, encoding, buffer, size, originalName)
- **`file-mapper.ts`** — `FileMapper` converts raw `FileUpload` to `File` with UUID-based filename
- **`validators.ts`** — `validateFileSize()`, `validateFileMimeType()`, `isValidFileField()`
- **`file-processor.ts`** — `processFileField()` orchestrates mapping + validation, returns serialized file
- **`parsers.ts`** — Type coercion (`parseFieldValue`), nested object construction (`parseFieldPath`, `setNestedValue`, `hasArrayNotation`), buffer reconstruction (`reconstructFileBuffer`)
- **`errors/unprocessed-entity.error.ts`** — `UnprocessedEntityError` (HTTP 422) with validation array and `isValidationError()` type guard
- **`helpers/`** — `JsonHelper` (safe parse/stringify), `UuidHelper` (crypto.randomUUID wrapper)
- **`fastify.d.ts`** — Module augmentation adding `isMultipart()` to `FastifyRequest`

### Key Design Patterns

- All public types and classes are re-exported from `src/index.ts`
- File upload flow: raw multipart → validate → serialize to JSON → (Fastify validation runs) → deserialize buffer → final File objects in handler
- Type coercion auto-detects when no schema is provided (e.g., `'true'` → boolean, numeric strings → number)
- Nested objects use array bracket notation parsed into path arrays

## TypeScript

- Strict mode enabled with `noUnusedLocals`, `noUnusedParameters`, `noImplicitReturns`, `noFallthroughCasesInSwitch`
- Target: ES2022, Module: CommonJS
- Output: `dist/` with declarations and source maps
