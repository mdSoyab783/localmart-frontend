import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, status, customerName, email } = body;

    if (!orderId || !status) {
      return NextResponse.json({ error: "Missing orderId or status" }, { status: 400 });
    }

    // If no email, just return success silently
    if (!email) {
      console.log(`No email for order ${orderId}, skipping notification`);
      return NextResponse.json({ success: true, message: "Notification requests processed" });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"LocalMart" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Your Order is ${status} - LocalMart`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <h2 style="color: #3B82F6;">Order Update: ${status} 📦</h2>
          <p>Hi <strong>${customerName || "Customer"}</strong>,</p>
          <p>Your order <strong>#${orderId}</strong> status has been updated to <strong>${status}</strong>.</p>
          <p>Thank you for shopping with LocalMart!</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true, message: "Notification requests processed" });
  } catch (err) {
    console.error("Notification send error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
