import { HttpStatusCode } from './HttpStatusCode';

export interface ErrorMsg {
    getMsg(): string;
    getStatusCode(): HttpStatusCode;
    setDetails(details?: string): ErrorMsg;
    setErrorDetail(error?: any): ErrorMsg;
    toJSON(): { message: string, code: HttpStatusCode, details?: string, error?: any };
    message: string;
    code: HttpStatusCode;
    details?: string;
    error?: any;
}

class BaseError extends Error implements ErrorMsg {
    code: HttpStatusCode;
    details?: string;
    error?: any;

    constructor(message: string, code: HttpStatusCode, details?: string, error?: any) {
        super(message);
        this.code = code;
        this.details = details;
        this.error = error;
        Object.setPrototypeOf(this, new.target.prototype);
    }

    getMsg(): string {
        return this.message;
    }

    getStatusCode(): HttpStatusCode {
        return this.code;
    }

    setDetails(details?: string): ErrorMsg {
        this.details = details;
        return this;
    }

    setErrorDetail(error?: any): ErrorMsg {
        this.error = error;
        return this;
    }

    toJSON() {
        return {
            message: this.message,
            code: this.code,
            details: this.details,
            error: this.error
        };
    }
}

export class BadRequestError extends BaseError {
    constructor(details?: string, error?: any) {
        super("Bad request... Fix and retry...", HttpStatusCode.BadRequest, details, error);
    }
}

export class UnauthorizedError extends BaseError {
    constructor(details?: string, error?: any) {
        super("Unauthorized.", HttpStatusCode.Unauthorized, details, error);
    }
}

export class ForbiddenError extends BaseError {
    constructor(details?: string, error?: any) {
        super("Forbidden, No rights...", HttpStatusCode.Forbidden, details, error);
    }
}

export class NotFoundError extends BaseError {
    constructor(details?: string, error?: any) {
        super("Not Found, Resource not found.", HttpStatusCode.NotFound, details, error);
    }
}

export class MethodNotAllowedError extends BaseError {
    constructor(details?: string, error?: any) {
        super("Method not allowed.", HttpStatusCode.MethodNotAllowed, details, error);
    }
}

export class ConflictError extends BaseError {
    constructor(details?: string, error?: any) {
        super("Conflict.", HttpStatusCode.Conflict, details, error);
    }
}

export class NotImplementedError extends BaseError {
    constructor(details?: string, error?: any) {
        super("Not implemented.", HttpStatusCode.NotImplemented, details, error);
    }
}

export class BadGatewayError extends BaseError {
    constructor(details?: string, error?: any) {
        super("Bad gateway.", HttpStatusCode.BadGateway, details, error);
    }
}

export class ServiceUnavailableError extends BaseError {
    constructor(details?: string, error?: any) {
        super("Service unavailable.", HttpStatusCode.ServiceUnavailable, details, error);
    }
}

export class InternalServerError extends BaseError {
    constructor(details?: string, error?: any) {
        super("Internal server error.", HttpStatusCode.InternalServerError, details, error);
    }
}
