import { Request, NextFunction, Response } from "express";

class HttpException extends Error {
    status: number;
    message: string;
    constructor(status: number, message: string) {
        super(message);
        this.status = status;
        this.message = message;
    }
}

function errorMiddleware(err: HttpException, req: Request, res: Response, next: NextFunction) {
    const status = err.status || 500;
    const msg = err.message || 'Someting went wrong!';
    res.status(status).send({ status, msg })
}


export { HttpException, errorMiddleware };