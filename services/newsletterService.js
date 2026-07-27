// services/newsletterService.js
const NewsletterRepository = require('../repositories/newsletterRepository');
const logger = require('../config/logger');
const { isValidEmail } = require('../utils/helpers');

class NewsletterService {
    async subscribe(email) {
        if (!email || !isValidEmail(email)) {
            throw new Error('Valid email address is required');
        }
        const result = await NewsletterRepository.subscribe(email.trim().toLowerCase());
        logger.info(`Newsletter subscribe: ${email}`);
        return result;
    }

    async unsubscribe(email) {
        const result = await NewsletterRepository.unsubscribe(email);
        if (!result.unsubscribed) {
            throw new Error('Email not found');
        }
        logger.info(`Newsletter unsubscribe: ${email}`);
        return result;
    }

    async getAllSubscribers() {
        return NewsletterRepository.getAllEmails();
    }

    async isSubscribed(email) {
        return NewsletterRepository.isSubscribed(email);
    }
}

module.exports = new NewsletterService();