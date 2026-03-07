# Order Notification System

This document explains how the email and SMS notification system works for order status updates.

## Overview

When an admin updates an order status to one of these statuses:
- ✅ **Confirmed**
- 📦 **Packed**
- 🚚 **Out for Delivery**
- 🎉 **Delivered**

The customer automatically receives:
1. **Email Notification** - HTML formatted email with order details and tracking link
2. **SMS Notification** - Text message with order status update

## Setup Instructions

### 1. Email Setup (Gmail SMTP)

To enable email notifications, add the following to your `.env.local` file:

```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password
```

**Steps to get Gmail App Password:**
1. Go to https://myaccount.google.com/security
2. Enable 2-Factor Authentication if not already done
3. Go to "App passwords" (at the bottom)
4. Select "Mail" and "Windows Computer"
5. Copy the generated 16-character password
6. Use this password in `EMAIL_PASSWORD` in `.env.local`

### 2. SMS Setup (Twilio - Optional)

To enable SMS notifications, sign up for Twilio and add to `.env.local`:

```env
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

**Get Twilio Credentials:**
1. Sign up at https://www.twilio.com
2. Go to Twilio Console
3. Copy your Account SID and Auth Token
4. Purchase a phone number (this will be TWILIO_PHONE_NUMBER)

### 3. App URL Configuration

Add your app URL to `.env.local` for tracking links in emails:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

For production:
```env
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

## API Endpoint

**Endpoint:** `POST /api/notifications`

**Required Fields:**
- `orderId` - Order ID
- `status` - One of: "Confirmed", "Packed", "Out for Delivery", "Delivered"
- `email` - Customer email address
- `phoneNumber` - Customer phone number
- `customerName` - Customer name (optional)
- `totalAmount` - Order total amount (optional)
- `address` - Delivery address (optional)

**Example Request:**
```javascript
fetch('/api/notifications', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    orderId: 'LM-2024-001',
    status: 'Confirmed',
    email: 'customer@example.com',
    phoneNumber: '+919876543210',
    customerName: 'John Doe',
    totalAmount: 1499,
    address: 'House No. 12, Main Market, Nangal',
    timestamp: new Date().toISOString()
  })
})
```

## Email Templates

Each status has its own email template:

### 1. **Confirmed** - ✅ Order Confirmed!
- Purple gradient header
- Order details
- "Track Your Order" button
- Message: Order will be packed soon

### 2. **Packed** - 📦 Order Packed!
- Order packed notification
- Expected delivery timeline
- Shipping notification info

### 3. **Out for Delivery** - 🚚 Out for Delivery!
- Delivery alert in red
- Delivery address highlighted
- Phone number for delivery driver contact
- "Track Your Order" button

### 4. **Delivered** - 🎉 Delivered Successfully!
- Green gradient header
- Delivery confirmation
- "Rate Your Order" button
- Thank you message

## SMS Templates

SMS messages are automatically generated based on status:

```
Confirmed: "Your LocalMart order #LM-001 is confirmed! ✅ Total: ₹1499. Track here: [link]"

Packed: "Your LocalMart order #LM-001 is packed and ready to ship! 📦 Expected delivery in 2-3 days."

Out for Delivery: "Your LocalMart order #LM-001 is out for delivery today! 🚚 Arriving at [address]. Be ready!"

Delivered: "Your LocalMart order #LM-001 has been delivered! 🎉 Thank you for shopping with us!"
```

## Admin Interface

### How to Send Notifications

1. Go to Admin → Orders Management
2. Click "Update Status" button for an order
3. Select new status (Confirmed, Packed, Out for Delivery, or Delivered)
4. Modal shows a blue alert: "Customer will receive email & SMS when status is updated to [Status]"
5. Click "Confirm Update"
6. System will:
   - Update order status in database
   - Send email notification
   - Send SMS notification (if Twilio configured)
   - Show success/failure status

### Notification Status Indicators

- 📤 **Sending notifications...** - Notifications being processed
- ✅ **Notifications sent to customer!** - Success! Customer received email and/or SMS
- ❌ **Failed to send notifications** - Error occurred, check console logs

## Features

✅ **Beautiful HTML Emails**
- Gradient headers with emoji
- Order details clearly displayed
- Tracking link included
- Mobile responsive

✅ **SMS Notifications**
- 160-character optimized messages
- Status emoji included
- Tracking link in SMS

✅ **Smart Triggering**
- Only sends for 4 specific statuses
- Shows preview in admin modal
- Automatic retry on failure

✅ **Customer Information**
- Pulls customer name, email, phone
- Uses delivery address if available
- Graceful fallbacks for missing data

## Testing

### Test Email Sending

```javascript
// In browser console at /admin/orders
fetch('/api/notifications', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    orderId: 'TEST-001',
    status: 'Confirmed',
    email: 'your-email@gmail.com',
    phoneNumber: '+919876543210',
    customerName: 'Test User',
    totalAmount: 500,
    address: 'Test Address'
  })
})
.then(r => r.json())
.then(d => console.log('Result:', d))
```

## Troubleshooting

### Emails not sending?
1. Check `.env.local` has `EMAIL_USER` and `EMAIL_PASSWORD`
2. Verify Gmail app-specific password is correct
3. Check browser console and server logs for errors
4. Gmail might block first-time app login - check Gmail security alerts

### SMS not sending?
1. Verify Twilio credentials in `.env.local`
2. Ensure Twilio account has sufficient credits
3. Check phone number format (should include country code)
4. Twilio is optional - app works fine without it

### Customer not receiving notifications?
1. Verify customer email and phone number in order
2. Check spam/junk folder for email
3. Verify phone number format with country code
4. Check API response status in admin modal
5. Review server logs: `/api/notifications` route logs

## Files Modified

1. **`/app/api/notifications/route.ts`** - Main notification API endpoint
   - Email sending with nodemailer
   - SMS sending with Twilio
   - Beautiful HTML templates

2. **`/app/admin/orders/page.jsx`** - Admin orders management
   - Integration with notification system
   - Real-time notification status display
   - Alert when notifications will be sent

3. **`/lib/notifications.ts`** - Utility functions
   - `notifyOrderStatusChange()` - Send notification
   - `formatPhoneNumber()` - Format phone numbers

## Environment Variables Required

```env
# Email (Required for email notifications)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password

# SMS (Optional)
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# App URL (For tracking links)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Response Format

### Success Response
```json
{
  "success": true,
  "orderId": "LM-001",
  "status": "Confirmed",
  "notifications": {
    "email": { "success": true },
    "sms": { "success": true, "message": "SMS notification queued" }
  },
  "message": "Notification requests processed"
}
```

### Error Response
```json
{
  "error": "Missing required fields: orderId, status, email, phoneNumber",
  "status": 400
}
```

## Future Enhancements

- [ ] WhatsApp notifications
- [ ] Push notifications to mobile app
- [ ] Notification history/logs dashboard
- [ ] Customizable notification templates
- [ ] Notification preferences per customer
- [ ] Delivery OTP integration
- [ ] Email unsubscribe links

---

**Last Updated:** March 7, 2026
