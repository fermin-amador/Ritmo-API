import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';

import type {
  Request,
  Response,
} from 'express';

@Catch()
export class HttpExceptionFilter
  implements ExceptionFilter
{
  private readonly logger = new Logger(
    HttpExceptionFilter.name,
  );

  catch(
    exception: unknown,
    host: ArgumentsHost,
  ) {
    const context =
      host.switchToHttp();

    const response =
      context.getResponse<Response>();

    const request =
      context.getRequest<Request>();

    let statusCode =
      HttpStatus.INTERNAL_SERVER_ERROR;

    let message: string | string[] =
      'Error interno del servidor';

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();

      const exceptionResponse =
        exception.getResponse();

      if (
        typeof exceptionResponse === 'string'
      ) {
        message = exceptionResponse;
      } else if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null &&
        'message' in exceptionResponse
      ) {
        const responseMessage =
          (
            exceptionResponse as {
              message?: string | string[];
            }
          ).message;

        if (responseMessage) {
          message = responseMessage;
        }
      }
    } else {
      if (exception instanceof Error) {
        this.logger.error(
          `${request.method} ${request.url} - ${exception.message}`,
          exception.stack,
        );
      } else {
        this.logger.error(
          `${request.method} ${request.url} - Error desconocido`,
        );
      }
    }

    response
      .status(statusCode)
      .json({
        statusCode,
        timestamp:
          new Date().toISOString(),
        path: request.url,
        message,
      });
  }
}