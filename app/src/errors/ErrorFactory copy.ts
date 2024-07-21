import * as Errors from './AppError';
import { HttpStatusCode } from './HttpStatusCode';

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
  }/*
  static createCustomError(statusCode: string, details?: string, error?: any): Errors.ErrorMsg {
      return new Errors[statusCode](details?, error?);
  }
      */
}

function createCustomError(res: Response, statusCode: string, details?: string, error?: any): Errors.ErrorMsg {
    return res.status(HttpStatusCode[statusCode]).json(new Errors[statusCode].setDetails(details));
}
