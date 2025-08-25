// You will need to install these packages. Run: npm install @google/generative-ai @sendgrid/mail
const { GoogleGenerativeAI } = require("@google/generative-ai");
const sgMail = require("@sendgrid/mail");

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro"});

// Initialize SendGrid Mail
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.handler = async function(event, context) {
  // Only allow POST requests
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { amount, name, email, message } = JSON.parse(event.body);

    // 1. Create a prompt for the Gemini API
    const prompt = `Generate a warm, personalized thank-you email to ${name} for their generous donation of ₹${amount}. They left this message: "${message}". Briefly mention how their contribution helps our cause. Keep it concise and heartfelt. Sign it as "The Team at Social Good Initiative".`;

    // 2. Call the Gemini API to generate the email text
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const emailText = response.text();

    // 3. Set up the email to be sent via SendGrid
    const msg = {
      to: email, // The donor's email address
      from: process.env.SENDER_EMAIL, // Your verified sender email
      subject: 'A Heartfelt Thank You For Your Donation!',
      text: emailText,
      // html: '<strong>(You can also send HTML content)</strong>',
    };

    // 4. Send the email using SendGrid
    await sgMail.send(msg);

    // Return a success message
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Email sent successfully!" }),
    };

  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to send email." }),
    };
  }
};