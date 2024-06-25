import nodemailer from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";

interface SendEmailType {
  to: string; // to whom we want to send the mail
  subject: string;
  text: string;
}

export const sendEmail = async ({ to, subject, text }: SendEmailType) => {
  const transportOptions: SMTPTransport.Options = {
    service: "gmail",
    secure: true,
    port: Number(process.env.GOOGLE_PORT),
    auth: {
      user: process.env.GOOGLE_USER,
      pass: process.env.GOOGLE_PASS,
    },
  };

  const transport = nodemailer.createTransport(transportOptions);

  await transport.sendMail({
    from: process.env.GOOGLE_USER,
    to,
    subject,
    text,
  });
};

// test it using postman
