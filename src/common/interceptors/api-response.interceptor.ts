/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../interfaces/api-response.interface';

@Injectable()
export class ApiResponseInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((data) => ({
        statusCode: context.switchToHttp().getResponse().statusCode,
        message: 'Success',
        data,
      })),
    );
  }
}
// Cet intercepteur standardise les réponses API en enveloppant les données dans une structure uniforme
// qui inclut le code de statut, un message et les données réelles. Cela facilite la gestion des réponses côté client.
// Pour l'utiliser, il suffit de l'ajouter comme intercepteur global dans le fichier main.ts
// ou de l'appliquer à des contrôleurs spécifiques selon les besoins.
