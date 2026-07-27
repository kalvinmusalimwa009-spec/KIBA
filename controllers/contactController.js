// controllers/contactController.js
const ContactService = require('../services/contactService');
const { successResponse, errorResponse } = require('../utils/response');
const { getClientIp } = require('../utils/helpers');
const logger = require('../config/logger');

class ContactController {
    async submitContact(req, res) {
        try {
            const ipAddress = getClientIp(req);
            const contact = await ContactService.createContact(req.body, ipAddress);
            successResponse(res, 201, 'Message sent successfully', contact);
        } catch (error) {
            errorResponse(res, 400, error.message);
        }
    }

    async getContacts(req, res) {
        try {
            const { page = 1, limit = 50, search } = req.query;
            let contacts;
            if (search) {
                contacts = await ContactService.searchContacts(search);
            } else {
                contacts = await ContactService.getAllContacts({ page, limit });
            }
            successResponse(res, 200, 'Contacts retrieved', contacts);
        } catch (error) {
            errorResponse(res, 500, error.message);
        }
    }

    async getContact(req, res) {
        try {
            const contact = await ContactService.getContactById(req.params.id);
            successResponse(res, 200, 'Contact retrieved', contact);
        } catch (error) {
            errorResponse(res, 404, error.message);
        }
    }

    async deleteContact(req, res) {
        try {
            await ContactService.deleteContact(req.params.id);
            successResponse(res, 200, 'Contact deleted successfully');
        } catch (error) {
            errorResponse(res, 404, error.message);
        }
    }

    async getStats(req, res) {
        try {
            const stats = await ContactService.getStats();
            successResponse(res, 200, 'Statistics retrieved', stats);
        } catch (error) {
            errorResponse(res, 500, error.message);
        }
    }
}

module.exports = new ContactController();