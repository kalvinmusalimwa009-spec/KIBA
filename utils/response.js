// utils/response.js
/**
 * Standard API response formatter
 */

const successResponse = (res, statusCode = 200, message = 'Success', data = null, meta = null) => {
    const response = {
        success: true,
        message,
    };
    
    if (data !== null) {
        response.data = data;
    }
    
    if (meta !== null) {
        response.meta = meta;
    }
    
    return res.status(statusCode).json(response);
};

const errorResponse = (res, statusCode = 500, message = 'Something went wrong', errors = null) => {
    const response = {
        success: false,
        message,
    };
    
    if (errors !== null) {
        response.errors = errors;
    }
    
    return res.status(statusCode).json(response);
};

const paginatedResponse = (res, data, page, limit, total) => {
    const totalPages = Math.ceil(total / limit);
    const currentPage = parseInt(page, 10);
    
    return res.status(200).json({
        success: true,
        data,
        pagination: {
            page: currentPage,
            limit: parseInt(limit, 10),
            total,
            totalPages,
            hasNext: currentPage < totalPages,
            hasPrev: currentPage > 1,
        },
    });
};

module.exports = {
    successResponse,
    errorResponse,
    paginatedResponse,
};