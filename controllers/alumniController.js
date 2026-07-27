// controllers/alumniController.js
const AlumniService = require('../services/alumniService');
const { successResponse, errorResponse } = require('../utils/response');

class AlumniController {
    /**
     * POST /api/v1/alumni
     * Register as alumni (KIDA member)
     */
    async register(req, res) {
        try {
            const alumni = await AlumniService.register(req.body);
            successResponse(res, 201, 'Successfully registered as KIDA member! Welcome home, Kibabiian!', alumni);
        } catch (error) {
            errorResponse(res, 400, error.message);
        }
    }

    /**
     * GET /api/v1/alumni
     * Get all alumni
     */
    async getAll(req, res) {
        try {
            const { page = 1, limit = 50 } = req.query;
            const alumni = await AlumniService.getAllAlumni({ page, limit });
            successResponse(res, 200, 'Alumni retrieved', alumni);
        } catch (error) {
            errorResponse(res, 500, error.message);
        }
    }

    /**
     * GET /api/v1/alumni/:id
     * Get alumni by ID
     */
    async getById(req, res) {
        try {
            const alumni = await AlumniService.getAlumniById(req.params.id);
            successResponse(res, 200, 'Alumni retrieved', alumni);
        } catch (error) {
            errorResponse(res, 404, error.message);
        }
    }

    /**
     * GET /api/v1/alumni/stats
     * Get alumni statistics
     */
    async getStats(req, res) {
        try {
            const stats = await AlumniService.getStats();
            successResponse(res, 200, 'Statistics retrieved', stats);
        } catch (error) {
            errorResponse(res, 500, error.message);
        }
    }
}

module.exports = new AlumniController();