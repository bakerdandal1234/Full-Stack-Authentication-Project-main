exports.sendError = (res, error, statusCode = 401) => {
    return res.status(statusCode).json({ error });
};

// Additional helper for common error scenarios
exports.handleValidationError = (res, message) => {
    return exports.sendError(res, message, 400);
};

exports.handleUnauthorized = (res, message) => {
    return exports.sendError(res, message, 401);
};

exports.handleNotFound = (res, message = 'Resource not found') => {
    return exports.sendError(res, message, 404);
};

exports.handleServerError = (res, error) => {
    console.error('Server Error:', error);
    return exports.sendError(res, 'Internal server error', 500);
};
