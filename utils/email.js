const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

module.exports = class Email {
  constructor(user, url){
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from =  `Asogba Ibrahim <${process.env.EMAIL_FROM}>`;
  }

  newTransport(){
    if((process.env.NODE_ENV).trim() === 'production'){
      // Sendgrid
      return nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: (process.env.SENDGRID_USERNAME).trim(),
          pass: (process.env.SENDGRID_PASSWORD).trim()
        }
      })
    }

    return nodemailer.createTransport({
      host: (process.env.EMAIL_HOST).trim(),
      port: (process.env.EMAIL_PORT).trim(),
      auth: {
          user: (process.env.EMAIL_USERNAME).trim(),
          pass: (process.env.EMAIL_PASSWORD).trim()
      }
  }) 
  }

  async send(template, subject) {
    // 1) Render HTML based on a pug template
    const html = pug.renderFile(`${__dirname}/../views/emails/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject
    });
    // 2) Define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.fromString(html)
  }

    // 3) Create a Transport and send email
    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome(){
    await this.send('welcome', 'Welcome to the Natours Family!!');
  }

  async sendPasswordReset(){
    await this.send('passwordReset', 'Your password token (valid for just 10 minutes.)')
  }
}
