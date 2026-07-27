// controllers/admissionsController.js
const AdmissionsService = require('../services/admissionsService');
const { successResponse, errorResponse } = require('../utils/response');

class AdmissionsController {
    async submit(req, res) {
        try {
            const application = await AdmissionsService.submit(req.body);
            successResponse(res, 201, 'Application submitted successfully!', application);
        } catch (error) {
            errorResponse(res, 400, error.message);
        }
    }

    async getAll(req, res) {
        try {
            const { page = 1, limit = 50, status } = req.query;
            const options = { page, limit };
            if (status && status !== 'all') {
                options.where = 'WHERE status = ?';
                options.whereParams = [status];
            }
            const applications = await AdmissionsService.getAllApplications(options);
            successResponse(res, 200, 'Applications retrieved', applications);
        } catch (error) {
            errorResponse(res, 500, error.message);
        }
    }

    async getById(req, res) {
        try {
            const application = await AdmissionsService.getApplicationById(req.params.id);
            successResponse(res, 200, 'Application retrieved', application);
        } catch (error) {
            errorResponse(res, 404, error.message);
        }
    }

    async getStats(req, res) {
        try {
            const stats = await AdmissionsService.getStats();
            successResponse(res, 200, 'Statistics retrieved', stats);
        } catch (error) {
            errorResponse(res, 500, error.message);
        }
    }

    async updateStatus(req, res) {
        try {
            const result = await AdmissionsService.updateStatus(req.params.id, req.body.status);
            successResponse(res, 200, 'Status updated successfully', result);
        } catch (error) {
            errorResponse(res, 400, error.message);
        }
    }
}

module.exports = new AdmissionsController();