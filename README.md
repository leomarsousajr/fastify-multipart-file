# fastify-multipart-file

A powerful Fastify plugin for handling `multipart/form-data` requests with automatic type coercion, file validation, and nested object support.

## Features

- **Automatic Type Coercion**: Converts string values to appropriate types (number, boolean, object, array) based on JSON schema
- **File Validation**: Validates file size and MIME type based on schema definitions
- **Nested Object Support**: Handles complex nested structures using array notation (e.g., `items[0].name`)
- **File Processing**: Automatically processes and validates file uploads
- **Schema-Driven**: Uses Fastify's JSON schema validation for type inference
- **TypeScript Support**: Full TypeScript support with type definitions

## Installation

```bash
npm install fastify-multipart-file
```

**Note**: This package includes `@fastify/multipart` as a dependency and registers it automatically. No additional setup needed!

## Usage

### Basic Setup

```typescript
import Fastify from 'fastify';
import { register as multipartHandler } from 'fastify-multipart-file';

const fastify = Fastify();

// Register the multipart handler (includes @fastify/multipart automatically)
await fastify.register(multipartHandler);

await fastify.listen({ port: 3000 });
```

### Example Route with File Upload

```typescript
import S from 'fluent-json-schema';

fastify.post('/upload', {
  schema: {
    body: S.object()
      .prop('name', S.string().required())
      .prop('age', S.number())
      .prop('isActive', S.boolean())
      .prop('avatar', S.string().format('binary')
        .maxLength(5 * 1024 * 1024) // 5MB max
        .raw({ accept: ['image/jpeg', 'image/png', 'image/gif'] })
      )
  },
  handler: async (request, reply) => {
    const { name, age, isActive, avatar } = request.body;

    // 'name' is string
    // 'age' is number (auto-converted)
    // 'isActive' is boolean (auto-converted)
    // 'avatar' is File object with buffer

    console.log(avatar.buffer); // Buffer
    console.log(avatar.mimetype); // e.g., 'image/jpeg'
    console.log(avatar.size); // File size in bytes
    console.log(avatar.originalName); // Original filename

    return { success: true };
  }
});
```

### Nested Objects and Arrays

```typescript
fastify.post('/nested', {
  schema: {
    body: S.object()
      .prop('items[0].name', S.string())
      .prop('items[0].quantity', S.number())
      .prop('items[1].name', S.string())
      .prop('items[1].quantity', S.number())
      .prop('metadata.tags', S.array())
  },
  handler: async (request, reply) => {
    const { items, metadata } = request.body;

    // items is: [
    //   { name: '...', quantity: 123 },
    //   { name: '...', quantity: 456 }
    // ]
    // metadata is: { tags: [...] }

    return { success: true };
  }
});
```

## How It Works

The plugin adds two Fastify hooks:

1. **preValidation Hook**: Processes multipart fields before validation
   - Detects file uploads and validates them
   - Converts string values to appropriate types based on schema
   - Handles nested object notation

2. **preHandler Hook**: Reconstructs file buffers after validation
   - Restores file objects with proper Buffer instances
   - Merges file data back into the request body

## Schema Properties

### File Upload Schema

```typescript
S.string()
  .format('binary')
  .maxLength(5 * 1024 * 1024) // Maximum file size in bytes
  .raw({ accept: ['image/jpeg', 'image/png'] }) // Allowed MIME types
```

### Type Coercion Schema

The plugin automatically converts values based on the schema type:

- `S.number()` → Converts to number
- `S.integer()` → Converts to integer
- `S.boolean()` → Converts to boolean ('true', '1' → true)
- `S.object()` → Parses JSON string to object
- `S.array()` → Parses JSON string to array

If no schema is provided, the plugin attempts to infer the type from the value.

## API

### `register(fastify: FastifyInstance): Promise<void>`

Main plugin registration function.

### Exported Types

```typescript
import {
  // Types
  FileUpload,
  MultipartField,
  SchemaProperty,
  SchemaBody,
  SerializedFile,
  ProcessedFile,
  ValidationError,

  // Classes
  File,
  FileMapper,
  UnprocessedEntityError,

  // Helpers
  JsonHelper,
  UuidHelper,

  // Type Guards
  isValidationError
} from '@leomarsousajr/fastify-multipart-file';
```

### File Class

```typescript
class File {
  name?: string;           // Generated unique filename with extension
  mimetype?: string;       // MIME type (e.g., 'image/jpeg')
  encoding?: string;       // Encoding (e.g., '7bit')
  buffer: Buffer;          // File content as Buffer
  size: number;            // File size in bytes
  originalName?: string;   // Original filename from upload
}
```

### FileMapper

```typescript
class FileMapper {
  static from(uploadFile: FileUpload): File;
}
```

Converts a raw file upload to a processed File object with a unique name.

### Error Handling

The plugin throws `UnprocessedEntityError` (HTTP 422) when:
- File size exceeds `maxLength`
- File MIME type is not in the `accept` list

The error follows a standard validation error format:

```typescript
import { isValidationError, ValidationError } from 'fastify-multipart-file';

try {
  // Handle multipart request
} catch (error) {
  if (isValidationError(error)) {
    console.log(error.statusCode); // 422
    console.log(error.message); // 'Validation error'
    console.log(error.validation); // Array of { field, message }

    // Example output:
    // [
    //   {
    //     field: 'avatar',
    //     message: 'File size exceeds the maximum allowed size of 5242880 bytes.'
    //   }
    // ]
  }
}
```

**Error Response Format:**
```json
{
  "statusCode": 422,
  "message": "Validation error",
  "validation": [
    {
      "field": "avatar",
      "message": "File size exceeds the maximum allowed size of 5242880 bytes."
    }
  ]
}
```

## Advanced Usage

### Custom File Processing

```typescript
import { FileMapper, File } from 'fastify-multipart-file';

fastify.post('/custom', async (request, reply) {
  const { document } = request.body as { document: File };

  // Access file properties
  console.log(document.name);         // UUID-based filename
  console.log(document.originalName); // Original filename
  console.log(document.buffer);       // Buffer for processing
  console.log(document.size);         // Size in bytes
  console.log(document.mimetype);     // MIME type

  // Save to disk, upload to S3, etc.
  await saveToS3(document.buffer, document.name);

  return { fileId: document.name };
});
```

### Validation Helpers

```typescript
import {
  isValidFileField,
  validateFileSize,
  validateFileMimeType
} from 'fastify-multipart-file';

// Manually validate files if needed
const file = { /* File object */ };
validateFileSize(file, 1024 * 1024, 'avatar'); // Throws if > 1MB
validateFileMimeType(file, ['image/jpeg'], 'avatar'); // Throws if not JPEG
```

## Requirements

- Node.js >= 18.0.0
- Fastify >= 4.0.0 or >= 5.0.0
- @fastify/multipart (peer dependency)

## License

MIT

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## Support

For issues and questions, please open an issue on the [GitHub repository](https://github.com/leomarsousajr/fastify-multipart-file).
