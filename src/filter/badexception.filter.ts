import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from "@nestjs/common";
import { isArray } from 'class-validator';
import { Response } from "express";
import { ProductService } from 'src/product/product.service';

@Catch(HttpException)
export class FileValidationExceptionFilter implements ExceptionFilter {
    constructor(private readonly productService: ProductService) { }

    async catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();
        const status = exception.getStatus();

        if (status === 400) {
            const files = request['files'];
            if (files) {
                for (const file of Object.values(files)) {
                    console.log(typeof file);
                    if (Array.isArray(file)) {
                        for (const uploadedFile of file) {
                            await this.productService.deleteLocalFile(uploadedFile.path);
                        }
                    }
                }
            }
        }
        response.status(status).send({
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            message: exception.message,
        });
    }
}