const nodemailer = require('nodemailer');

// Usaremos o Ethereal para criar credenciais de teste
const sendEmail = async (options) => {
  // Crie uma conta de teste no Ethereal (isso só acontece uma vez)
  let testAccount = await nodemailer.createTestAccount();

  const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: testAccount.user, // Usuário gerado pelo Ethereal
        pass: testAccount.pass, // Senha gerada pelo Ethereal
    },
  });

  const message = {
    from: '"Aesthete" <noreply@aesthete.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html: para versões em HTML do e-mail
  };

  const info = await transporter.sendMail(message);

  console.log('Message sent: %s', info.messageId);
  console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
};

module.exports = sendEmail;