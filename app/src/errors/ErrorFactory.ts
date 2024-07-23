import * as Errors from './AppError';
import { HttpStatusCode } from './HttpStatusCode';
import { Response } from 'express';

/**
 * Factory per la creazione di errori personalizzati.
 */
export class ErrorFactory {
    static getError(type: string): Errors.ErrorMsg | null {
        switch (HttpStatusCode[type]) {
            case HttpStatusCode.BadRequest:
                return new Errors.BadRequestError();
            case HttpStatusCode.Unauthorized:
                return new Errors.UnauthorizedError();
            case HttpStatusCode.Forbidden:
                return new Errors.ForbiddenError();
            case HttpStatusCode.NotFound:
                return new Errors.NotFoundError();
            case HttpStatusCode.MethodNotAllowed:
                return new Errors.MethodNotAllowedError();
            case HttpStatusCode.Conflict:
                return new Errors.ConflictError();
            case HttpStatusCode.InternalServerError:
                return new Errors.InternalServerError();
            case HttpStatusCode.NotImplemented:
                return new Errors.NotImplementedError();
            case HttpStatusCode.BadGateway:
                return new Errors.BadGatewayError();
            case HttpStatusCode.ServiceUnavailable:
                return new Errors.ServiceUnavailableError();
            default:
                return null;
        }
    }
}

export function ISError(details: string, error: any): Errors.ErrorMsg {
    console.error(error);
    return new Errors.InternalServerError().setDetails(details).setErrorDetail(error);
}
