import * as Errors from './AppError';
import { HttpStatusCode } from './HttpStatusCode';
import { Response } from 'express';

/**
 * Factory per la creazione di errori personalizzati.
 */
export class ErrorFactory {
    static getError(type: HttpStatusCode): Errors.ErrorMsg | null {
        switch (type) {
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
    static getError2(type: string): Errors.ErrorMsg | null {
        console.log(type);
        console.log(HttpStatusCode[type])
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
  
    static resBuild(res: Response, errorType: string, message: string) {
        console.log('\n\n\nres object:', res);
        const error = ErrorFactory.getError2(errorType);
        if (error) {
            error.setDetails(message);
            res.status(HttpStatusCode.errorType).json(error);
        }  else {
            res.status(HttpStatusCode.InternalServerError).json({
                message: 'Unknown error type',
                details: message
            });
        }
    }
}


/**
 * Funzione helper per inviare una risposta di errore.
 * @param res - Oggetto Response di Express.
 * @param errorType - Tipo di errore basato su HttpStatusCode.
 * @param message - Messaggio di dettaglio dell'errore.
 */
export function resBuild(res: Response, errorType: string, message: string) {
    console.log('\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\nres object:', res);
    const error = ErrorFactory.getError2(errorType);
    console.log('\n\nerror:', error);
    if (error) {
        error.setDetails(message);
        console.log('HttpStatusCode[errorType]', HttpStatusCode[errorType])
        return res.status(HttpStatusCode[errorType]).json(error);
    } else {
        return res.status(HttpStatusCode.InternalServerError).json({
            message: 'Unknown error type',
            details: message
        });
    }
}

