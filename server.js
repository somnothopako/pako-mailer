require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Nodemailer transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// GET /api/subscribers — fetch all signups
app.get('/api/subscribers', async (req, res) => {
  const { data, error } = await supabase
    .from('pako_signups')
    .select('id, first_name, surname, email, created_at')
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// POST /api/send — send newsletter
app.post('/api/send', async (req, res) => {
  const { subject, html, recipientIds } = req.body;

  if (!subject || !html) {
    return res.status(400).json({ error: 'Subject and body are required.' });
  }

  // Fetch recipients
  let query = supabase.from('pako_signups').select('first_name, surname, email');
  if (recipientIds && recipientIds.length > 0) {
    query = query.in('id', recipientIds);
  }

  const { data: recipients, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  if (!recipients || recipients.length === 0) {
    return res.status(400).json({ error: 'No recipients found.' });
  }

  const results = { sent: [], failed: [] };

  for (const recipient of recipients) {
    // Personalise the email
    const personalHtml = html
      .replace(/\{\{first_name\}\}/g, recipient.first_name)
      .replace(/\{\{surname\}\}/g, recipient.surname)
      .replace(/\{\{email\}\}/g, recipient.email);

    try {
      await transporter.sendMail({
        from: `"${process.env.FROM_NAME || 'Pako Newsletter'}" <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
        to: recipient.email,
        subject,
        html: personalHtml,
      });
      results.sent.push(recipient.email);
    } catch (err) {
      results.failed.push({ email: recipient.email, reason: err.message });
    }
  }

  res.json({
    message: `Sent ${results.sent.length} email(s). Failed: ${results.failed.length}.`,
    ...results,
  });
});

// POST /api/test-connection — verify SMTP
app.post('/api/test-connection', async (req, res) => {
  try {
    await transporter.verify();
    res.json({ ok: true, message: 'SMTP connection successful!' });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Pako Mailer running on http://localhost:${PORT}`));
