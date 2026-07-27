// services/contactService.js
const ContactRepository = require('../repositories/contactRepository');
const EmailService = require('./emailService');
const logger = require('../config/logger');
const { sanitizeString, isValidEmail } = require('../utils/helpers');

class ContactService {
    /**
     * Create new contact
     */
    async createContact(data, ipAddress = null) {
        try {
            // Validate data
            const validatedData = this.validateContactData(data);

            // Save to database
            const contact = await ContactRepository.create({
                ...validatedData,
                ip_address: ipAddress,
            });

            // Send notification email (async)
            this.sendNotification(validatedData).catch(err => {
                logger.warn('Email notification failed:', err.message);
            });

            logger.info(`Contact created: ${contact.id} from ${validatedData.email}`);
            return contact;

        } catch (error) {
            logger.error('ContactService.createContact error:', error);
            throw error;
        }
    }

    /**
     * Get all contacts
     */
    async getAllContacts(options = {}) {
        return ContactRepository.findAll(options);
    }

    /**
     * Get contact by ID
     */
    async getContactById(id) {
        const contact = await ContactRepository.findById(id);
        if (!contact) {
            throw new Error('Contact not found');
        }
        return contact;
    }

    /**
     * Delete contact
     */
    async deleteContact(id) {
        const result = await ContactRepository.delete(id);
        if (!result.deleted) {
            throw new Error('Contact not found');
        }
        return result;
    }

    /**
     * Search contacts
     */
    async searchContacts(term) {
        return ContactRepository.search(term);
    }

    /**
     * Get contact statistics
     */
    async getStats() {
        return ContactRepository.getStats();
    }

    /**
     * Validate contact data
     */
    validateContactData(data) {
        const { name, email, phone, inquiry, message } = data;

        if (!name || sanitizeString(name).length < 2) {
            throw new Error('Name must be at least 2 characters');
        }

        if (!email || !isValidEmail(email)) {
            throw new Error('Valid email address is required');
        }

        if (!message || sanitizeString(message).length < 10) {
            throw new Error('Message must be at least 10 characters');
        }

        return {
            name: sanitizeString(name),
            email: email.trim().toLowerCase(),
            phone: phone ? sanitizeString(phone) : null,
            inquiry: inquiry ? sanitizeString(inquiry) : 'General',
            message: sanitizeString(message),
        };
    }

    /**
     * Send notification email
     */
    async sendNotification(contact) {
        const subject = `New Contact Message from ${contact.name}`;
        const html = `
            <h2>New Contact Form Submission</h2>
            <p><strong>Name:</strong> ${contact.name}</p>
            <p><strong>Email:</strong> ${contact.email}</p>
            <p><strong>Phone:</strong> ${contact.phone || 'Not provided'}</p>
            <p><strong>Inquiry Type:</strong> ${contact.inquiry}</p>
            <p><strong>Message:</strong></p>
            <p>${contact.message}</p>
            <hr>
            <p><small>Sent from St. Mary's Kibabii School Website</small></p>
        `;

        await EmailService.sendEmail(
            process.env.ADMIN_EMAIL || 'admin@stmaryskibabii.ac.ke',
            subject,
            html
        );
    }
}

module.exports = new ContactService();