// services/admissionsService.js
const AdmissionsRepository = require('../repositories/admissionsRepository');
const EmailService = require('./emailService');
const logger = require('../config/logger');
const { sanitizeString, isValidEmail } = require('../utils/helpers');

class AdmissionsService {
    /**
     * Submit admission application
     */
    async submit(data) {
        try {
            const validatedData = this.validateAdmissionData(data);

            // Save to database
            const application = await AdmissionsRepository.create(validatedData);

            // Send confirmation email
            this.sendConfirmationEmail(validatedData).catch(err => {
                logger.warn('Confirmation email failed:', err.message);
            });

            logger.info(`Admission application: ${application.id} from ${validatedData.email}`);
            return application;

        } catch (error) {
            logger.error('AdmissionsService.submit error:', error);
            throw error;
        }
    }

    /**
     * Get all applications
     */
    async getAllApplications(options = {}) {
        return AdmissionsRepository.findAll(options);
    }

    /**
     * Get application by ID
     */
    async getApplicationById(id) {
        const application = await AdmissionsRepository.findById(id);
        if (!application) {
            throw new Error('Application not found');
        }
        return application;
    }

    /**
     * Update application status
     */
    async updateStatus(id, status) {
        const validStatuses = ['pending', 'reviewing', 'accepted', 'rejected', 'waitlist'];
        if (!validStatuses.includes(status)) {
            throw new Error('Invalid status. Must be: pending, reviewing, accepted, rejected, waitlist');
        }

        const result = await AdmissionsRepository.updateStatus(id, status);
        if (!result.updated) {
            throw new Error('Application not found');
        }

        logger.info(`Admission status updated: ${id} -> ${status}`);
        return result;
    }

    /**
     * Get statistics
     */
    async getStats() {
        return AdmissionsRepository.getStats();
    }

    /**
     * Validate admission data
     */
    validateAdmissionData(data) {
        const { full_name, email, phone, admission_type, previous_school, kcpe_score, message } = data;

        if (!full_name || sanitizeString(full_name).length < 2) {
            throw new Error('Full name is required');
        }

        if (!email || !isValidEmail(email)) {
            throw new Error('Valid email address is required');
        }

        if (!phone || sanitizeString(phone).length < 5) {
            throw new Error('Valid phone number is required');
        }

        if (!admission_type || !['Form One', 'Transfer', 'International'].includes(admission_type)) {
            throw new Error('Valid admission type is required');
        }

        return {
            full_name: sanitizeString(full_name),
            email: email.trim().toLowerCase(),
            phone: sanitizeString(phone),
            admission_type,
            previous_school: previous_school ? sanitizeString(previous_school) : null,
            kcpe_score: kcpe_score ? parseInt(kcpe_score) : null,
            message: message ? sanitizeString(message) : null,
        };
    }

    /**
     * Send confirmation email
     */
    async sendConfirmationEmail(application) {
        const subject = `Admission Application Received - St. Mary's Kibabii`;
        const html = `
            <h2>Application Received</h2>
            <p>Dear ${application.full_name},</p>
            <p>Thank you for applying to St. Mary's Kibabii Boys National School.</p>
            <p><strong>Application Details:</strong></p>
            <ul>
                <li><strong>Name:</strong> ${application.full_name}</li>
                <li><strong>Email:</strong> ${application.email}</li>
                <li><strong>Admission Type:</strong> ${application.admission_type}</li>
                <li><strong>Previous School:</strong> ${application.previous_school || 'N/A'}</li>
                <li><strong>KCPE Score:</strong> ${application.kcpe_score || 'N/A'}</li>
            </ul>
            <p>Our admissions office will review your application and contact you within 3 business days.</p>
            <hr>
            <p><small>St. Mary's Kibabii Boys National School</small></p>
        `;

        await EmailService.sendEmail(application.email, subject, html);
    }
}

module.exports = new AdmissionsService();