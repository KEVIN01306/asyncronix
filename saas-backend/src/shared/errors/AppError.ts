

class AppError extends Error {
    public code: string;
    public statusCode: number

    constructor(message: string, code: string, statusCode: number = 400) {
        super(message);
        this.code = code;
        this.statusCode = statusCode;
        Object.setPrototypeOf(this, AppError.prototype)
    }
}

export default AppError