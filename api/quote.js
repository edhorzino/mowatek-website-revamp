import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email, phone, company, message } = req.body;

    // Send email notification to info@mowatek.com
    const data = await resend.emails.send({
      from: 'Mowatek Quotes <enquiries@quotes.mowatek.com>',
      to: ['info@mowatek.com'],
      replyTo: email,
      subject: `New Quote Request from ${name}`,
      html: `
        <h2>New Quote Request Received</h2>
        <p><strong>Full Name:</strong> ${name || 'N/A'}</p>
        <p><strong>Email Address:</strong> ${email || 'N/A'}</p>
        <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
        <p><strong>Company:</strong> ${company || 'N/A'}</p>
        <hr />
        <h3>Project Details / Message:</h3>
        <p>${message ? message.replace(/\n/g, '<br>') : 'No details provided.'}</p>
      `,
    });

    return res.status(200).json({ success: true, id: data.id });
  } catch (error) {
    console.error('Email sending error:', error);
    return res.status(500).json({ error: 'Failed to send message.' });
  }
}