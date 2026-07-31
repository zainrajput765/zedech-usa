import * as nodemailer from 'nodemailer';

const getTransporter = () => {
  // If credentials are placeholders or not configured, return null to print to console
  const host = process.env.EMAIL_HOST;
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!host || host.includes('placeholder') || !user || user.includes('placeholder')) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port: Number(process.env.EMAIL_PORT) || 2525,
    auth: {
      user,
      pass,
    },
  });
};

export const sendEmail = async (options: {
  email: string;
  subject: string;
  message: string;
  html?: string;
}) => {
  const transporter = getTransporter();
  const from = process.env.EMAIL_FROM || 'Zedech Store <noreply@zedech.com>';

  if (!transporter) {
    console.log('\n=================== MOCK EMAIL SENT ===================');
    console.log(`To:      ${options.email}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Message: ${options.message}`);
    if (options.html) {
      console.log(`HTML:    ${options.html}`);
    }
    console.log('=======================================================\n');
    return;
  }

  const mailOptions = {
    from,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
  };

  await transporter.sendMail(mailOptions);
};
