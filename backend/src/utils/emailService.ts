import nodemailer from 'nodemailer';

// Email configuration
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Verify connection configuration
export const verifyEmailConnection = async (): Promise<boolean> => {
  try {
    await transporter.verify();
    console.log('✅ Email service is ready to send messages');
    return true;
  } catch (error) {
    console.error('❌ Email service configuration error:', error);
    return false;
  }
};

// Send OTP email
export const sendOtpEmail = async (
  to: string,
  otp: string,
  name?: string
): Promise<boolean> => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || '"RTO Management System" <noreply@rto.com>',
      to,
      subject: 'Password Reset OTP - RTO Management System',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .otp-box { background: white; border: 2px dashed #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
            .otp-code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 8px; }
            .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 12px; margin: 20px 0; }
            .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Password Reset Request</h1>
            </div>
            <div class="content">
              <p>Hello${name ? ` ${name}` : ''},</p>
              <p>We received a request to reset your password for your RTO Management System account.</p>
              
              <div class="otp-box">
                <p style="margin: 0 0 10px 0; color: #666;">Your OTP Code:</p>
                <div class="otp-code">${otp}</div>
                <p style="margin: 10px 0 0 0; color: #666; font-size: 14px;">Valid for 10 minutes</p>
              </div>

              <p><strong>To reset your password:</strong></p>
              <ol>
                <li>Enter the OTP code above on the verification page</li>
                <li>Create your new password</li>
                <li>Sign in with your new credentials</li>
              </ol>

              <div class="warning">
                <strong>⚠️ Security Notice:</strong> If you didn't request this password reset, please ignore this email and ensure your account is secure. The OTP will expire in 10 minutes.
              </div>

              <p>Need help? Contact our support team.</p>
              
              <p>Best regards,<br><strong>RTO Management System Team</strong></p>
            </div>
            <div class="footer">
              <p>This is an automated message, please do not reply to this email.</p>
              <p>&copy; ${new Date().getFullYear()} RTO Management System. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Hello${name ? ` ${name}` : ''},

We received a request to reset your password for your RTO Management System account.

Your OTP Code: ${otp}
(Valid for 10 minutes)

To reset your password:
1. Enter the OTP code above on the verification page
2. Create your new password
3. Sign in with your new credentials

Security Notice: If you didn't request this password reset, please ignore this email. The OTP will expire in 10 minutes.

Best regards,
RTO Management System Team
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ OTP email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Error sending OTP email:', error);
    return false;
  }
};

// Send welcome email (for future use)
export const sendWelcomeEmail = async (
  to: string,
  name: string
): Promise<boolean> => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || '"RTO Management System" <noreply@rto.com>',
      to,
      subject: 'Welcome to RTO Management System',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Welcome to RTO Management System!</h1>
            </div>
            <div class="content">
              <p>Hello ${name},</p>
              <p>Thank you for registering with RTO Management System. Your account has been successfully created!</p>
              
              <p><strong>What you can do:</strong></p>
              <ul>
                <li>Apply for Driving License</li>
                <li>Register Vehicles</li>
                <li>Book RTO Appointments</li>
                <li>Pay Challans Online</li>
                <li>Track Application Status</li>
              </ul>

              <p>Get started by logging into your account and exploring our services.</p>
              
              <p>Best regards,<br><strong>RTO Management System Team</strong></p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} RTO Management System. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Welcome email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Error sending welcome email:', error);
    return false;
  }
};

// Send verification email
export const sendVerificationEmail = async (
  to: string,
  otp: string,
  name?: string
): Promise<boolean> => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || '"RTO Management System" <noreply@rto.com>',
      to,
      subject: 'Verify Your Email - RTO Management System',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .otp-box { background: white; border: 2px dashed #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
            .otp-code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 8px; }
            .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📧 Verify Email Address</h1>
            </div>
            <div class="content">
              <p>Hello${name ? ` ${name}` : ''},</p>
              <p>Thank you for signing up with RTO Management System. Please verify your email address to activate your account.</p>
              
              <div class="otp-box">
                <p style="margin: 0 0 10px 0; color: #666;">Your Verification Code:</p>
                <div class="otp-code">${otp}</div>
                <p style="margin: 10px 0 0 0; color: #666; font-size: 14px;">Valid for 10 minutes</p>
              </div>

              <p>If you didn't create an account, you can safely ignore this email.</p>
              
              <p>Best regards,<br><strong>RTO Management System Team</strong></p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} RTO Management System. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Verification email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Error sending verification email:', error);
    return false;
  }
};

// Send notification email
export const sendNotificationEmail = async (
  to: string,
  subject: string,
  message: string,
  name?: string
): Promise<boolean> => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || '"RTO Management System" <noreply@rto.com>',
      to,
      subject: `${subject} - RTO Management System`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #1fa2ff 0%, #12d8fa 100%); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>🔔 Notification</h2>
            </div>
            <div class="content">
              <p>Hello${name ? ` ${name}` : ''},</p>
              <div style="background: white; padding: 15px; border-radius: 5px; border-left: 4px solid #1fa2ff;">
                ${message}
              </div>
              <p>Please log in to your dashboard for more details.</p>
              
              <p>Best regards,<br><strong>RTO Management System Team</strong></p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} RTO Management System. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Notification email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Error sending notification email:', error);
    return false;
  }
};

export default { sendOtpEmail, sendWelcomeEmail, verifyEmailConnection, sendVerificationEmail, sendNotificationEmail };
