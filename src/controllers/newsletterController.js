// controllers/newsletterController.js

import NewsletterSubscriberModel from '../models/NewsletterSubscriberModel.js';

export const subscribeNewsletter = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) return res.status(400).json({ msg: 'Email is required' });

    const existing = await NewsletterSubscriberModel.findOne({ email });
    if (existing) return res.status(400).json({ msg: 'Already subscribed' });

    await NewsletterSubscriberModel.create({ email });

    res.status(201).json({ msg: 'Subscribed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Server error' });
  }
};

export const getAllSubscriber = async (req, res) => {
  const allsubscriber = await NewsletterSubscriberModel.find();

  res.status(200).json({
    message: 'all subscribers',
    allsubscriber,
  });
};

export const deleteSubscriber = async (req, res) => {
  const allsubscriber = await NewsletterSubscriberModel.deleteMany();

  res.status(200).json({
    message: 'delete subscribers',
    allsubscriber,
  });
};
