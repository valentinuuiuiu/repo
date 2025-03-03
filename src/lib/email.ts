import axios from 'axios';

// Email configuration interface
interface EmailConfig {
  from: string;
  to: string;
  subject: string;
  text: string;
  html?: string;
}

// Email service configuration
const EMAIL_SERVICE_URL = import.meta.env.VITE_EMAIL_SERVICE_URL || 'https://api.emailservice.com/send';
const EMAIL_API_KEY = import.meta.env.VITE_EMAIL_API_KEY;

/**
 * Send an email using a configured email service
 * @param to Recipient email address
 * @param subject Email subject
 * @param body Email body (text or HTML)
 * @param isHtml Whether the body is HTML (default: false)
 */
export async function sendEmail(
  to: string, 
  subject: string, 
  body: string, 
  isHtml: boolean = false
): Promise<void> {
  // Validate inputs
  if (!to || !subject || !body) {
    throw new Error('Missing required email parameters');
  }

  // Prepare email configuration
  const emailConfig: EmailConfig = {
    from: 'DropConnect Platform <noreply@dropconnect.com>',
    to,
    subject,
    text: isHtml ? undefined : body,
    html: isHtml ? body : undefined
  };

  try {
    // Send email via axios
    const response = await axios.post(EMAIL_SERVICE_URL, emailConfig, {
      headers: {
        'Authorization': `Bearer ${EMAIL_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    // Log successful email sending
    console.log('Email sent successfully:', {
      to,
      subject,
      responseStatus: response.status
    });
  } catch (error) {
    // Log and rethrow email sending errors
    console.error('Email sending failed:', error);
    throw new Error('Failed to send email');
  }
}

/**
 * Send a notification email to the admin
 * @param subject Notification subject
 * @param message Notification message
 */
export async function sendAdminNotification(
  subject: string, 
  message: string
): Promise<void> {
  const adminEmail = 'ionutbaltag3@gmail.com';
  
  try {
    await sendEmail(
      adminEmail, 
      `DropConnect Notification: ${subject}`, 
      `
        <html>
          <body>
            <h2>DropConnect Platform Notification</h2>
            <p>${message}</p>
            <small>Sent at: ${new Date().toISOString()}</small>
          </body>
        </html>
      `,
      true
    );
  } catch (error) {
    console.error('Failed to send admin notification:', error);
  }
}