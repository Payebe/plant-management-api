import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiResponse } from '../interfaces/api-response.interface';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.message
        : 'Internal server error';

    const errorResponse: ApiResponse<null> = {
      statusCode: status,
      message,
      error: exception instanceof Error ? exception.name : 'Error',
    };

    response.status(status).json(errorResponse);
  }
}
// Ce filtre global intercepte toutes les exceptions non gérées dans l'application.
// Il formate les réponses d'erreur dans une structure uniforme qui inclut le code de statut,
// un message et le type d'erreur. Cela facilite la gestion des erreurs côté client.
// Pour l'utiliser, il suffit de l'ajouter comme filtre global dans le fichier main.ts
// ou de l'appliquer à des contrôleurs spécifiques selon les besoins.
