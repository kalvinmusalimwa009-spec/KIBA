// services/emailService.js
const nodemailer = require('nodemailer');
const config = require('../config/env');
const logger = require('../config/logger');

class EmailService {
    constructor() {
        this.transporter = null;
        this.initialized = false;
        this.init();
    }

    /**
     * Initialize email transporter
     */
    init() {
        const { host, port, user, pass } = config.smtp;
        
        if (!user || !pass) {
            logger.warn('SMTP credentials not configured. Email sending disabled.');
            return;
        }
        
        this.transporter = nodemailer.createTransport({
            host,
            port,
            secure: port === 465,
            auth: { user, pass },
            tls: { rejectUnauthorized: false },
        });
        
        this.initialized = true;
        logger.info('Email service initialized');
    }

    /**
     * Send email
     */
    async sendEmail(to, subject, html, from = null) {
        if (!this.initialized) {
            logger.warn('Email service not initialized, skipping send');
            return { success: false, error: 'Email service not initialized' };
        }
        
        try {
            const mailOptions = {
                from: from || config.smtp.user || 'noreply@stmaryskibabii.ac.ke',
                to,
                subject,
                html,
            };
            
            const info = await this.transporter.sendMail(mailOptions);
            logger.info(`Email sent to ${to}: ${info.messageId}`);
            return { success: true, info };
            
        } catch (error) {
            logger.error('Email send error:', error);
            throw error;
        }
    }

    /**
     * Send contact notification to admin
     */
    async sendContactNotification(contact) {
        const subject = `New Contact Message from ${contact.name}`;
        const html = `
            <h2>New Contact Form Submission</h2>
            <p><strong>From:</strong> ${contact.name}</p>
            <p><strong>Email:</strong> ${contact.email}</p>
            <p><strong>Phone:</strong> ${contact.phone || 'Not provided'}</p>
            <p><strong>Inquiry Type:</strong> ${contact.inquiry || 'General'}</p>
            <p><strong>Message:</strong></p>
            <p>${contact.message}</p>
            <hr>
            <p><small>Sent from St. Mary's Kibabii School Website</small></p>
        `;
        
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@stmaryskibabii.ac.ke';
        return this.sendEmail(adminEmail, subject, html);
    }

    /**
     * Send welcome email to new alumni
     */
    async sendAlumniWelcome(alumni) {
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
            </ul>
            <p>Once a Kibabiian, Always a Kibabiian!</p>
            <hr>
            <p><small>St. Mary's Kibabii Boys National School - KIDA</small></p>
        `;
        
        return this.sendEmail(alumni.email, subject, html);
    }
}

module.exports = new EmailService();