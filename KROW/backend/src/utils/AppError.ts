// Error de negocio con código HTTP explícito, para que el errorHandler
// sepa qué status devolver en vez de caer siempre en 500
export class AppError extends Error {
    status: number;

    constructor(message: string, status = 400) {
        super(message);
        this.status = status;
        Object.setPrototypeOf(this, AppError.prototype);
    }
}