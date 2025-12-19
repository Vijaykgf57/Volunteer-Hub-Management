// Email Service using Nodemailer
const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = async () => {
  // Check if real SMTP credentials are provided
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    console.log('📧 Using real SMTP credentials...');
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: process.env.EMAIL_PORT || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }
  
  // For development, create Ethereal test account
  try {
    console.log('📧 Creating Ethereal test account...');
    const testAccount = await nodemailer.createTestAccount();
    
    console.log('✅ Ethereal account created:');
    console.log('   User:', testAccount.user);
    console.log('   Pass:', testAccount.pass);
    
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
  } catch (error) {
    console.log('⚠️ Ethereal failed, using console logging instead');
    console.error('Error:', error.message);
    
    // Fallback: just log emails to console
    return {
      sendMail: async (mailOptions) => {
        console.log('\n📧 EMAIL WOULD BE SENT:');
        console.log('To:', mailOptions.to);
        console.log('Subject:', mailOptions.subject);
        console.log('Content: Email with HTML content');
        return { messageId: 'console-log-' + Date.now() };
      }
    };
  }
};

// Email Templates
const emailTemplates = {
  volunteerSignup: (volunteerName, eventTitle, roleName, eventDate, eventTime) => ({
    subject: `✅ Volunteer Signup Confirmation - ${eventTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 30px; border-radius: 10px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">🤝 Thank You for Volunteering!</h1>
        </div>
        
        <div style="background: #f8fafc; padding: 30px; border-radius: 10px; margin: 20px 0;">
          <h2 style="color: #1f2937; margin-bottom: 20px;">Hi ${volunteerName}! 👋</h2>
          
          <p style="font-size: 16px; line-height: 1.6; color: #374151;">
            You've successfully signed up as a <strong>${roleName}</strong> for our upcoming event:
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #6366f1; margin: 20px 0;">
            <h3 style="color: #6366f1; margin: 0 0 10px 0;">${eventTitle}</h3>
            <p style="margin: 5px 0; color: #6b7280;">
              📅 <strong>Date:</strong> ${new Date(eventDate).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
            <p style="margin: 5px 0; color: #6b7280;">
              🕐 <strong>Time:</strong> ${eventTime}
            </p>
            <p style="margin: 5px 0; color: #6b7280;">
              👤 <strong>Your Role:</strong> ${roleName}
            </p>
          </div>
          
          <div style="background: #ecfdf5; border: 1px solid #10b981; border-radius: 8px; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #065f46;">
              <strong>📋 What's Next?</strong><br>
              • We'll send you a reminder 24 hours before the event<br>
              • Check your email for any updates or changes<br>
              • Bring a positive attitude and ready to help! 🌟
            </p>
          </div>
          
          <p style="font-size: 16px; line-height: 1.6; color: #374151;">
            Thank you for making a difference in our community! If you have any questions, 
            feel free to reply to this email.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <p style="color: #6b7280; font-style: italic;">
              "Volunteers do not necessarily have the time; they just have the heart." ❤️
            </p>
          </div>
        </div>
        
        <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 14px;">
          <p>This email was sent by Volunteer Hub</p>
          <p>Making the world a better place, one volunteer at a time! 🌍</p>
        </div>
      </div>
    `
  }),

  adminNotification: (volunteerName, volunteerEmail, eventTitle, roleName) => ({
    subject: `🔔 New Volunteer Signup - ${eventTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #1f2937; color: white; padding: 20px; border-radius: 10px;">
          <h2 style="margin: 0;">🔔 New Volunteer Signup</h2>
        </div>
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 10px; margin: 20px 0;">
          <p><strong>Event:</strong> ${eventTitle}</p>
          <p><strong>Role:</strong> ${roleName}</p>
          <p><strong>Volunteer:</strong> ${volunteerName}</p>
          <p><strong>Email:</strong> ${volunteerEmail}</p>
          <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
        </div>
      </div>
    `
  })
};

// Send Email Function
async function sendEmail(to, template) {
  try {
    const transporter = await createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'Volunteer Hub <noreply@volunteerhub.com>',
      to: to,
      subject: template.subject,
      html: template.html
    };

    const info = await transporter.sendMail(mailOptions);
    
    // For Ethereal (test emails), show preview URL
    if (info.messageId && (info.messageId.includes('@ethereal.email') || !process.env.EMAIL_USER)) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        console.log('\n🎉 EMAIL SENT SUCCESSFULLY!');
        console.log('📧 To:', to);
        console.log('📧 Subject:', template.subject);
        console.log('🔗 Preview URL:', previewUrl);
        console.log('👆 Click the link above to see the actual email!\n');
      }
    } else {
      console.log('✅ Real email sent successfully to:', to);
    }
    
    return { success: true, messageId: info.messageId, previewUrl: nodemailer.getTestMessageUrl(info) };
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    return { success: false, error: error.message };
  }
}

// Specific email functions
async function sendVolunteerConfirmation(volunteerEmail, volunteerName, eventTitle, roleName, eventDate, eventTime) {
  const template = emailTemplates.volunteerSignup(volunteerName, eventTitle, roleName, eventDate, eventTime);
  return await sendEmail(volunteerEmail, template);
}

async function sendAdminNotification(volunteerName, volunteerEmail, eventTitle, roleName) {
  const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
  if (!adminEmail) {
    console.log('⚠️ No admin email configured, skipping admin notification');
    return { success: false, error: 'No admin email configured' };
  }
  
  const template = emailTemplates.adminNotification(volunteerName, volunteerEmail, eventTitle, roleName);
  return await sendEmail(adminEmail, template);
}

module.exports = {
  sendVolunteerConfirmation,
  sendAdminNotification,
  sendEmail,
  emailTemplates
};