import { NextResponse } from "next/server";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "",
});

export async function POST(request: Request) {
  try {
    const { amount } = await request.json();

    if (!amount || isNaN(Number(amount))) {
      return NextResponse.json({ error: "Invalid amount." }, { status: 400 });
    }

    // Convert amount from Rupees to Paise (integer)
    const amountInPaise = Math.round(Number(amount) * 100);

    const options = {
      amount: amountInPaise,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const razorpayOrder = await razorpay.orders.create(options);

    return NextResponse.json({
      id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key_id: process.env.RAZORPAY_KEY_ID || "",
    });
  } catch (error: any) {
    console.error("Razorpay order creation API error:", error);
    return NextResponse.json(
      { error: "Failed to initiate Razorpay order." },
      { status: 500 }
    );
  }
}
