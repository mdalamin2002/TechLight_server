const createError = require('http-errors');

const notFoundHandler = (req, res, next) => {
	return next(createError(404, 'route not found'));
};

// Central error handler
// Sends a consistent error response shape
// Attach details only in non-production environments
const errorHandler = (err, req, res, next) => {
	const status = err.status || 500;
	const response = {
		success: false,
		message: err.message || 'Internal Server Error',
	};
	if (process.env.NODE_ENV !== 'production' && err.stack) {
		response.stack = err.stack;
	}
	return res.status(status).send(response);
};

module.exports = { errorHandler, notFoundHandler };


