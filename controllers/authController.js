// controllers/authController.js
const AuthService = require('../services/authService');
const { successResponse, errorResponse } = require('../utils/response');
const { getClientIp } = require('../utils/helpers');

class AuthController {
    async login(req, res) {
        try {
            const ipAddress = getClientIp(req);
            const result = await AuthService.login(req.body.username, req.body.password, ipAddress);
            successResponse(res, 200, 'Login successful', result);
        } catch (error) {
            errorResponse(res, 401, error.message);
        }
    }

    async logout(req, res) {
        try {
            const token = req.headers.authorization?.split(' ')[1];
            const ipAddress = getClientIp(req);
            await AuthService.logout(token, ipAddress);
            successResponse(res, 200, 'Logged out successfully');
        } catch (error) {
            errorResponse(res, 400, error.message);
        }
    }

    async verify(req, res) {
        try {
            const token = req.headers.authorization?.split(' ')[1];
            const result = await AuthService.verifyToken(token);
            successResponse(res, 200, 'Token valid', result);
        } catch (error) {
            errorResponse(res, 401, error.message);
        }
    }
}

module.exports = new AuthController();