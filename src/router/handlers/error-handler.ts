import { createErrorHandler } from '../modules.ts';

export const errorHandler = createErrorHandler({
    contentType: '*',
    action(ex, { res }) {
        res.setHeader('Content-Type', 'application/json');
        const error = {
            statusCode: ex.statusCode,
            message: ex.message,
            cause: ex.cause,
        };
        return { error };
    },
});
