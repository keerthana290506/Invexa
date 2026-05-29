const nodemailer = require('nodemailer');
 
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};
 
const sendLowStockAlert = async (product) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.ALERT_EMAIL) {
      console.log('📧 Email not configured. Skipping email alert.');
      return false;
    }
 
    const transporter = createTransporter();
 
    const alertType =
      product.stockQuantity === 0 ? '🔴 OUT OF STOCK' : '⚠️ LOW STOCK';
 
    const mailOptions = {
      from: `"Inventory System" <${process.env.EMAIL_FROM}>`,
      to: process.env.ALERT_EMAIL,
      subject: `${alertType} Alert: ${product.name} (SKU: ${product.sku})`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: ${product.stockQuantity === 0 ? '#dc2626' : '#f59e0b'}; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">${alertType} Alert</h1>
          </div>
          <div style="background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px; font-weight: bold; color: #374151;">Product:</td>
                <td style="padding: 8px; color: #111827;">${product.name}</td>
              </tr>
              <tr style="background: #f3f4f6;">
                <td style="padding: 8px; font-weight: bold; color: #374151;">SKU:</td>
                <td style="padding: 8px; color: #111827;">${product.sku}</td>
              </tr>
              <tr>
                <td style="padding: 8px; font-weight: bold; color: #374151;">Category:</td>
                <td style="padding: 8px; color: #111827;">${product.category}</td>
              </tr>
              <tr style="background: #f3f4f6;">
                <td style="padding: 8px; font-weight: bold; color: #374151;">Current Stock:</td>
                <td style="padding: 8px; color: #dc2626; font-weight: bold;">${product.stockQuantity} ${product.unit}</td>
              </tr>
              <tr>
                <td style="padding: 8px; font-weight: bold; color: #374151;">Reorder Level:</td>
                <td style="padding: 8px; color: #111827;">${product.reorderLevel} ${product.unit}</td>
              </tr>
            </table>
            <div style="margin-top: 20px; padding: 15px; background: #fef3c7; border-radius: 6px; border-left: 4px solid #f59e0b;">
              <p style="margin: 0; color: #92400e;">
                <strong>Action Required:</strong> Please restock this product immediately to avoid stockouts.
              </p>
            </div>
            <p style="margin-top: 20px; color: #6b7280; font-size: 12px;">
              This is an automated alert from your Inventory Management System. 
              Sent at ${new Date().toLocaleString()}.
            </p>
          </div>
        </div>
      `,
    };
 
    await transporter.sendMail(mailOptions);
    console.log(`📧 Low stock email sent for: ${product.name}`);
    return true;
  } catch (error) {
    console.error('📧 Email send failed:', error.message);
    return false;
  }
};
 
const sendWelcomeEmail = async (user) => {
  try {
    if (!process.env.EMAIL_USER) return false;
 
    const transporter = createTransporter();
 
    await transporter.sendMail({
      from: `"Inventory System" <${process.env.EMAIL_FROM}>`,
      to: user.email,
      subject: 'Welcome to Inventory Management System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
          <div style="background: #4f46e5; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 22px;">Welcome, ${user.name}! 👋</h1>
          </div>
          <div style="background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;">
            <p>Your account has been created successfully.</p>
            <p><strong>Role:</strong> ${user.role.charAt(0).toUpperCase() + user.role.slice(1)}</p>
            <p>You can now log in to the Inventory Management System.</p>
          </div>
        </div>
      `,
    });
 
    return true;
  } catch (error) {
    console.error('📧 Welcome email failed:', error.message);
    return false;
  }
};
 
module.exports = { sendLowStockAlert, sendWelcomeEmail };