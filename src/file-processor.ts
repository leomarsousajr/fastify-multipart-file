import { FileMapper } from './file-mapper';
import { JsonHelper } from './helpers/json.helper';
import { validateFileSize, validateFileMimeType } from './validators';
import { MultipartField, SchemaProperty, FileUpload } from './types';

export const processFileField = (field: MultipartField, property: SchemaProperty, fieldName: string): string => {
  const file = FileMapper.from(field as unknown as FileUpload);
  if (property.maxLength) {
    validateFileSize(file, property.maxLength, fieldName);
  }

  if (property.accept) {
    validateFileMimeType(file, property.accept, fieldName);
  }

  return JsonHelper.stringify({ type: 'file', file }) || '';
};
