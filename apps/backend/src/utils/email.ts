import nodemailer from 'nodemailer';
import { env } from '../config/env';

// 1. Define the options interface
interface ISendEmailOptions {
    to: string;
    subject: string;
    text: string;
    html?: string;
}

// 2. Configure the Transporter
// It's highly recommended to store these in your .env file
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: env.emailUser, // e.g., 'autohub.app@gmail.com'
        pass: env.emailAppPassword, // This is an APP PASSWORD, not your normal login password!
    },
});

// 3. The reusable function
export const sendEmail = async ({ to, subject, text, html }: ISendEmailOptions): Promise<boolean> => {
    try {
        const mailOptions = {
            from: `"Auto Hub" <${env.emailUser}>`, // Looks professional: "Auto Hub <autohub@gmail...>"
            to,
            subject,
            text,
            html: html || text, // Fallback to plain text if no HTML is provided
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`Email successfully sent to ${to} (Message ID: ${info.messageId})`);
        return true;
    } catch (error) {
        console.error('Email sending failed:', error);
        return false;
    }
};