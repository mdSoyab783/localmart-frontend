import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { amount } = await req.json();
    
    console.log("Creating order with amount:", amount);

    // Using mock payment for testing purposes
    // In production, replace with real Razorpay implementation
    const mockOrderId = "order_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
    
    return NextResponse.json({
      orderId: mockOrderId,
      amount: Math.round(amount * 100), // Convert rupees to paise
      currency: "INR",
      key: "rzp_test_1DP5mmOlF5G5ag", // Test key for Razorpay
      paymentId: "pay_" + Date.now(),
      mock: true,
    });
  } catch (error: any) {
    console.error("Payment error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create order" },
      { status: 500 }
    );
  }
}


