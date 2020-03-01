const nodemailer = require('nodemailer');

module.exports.sendEmail = async options => {
  // create transporter.
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  // define the email options.
  const mailOptions = {
    from: 'Kevin Mcgrady <kevinmcgrady47@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
  };
  // send the email.
  await transporter.sendMail(mailOptions);
};
