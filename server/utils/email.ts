import nodemailer, { Transporter } from "nodemailer";
import dotenv from "dotenv";
import { convert } from "html-to-text"; 
dotenv.config();

// Define user and doctor interfaces
interface User {
  email: string;
  name?: string;
}

export class Email {
  private to: string;
  private from: string;
  private firstName?: string;

  constructor(user: User) {
    this.to = user.email;
    this.firstName = user.name?.split(" ")[0];
    this.from = process.env.Email_Username || "";
  }

  private newTransport(): Transporter {
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.Email_Username || "",
        pass: process.env.Email_Password || "",
      },
      logger: true,
      debug: true,
    });
  }

  private async send(subject: string, message: string, email: string = this.to): Promise<void> {
    const mailOptions = {
      from: this.from,
      to: email,
      subject,
      html: message,
      text: convert(message, { wordwrap: 130 }), // Convert HTML to plain text
    };

    try {
      console.log("Sending email...");
      await this.newTransport().sendMail(mailOptions);
      console.log("Email sent successfully.");
    } catch (err) {
      console.error("Error sending email:", err);
      throw new Error("Failed to send email.");
    }
  }

  async sendWelcome(): Promise<void> {
    const message = `
      <h1>Welcome Whatsapp clone Website.</h1>
      <p>Hi ${this.firstName},</p>
      <p>Thank you for joining us! We're excited to have you.</p>
    `;
    await this.send("Welcome to the Whatsapp clone.", message);
  }

  async sendPasswordReset(): Promise<void> {
    const message = `
      <h1>Password Reset Request</h1>
      <p>Hi ${this.firstName},</p>
      <p>We received a request to reset your password. Click the link below to reset it:</p>
      <p>This link is valid for 10 minutes.</p>
    `;
    await this.send("Your Password Reset Token (Valid for 10 minutes)", message);
  }

  async sendOtp(otp: string): Promise<void> {
    const message = `<h4>Your OTP for email verification is <b>${otp}</b></h4>`;
    await this.send("Your OTP for email verification. (Valid for 5 minutes)", message);
  }

}
