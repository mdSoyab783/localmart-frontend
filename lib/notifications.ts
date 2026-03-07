// Utility function to send order status notifications
export async function notifyOrderStatusChange(orderData: {
  orderId: string;
  status: "Confirmed" | "Packed" | "Out for Delivery" | "Delivered";
  customerName?: string;
  email: string;
  phoneNumber: string;
  totalAmount?: number;
  address?: string;
}) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/notifications`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...orderData,
        timestamp: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Notification error:", error);
      return { success: false, error };
    }

    const result = await response.json();
    console.log("Notification sent successfully:", result);
    return { success: true, result };
  } catch (error) {
    console.error("Failed to send notification:", error);
    return { success: false, error: String(error) };
  }
}

// Format phone number for display
export function formatPhoneNumber(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) {
    return `+91${digits}`;
  }
  return digits.startsWith("+") ? digits : `+${digits}`;
}
