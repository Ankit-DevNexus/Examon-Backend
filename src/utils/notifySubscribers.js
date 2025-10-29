// utils/notifySubscribers.js
import NewsletterSubscriberModel from '../models/NewsletterSubscriberModel.js';
import { sendEmail } from './sendEmail.js';

export const notifySubscribers = async (type, title, description, link) => {
  try {
    // Fetch all subscribers
    const subscribers = await NewsletterSubscriberModel.find({});
    console.log('subscribers', subscribers);

    if (subscribers.length === 0) return console.log('No subscribers to notify.');

    const emails = subscribers.map((sub) => sub.email);

    //  Create subject and message
    const subject = `New ${type} Added: ${title}`;
    const message = `
      <h2>New ${type} Published </h2>
      <p>${description}</p>
      <p>
        <a href="${link}" target="_blank">Click here to view</a>
      </p>
      <p>Thank you for subscribing to our newsletter!</p>
    `;

    // Send email
    await sendEmail(subject, message, emails);
    console.log(`Notification sent for new ${type}`);
  } catch (error) {
    console.error('Error notifying subscribers:', error);
  }
};

// utils/notifySubscribers.js
// import NewsletterSubscriber from "../models/NewsletterSubscriber.js";
// import { sendEmail } from "./sendEmail.js";

// export const notifySubscribers = async (type, title, description, link) => {
//   try {
//     // ✅ Step 1: Validate allowed content types
//     const allowedTypes = ["Course", "Quiz", "PYQ", "Blog", "Note"];
//     if (!allowedTypes.includes(type)) {
//       throw new Error(`Invalid content type: ${type}`);
//     }

//     // ✅ Step 2: Get all subscribers
//     const subscribers = await NewsletterSubscriber.find({});
//     if (subscribers.length === 0) {
//       console.log("No subscribers to notify.");
//       return;
//     }

//     const emails = subscribers.map((sub) => sub.email);

//     // ✅ Step 3: Build dynamic subject and message
//     const subject = `New ${type} Added: ${title}`;
//     const message = `
//       <h2>New ${type} Published 🎉</h2>
//       <p>${description}</p>
//       <p>
//         <a href="${link}" target="_blank">Click here to view</a>
//       </p>
//       <br>
//       <p>Thank you for subscribing to our newsletter!</p>
//     `;

//     // ✅ Step 4: Send notification
//     await sendEmail(subject, message, emails);
//     console.log(`Notification sent successfully for new ${type}`);
//   } catch (error) {
//     console.error("Error in notifySubscribers:", error.message);
//   }
// };
