// controllers/newsletterController.js
const NewsletterService = require('../services/newsletterService');
const { successResponse, errorResponse } = require('../utils/response');

class NewsletterController {
    async subscribe(req, res) {
        try {
            const result = await NewsletterService.subscribe(req.body.email);
            successResponse(res, 200, result.message, result);
        } catch (error) {
            errorResponse(res, 400, error.message);
        }
    }

    async unsubscribe(req, res) {
        try {
            const result = await NewsletterService.unsubscribe(req.params.email);
            successResponse(res, 200, 'Unsubscribed successfully', result);
        } catch (error) {
            errorResponse(res, 404, error.message);
        }
    }

    async getAll(req, res) {
        try {
            const subscribers = await NewsletterService.getAllSubscribers();
            successResponse(res, 200, 'Subscribers retrieved', subscribers);
        } catch (error) {
            errorResponse(res, 500, error.message);
        }
    }
}

module.exports = new NewsletterController();