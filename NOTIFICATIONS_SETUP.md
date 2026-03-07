# 📧 Email & SMS Notification Setup Guide

## Quick Start

The notification system automatically sends emails and SMS when order status is updated to:
- ✅ **Confirmed**
- 📦 **Packed**
- 🚚 **Out for Delivery**
- 🎉 **Delivered**

## Step 1: Configure Email (Gmail)

### Get Gmail App Password

1. Open https://myaccount.google.com/security
2. Click "2-Step Verification" and enable it (if not already enabled)
3. Go back to Security settings
4. Look for "App passwords" (appears after 2FA is enabled)
5. Select "Mail" and "Windows Computer"
6. Copy the 16-character password

### Add to .env.local

```env
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx
```

Replace `your-gmail@gmail.com` with your actual Gmail address and paste the 16-character password.

## Step 2: (Optional) Configure SMS with Twilio

1. Sign up at https://www.twilio.com
2. Go to console.twilio.com
3. Copy your **Account SID** and **Auth Token**
4. Purchase a phone number (e.g., +1234567890)

### Add to .env.local

```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+1234567890
```

## Step 3: Set App URL

Add to .env.local for tracking links in emails:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

For production use your domain:
```env
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

## Step 4: Test It

1. Go to Admin → Orders Management
2. Click "Update Status" on any order
3. Select a status (Confirmed, Packed, Out for Delivery, or Delivered)
4. You'll see a blue alert: "Customer will receive email & SMS when status is updated to [Status]"
5. Click "Confirm Update"
6. Check for success message and check customer's email

## Complete .env.local Example

```env
# API
NEXT_PUBLIC_API_URL=http://localhost:8000

# Email Notifications (Gmail)
EMAIL_USER=shopowner@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop

# SMS Notifications (Twilio - optional)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+1234567890

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Razorpay
RAZORPAY_KEY_ID=rzp_test_1DP5mmOlF5G5ag
RAZORPAY_KEY_SECRET=thisissecret
```

## Admin Modal Changes

When updating order status, the modal now shows:

- 📧 **Notification Alert** - Blue box indicating which statuses trigger notifications
- **Status Update Modal** - Shows real-time status of notification sending
- ✅ **Success Message** - "Notifications sent to customer!" when done
- ❌ **Error Message** - If something goes wrong

## Email Templates

### Confirmed Email ✅
- Purple gradient header
- Order details section
- Tracking link button
- Message about packing

### Packed Email 📦
- Order packed notification
- Expected delivery date
- Shipping info

### Out for Delivery Email 🚚
- Red alert box with delivery info
- Delivery address
- Contact number field
- "Be ready for delivery" message

### Delivered Email 🎉
- Green success header
- Delivery confirmation
- "Rate Your Order" button
- Thank you message

## SMS Templates

```
✅ Confirmed: "Your LocalMart order #ORDER-ID is confirmed! Total: ₹AMOUNT. Track here: LINK"

📦 Packed: "Your LocalMart order #ORDER-ID is packed! Expected delivery in 2-3 days."

🚚 Out for Delivery: "Your LocalMart order #ORDER-ID is out for delivery today! Arriving at ADDRESS. Be ready!"

🎉 Delivered: "Your LocalMart order #ORDER-ID has been delivered! Thank you for shopping with us!"
```

## Testing Without Real Email/SMS

The system works in two modes:

1. **Production Mode** (Email/SMS configured)
   - Sends real emails via Gmail
   - Sends real SMS via Twilio (if configured)

2. **Development Mode** (No credentials)
   - Still shows success in UI
   - Logs to console instead
   - No real emails/SMS sent

## Troubleshooting

### Emails not sending?
- Check `.env.local` is saved
- Restart the dev server after changing `.env.local`
- Verify Gmail app password (not your main password)
- Check Gmail security alerts: https://myaccount.google.com/security-checkup
- Gmail might need account recovery if using new device

### Phone number format?
- Use international format: +91XXXXXXXXXX (India) or +1XXXXXXXXXX (US)
- Remove spaces and special characters
- Twilio needs exactly 10-15 digits plus country code

### Testing email sending?
```javascript
// Run in browser console at /admin/orders
fetch('/api/notifications', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    orderId: 'TEST-001',
    status: 'Confirmed',
    email: 'test@example.com',
    phoneNumber: '+919876543210',
    customerName: 'Test User',
    totalAmount: 500,
    address: 'Test Address'
  })
})
.then(r => r.json())
.then(d => console.log(d))
```

## Architecture

```
Order Status Update (Admin)
         ↓
    API Call
         ↓
Update Order in DB
         ↓
Send Notification
    ↙        ↘
Email      SMS
(nodemailer) (Twilio)
    ↙        ↘
Gmail    Twilio API
```

## Security Notes

⚠️ **Never commit `.env.local` to git**
- It contains sensitive credentials
- Use `.env.local.example` template instead
- Each developer/deployment gets their own `.env.local`

## Next Steps

After setup:
1. Test by updating an order status
2. Check customer email (and SMS if configured)
3. Verify links work correctly
4. Add customer phone number to checkout form if not present

---

📚 Full documentation: See `NOTIFICATIONS.md`
