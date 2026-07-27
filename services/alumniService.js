// services/alumniService.js
const AlumniRepository = require('../repositories/alumniRepository');
const EmailService = require('./emailService');
const logger = require('../config/logger');
const { sanitizeString, isValidEmail } = require('../utils/helpers');

class AlumniService {
    /**
     * Register new alumni
     */
    async register(data) {
        try {
            const validatedData = this.validateAlumniData(data);

            // Check if already registered
            const existing = await AlumniRepository.findByEmail(validatedData.email);
            if (existing) {
                throw new Error('Email already registered. Please contact KIDA for assistance.');
            }

            // Save to database
            const alumni = await AlumniRepository.create(validatedData);

            // Send welcome email
            this.sendWelcomeEmail(validatedData).catch(err => {
                logger.warn('Welcome email failed:', err.message);
            });

            logger.info(`Alumni registered: ${alumni.id} - ${validatedData.name}`);
            return alumni;

        } catch (error) {
            logger.error('AlumniService.register error:', error);
            throw error;
        }
    }

    /**
     * Get all alumni
     */
    async getAllAlumni(options = {}) {
        return AlumniRepository.findAll(options);
    }

    /**
     * Get alumni by ID
     */
    async getAlumniById(id) {
        const alumni = await AlumniRepository.findById(id);
        if (!alumni) {
            throw new Error('Alumni not found');
        }
        return alumni;
    }

    /**
     * Get alumni statistics
     */
    async getStats() {
        return AlumniRepository.getStats();
    }

    /**
     * Validate alumni data
     */
    validateAlumniData(data) {
        const { name, email, phone, graduation_year, occupation, location } = data;

        if (!name || sanitizeString(name).length < 2) {
            throw new Error('Name is required and must be at least 2 characters');
        }

        if (!email || !isValidEmail(email)) {
            throw new Error('Valid email address is required');
        }

        if (graduation_year && (graduation_year < 1952 || graduation_year > new Date().getFullYear())) {
            throw new Error('Invalid graduation year');
        }

        return {
            name: sanitizeString(name),
            email: email.trim().toLowerCase(),
            phone: phone ? sanitizeString(phone) : null,
            graduation_year: graduation_year || null,
            occupation: occupation ? sanitizeString(occupation) : null,
            location: location ? sanitizeString(location) : null,
        };
    }

    /**
     * Send welcome email
     */
    async sendWelcomeEmail(alumni) {
        const subject = `Welcome to KIDA - Kibabiians Development Association`;
        const html = `
            <h2>Welcome to KIDA, ${alumni.name}! 🎓</h2>
            <p>Thank you for registering as a member of the Kibabiians Development Association.</p>
            <p><strong>Your Registration Details:</strong></p>
            <ul>
                <li><strong>Name:</strong> ${alumni.name}</li>
                <li><strong>Email:</strong> ${alumni.email}</li>
                <li><strong>Graduation Year:</strong> ${alumni.graduation_year || 'Not specified'}</li>
                <li><strong>Occupation:</strong> ${alumni.occupation || 'Not specified'}</li>
                <li><strong>Location:</strong> ${alumni.location || 'Not specified'}</li>
            </ul>
            <p>Once a Kibabiian, Always a Kibabiian!</p>
            <hr>
            <p><small>St. Mary's Kibabii Boys National School - KIDA</small></p>
        `;

        await EmailService.sendEmail(alumni.email, subject, html);
    }
}

module.exports = new AlumniService();