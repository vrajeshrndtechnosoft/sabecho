// lib/errorHandler.ts
import { constants } from '@/lib/constant';

export function errorResponse(error: Error, statusCode: number) {
  switch (statusCode) {
    case constants.VALIDATION_ERROR:
      return { title: 'Validation Failed', message: error.message, stackTrace: error.stack };
    case constants.NOT_FOUND:
      return { title: 'Not Found', message: error.message, stackTrace: error.stack };
    case constants.FORBIDDEN:
      return { title: 'Forbidden', message: error.message, stackTrace: error.stack };
    case constants.UNAUTHORIZED:
      return { title: 'Unauthorized', message: error.message, stackTrace: error.stack };
    case constants.SERVER_ERROR:
    default:
      return { title: 'Server Error', message: error.message, stackTrace: error.stack };
  }
}
