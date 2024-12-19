



  const express = require('express');
  const bodyParser = require('body-parser');
  const nodemailer = require('nodemailer');
  const crypto = require('crypto');
  const path = require('path');
  
  const app = express();
  const PORT = 3000;
  
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(express.static('public'));
  app.use(bodyParser.json());
  
  const users = {};
  
  const transporter = nodemailer.createTransport({
    host: 'smtp.mailersend.net',
    port: 587,
    secure: false, // true para 465, false para outras portas
    auth: {
      user: 'MS_rYz8l6@trial-pq3enl6oyz7l2vwr.mlsender.net', 
      pass: 'GzE4rXgE4gDN7mhL'
    }
  });
  
  async function enviarEmail(destinatario, assunto, conteudo) {
    try {
      await transporter.sendMail({
        from: '"Potion Project" MS_rYz8l6@trial-pq3enl6oyz7l2vwr.mlsender.net',
        to: destinatario,
        subject: assunto,
        html: conteudo,
      });
    } catch (error) {
      console.error('Erro ao enviar e-mail:', error);
    }
  }
  
  app.post('/create-account', (req, res) => {
    const { name, email, password } = req.body;
  
    if (!name || !email || !password) {
      return res.status(400).send('Nome, e-mail e senha são obrigatórios.');
    }
  
    if (users[email]) {
      return res.status(400).send('E-mail já registrado.');
    }
  
    const confirmationCode = crypto.randomBytes(3).toString('hex');
    users[email] = { name, password, confirmationCode, confirmed: false };
  
    const emailContent = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f9f9f9;
          margin: 0;
          padding: 0;
          line-height: 1.6;
          color: #333;
        }
        .email-container {
          max-width: 600px;
          margin: 20px auto;
          background: #ffffff;
          border: 1px solid #ddd;
          border-radius: 8px;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }
        .header {
          background-color: #4a90e2;
          color: white;
          text-align: center;
          padding: 20px 0;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
        }
        .content {
          padding: 20px;
          text-align: center;
        }
        .confirmation-code {
          font-size: 24px;
          font-weight: bold;
          color: #4a90e2;
          background-color: #f4f4f9;
          padding: 15px;
          border-radius: 5px;
          display: inline-block;
          margin: 20px 0;
        }
        .footer {
          background-color: #f4f4f9;
          text-align: center;
          padding: 10px;
          font-size: 14px;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <h1>Bem-vindo ao Potion Project!</h1>
        </div>
        <div class="content">
          <p>Seu código de confirmação é:</p>
          <div class="confirmation-code">${confirmationCode}</div>
        </div>
        <div class="footer">
          <p>© 2024 Potion Project. Todos os direitos reservados.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  
    enviarEmail(email, 'Confirme sua conta no Potion Project', emailContent);
    res.redirect('confirm.html');
  });
  
  app.post('/confirm-account', (req, res) => {
    const { email, confirmationCode } = req.body;
  
    if (!email || !confirmationCode) {
      return res.status(400).send('E-mail e código de confirmação são obrigatórios.');
    }
  
    const user = users[email];
  
    if (!user) {
      return res.status(404).send('E-mail não encontrado.');
    }
  
    if (user.confirmationCode !== confirmationCode) {
      return res.status(400).send('Código de confirmação inválido.');
    }
  
    user.confirmed = true;

    const emailContent = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: 'Arial', sans-serif;
          background-color: #f9f9f9;
          margin: 0;
          padding: 0;
          color: #333;
        }
        .email-container {
          max-width: 600px;
          margin: 20px auto;
          background-color: #ffffff;
          border: 1px solid #ddd;
          border-radius: 8px;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }
        .header {
          background-color: #4a90e2;
          color: #fff;
          text-align: center;
          padding: 20px 0;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
        }
        .content {
          padding: 20px;
          text-align: center;
        }
        .content p {
          font-size: 16px;
          margin: 10px 0;
        }
        .welcome-message {
          font-size: 18px;
          color: #4a90e2;
          font-weight: bold;
          margin: 20px 0;
        }
        .footer {
          background-color: #f4f4f9;
          text-align: center;
          padding: 15px;
          font-size: 14px;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <h1>Bem-vindo ao Potion Project!</h1>
        </div>
        <div class="content">
          <p>Olá, <strong>${user.name}</strong>!</p>
          <p class="welcome-message">Sua conta foi confirmada com sucesso.</p>
          <p>Estamos muito felizes em tê-lo conosco!</p>
          <p>Explore tudo o que o Potion Project tem a oferecer. Caso tenha dúvidas, estamos aqui para ajudar.</p>
        </div>
        <div class="footer">
          <p>© 2024 Potion Project. Todos os direitos reservados.</p>
        </div>
      </div>
    </body>
    </html>
  `;

    enviarEmail(email, 'Bem-vindo ao Potion Project!', emailContent);




enviarEmail(email, 'Bem-vindo ao Potion Project!', emailContent);

    res.redirect('/welcome.html');
  });
  
  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
  });
  
  app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
  });
  