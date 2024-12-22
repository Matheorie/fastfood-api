const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

module.exports = {
  sendConfirmationEmail: async (to, commande) => {
    const mailOptions = {
      from: 'no-reply@fastfood.com',
      to,
      subject: 'Confirmation de votre commande',
      text: `Bonjour,\n\nVotre commande n°${commande.id} a bien été enregistrée.\nTotal: ${commande.prixTotal}€\nMerci de votre confiance.\n\nL'équipe FastFood`
    };

    await transporter.sendMail(mailOptions);
  }
};