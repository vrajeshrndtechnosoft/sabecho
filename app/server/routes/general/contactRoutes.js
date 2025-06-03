const express = require('express');
const router = express.Router();
const ContactPage = require('../../models/crud/contactModel');

// GET FAQ
router.get('/faq', async (req, res) => {
  try {
    const contactPage = await ContactPage.findOne();
    if (!contactPage) {
      return res.status(404).json({ message: 'Contact page not found' });
    }
    res.json(contactPage.faqs);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET Contact Submissions
router.get('/contact', async (req, res) => {
  try {
    const contactPage = await ContactPage.findOne();
    if (!contactPage) {
      return res.status(404).json({ message: 'Contact page not found' });
    }
    res.json(contactPage.submissions);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST new FAQ
router.post('/faq', async (req, res) => {
  try {
    const { question, answer } = req.body;
    if (!question || !answer) {
      return res.status(400).json({ message: 'Question and answer are required' });
    }

    let contactPage = await ContactPage.findOne();
    if (!contactPage) {
      contactPage = new ContactPage();
    }

    contactPage.faqs.push(req.body);
    await contactPage.save();

    res.status(201).json({ message: 'FAQ added successfully', faq: contactPage.faqs[contactPage.faqs.length - 1] });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST new Contact Submission
router.post('/contact', async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ message: 'Name, email, and message are required' });
    }

    let contactPage = await ContactPage.findOne();
    if (!contactPage) {
      contactPage = new ContactPage();
    }

    contactPage.submissions.push({ name, email, phone, message });
    await contactPage.save();

    res.status(201).json({ message: 'Contact submission added successfully', submission: contactPage.submissions[contactPage.submissions.length - 1] });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;