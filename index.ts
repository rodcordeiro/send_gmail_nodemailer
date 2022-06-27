// https://dev.to/chandrapantachhetri/sending-emails-securely-using-node-js-nodemailer-smtp-gmail-and-oauth2-g3a
import { config as env } from 'dotenv';
env();

import nodemailer from "nodemailer";
import { google } from "googleapis";
import { Options } from "nodemailer/lib/mailer";

const OAuth2 = google.auth.OAuth2;
const oauth2Client = new OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  "https://developers.google.com/oauthplayground"
);

oauth2Client.setCredentials({
  refresh_token: process.env.REFRESH_TOKEN,
});

const createTransporter = async () => {
  const oauth2Client = new OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    "https://developers.google.com/oauthplayground"
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.REFRESH_TOKEN,
  });

  const accessToken = await new Promise((resolve, reject) => {
    oauth2Client.getAccessToken((err, token) => {
      if (err) {
        reject(err);
      }
      resolve(token);
    });
  });

  const transporter = nodemailer.createTransport({
    // @ts-ignore
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: process.env.EMAIL,
      accessToken,
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      refreshToken: process.env.REFRESH_TOKEN,
    },
  });

  return transporter;
};

const mailOptions = {
  from: "noreply@gmail.com", // sender address
  to: "email", // receiver (use array of string for a list)
  // replyTo: 'suporte@pdasolucoes.com.br',
  subject: `Some awesome email`, // Subject line
};

const sendEmail = async (emailOptions: Options) => {
  const emailTransporter: nodemailer.Transporter<any> =
    await createTransporter()
      .then((transporter) => transporter)
      .catch((err) => {
        console.error(err);
      });
  await emailTransporter.sendMail(emailOptions).catch((err: any) => {
    console.error(err);
  });
};

const hour = new Date().getHours();

// @ts-ignore
mailOptions.text = `${
  hour < 12
    ? "Good morning"
    : hour >= 12 && hour < 18
    ? "Good afternoon"
    : "Good evening"
}.\r\n\r\n Automated hello with nodemailer!`;

sendEmail(mailOptions);
