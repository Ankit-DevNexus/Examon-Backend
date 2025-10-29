import nodemailer from 'nodemailer';

export const ContactUsController = async (req, res) => {
  try {
    const { fname, lname, email, phone, message } = req.body;
    const AdminMail = process.env.ADMIN_MAIL; // admin who will be notified on any new mail. it won't send mail, will receive only.

    // configure mail transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: true,
      auth: {
        user: process.env.USER_MAIL, // sender
        pass: process.env.ADMIN_MAIL_PASS,
      },
    });

    //define email content for client
    const ClientMailOptions = {
      from: process.env.USER_MAIL,
      to: email, // Client's email
      subject: 'Thank You for Contacting Examon Courses',
      html: `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <h2 style="color: #007bff;">Thank You for Getting in Touch!</h2>
      <p>Dear ${fname} ${lname},</p>

      <p>We’ve received your message and truly appreciate you taking the time to reach out to us. 
      Our team will review your query and get back to you as soon as possible.</p>

      <p>Thank you for showing interest in <strong>Examon Courses</strong>. 
      We’re excited to help you in your learning journey!</p>

      <p style="margin-top: 20px;">
        Best regards,<br>
        <strong>The Examon Team</strong><br>
        <a href="https://examon-education.vercel.app/" style="color: #007bff; text-decoration: none;">https://examon-education.vercel.app</a>
      </p>
    </div>
  `,
    };

    // define email content for admin
    const AdminMailOptions = {
      from: process.env.USER_MAIL,
      to: AdminMail,
      subject: '📩 New Contact Inquiry - Examon Website',
      html: `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <p>Dear <strong>Examon Team</strong>,</p>

      <p>You’ve received a new inquiry through the <strong>Contact Us</strong> form on the website. Below are the details provided by the user:</p>

      <ul style="list-style: none; padding: 0;">
        <li><strong>Name:</strong> ${fname} ${lname}</li>
        <li><strong>Email:</strong> ${email}</li>
        <li><strong>Phone No.:</strong> ${phone}</li>
        <li><strong>Message:</strong> ${message}</li>
      </ul>

      <p>Please reach out to the client at your earliest convenience.</p>

      <p style="margin-top: 20px;">
        Best regards,<br>
        <strong>Examon Website</strong><br>
      </p>
    </div>
  `,
    };

    // Send mail to client and Devnexus
    await transporter.sendMail(ClientMailOptions);
    await transporter.sendMail(AdminMailOptions);

    res.json({ success: true, message: 'Sent Successfully' });
  } catch (error) {
    console.log('Email Error', error);
    res.json({ success: false, message: 'Error Sending Email' });
  }
};
