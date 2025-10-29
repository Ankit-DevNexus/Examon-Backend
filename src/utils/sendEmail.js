// utils/sendEmail.js
import nodemailer from 'nodemailer';

export const sendEmail = async (subject, message, recipients) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Website Updates" <${process.env.EMAIL_USER}>`,
      to: recipients,
      subject,
      html: message,
    };

    await transporter.sendMail(mailOptions);
    console.log('Emails sent successfully');
  } catch (error) {
    console.error('Email sending error:', error);
  }
};
