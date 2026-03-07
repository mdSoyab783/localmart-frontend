# 🏗️ System Architecture & Data Flow

## Complete System Architecture

```
┌────────────────────────────────────────────────────────────────────┐
│                         ADMIN BROWSER                              │
│                    (http://localhost:3000)                         │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │              Admin Orders Dashboard                          │ │
│  │          (/admin/orders/page.jsx)                            │ │
│  │                                                              │ │
│  │  ┌─────────────────────────────────────────────────────┐  │ │
│  │  │  Orders Table                                      │  │ │
│  │  │  ┌────────────┬──────────┬────────┬──────────────┐│  │ │
│  │  │  │ Order ID   │ Customer │ Status │ Update Btn  ││  │ │
│  │  │  ├────────────┼──────────┼────────┼──────────────┤│  │ │
│  │  │  │ LM-2024-001│ Soyab    │ Placed │ 🔄 Click   ││  │ │
│  │  │  │ LM-2024-002│ Rajesh   │ Conf.  │ 🔄 Click   ││  │ │
│  │  │  │ LM-2024-003│ Priya    │ Packed │ 🔄 Click   ││  │ │
│  │  │  └────────────┴──────────┴────────┴──────────────┘│  │ │
│  │  │                                                    │  │ │
│  │  │  ┌───────────────────────────────────────────┐   │  │ │
│  │  │  │     Update Status Modal                   │   │  │ │
│  │  │  │  ┌─────────────────────────────────────┐ │   │  │ │
│  │  │  │  │ Status: [Confirmed ▼]              │ │   │  │ │
│  │  │  │  │ Note:   [Optional text....]        │ │   │  │ │
│  │  │  │  │                                     │ │   │  │ │
│  │  │  │  │ [Cancel]  [Confirm Update]         │ │   │  │ │
│  │  │  │  │                                     │ │   │  │ │
│  │  │  │  │ Status: 🔄 Sending...              │ │   │  │ │
│  │  │  │  │          ✅ Sent! or ❌ Failed      │ │   │  │ │
│  │  │  │  └─────────────────────────────────────┘ │   │  │ │
│  │  │  └───────────────────────────────────────────┘   │  │ │
│  │  └─────────────────────────────────────────────────────┘  │ │
│  └──────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────┘
                                 │
                    ┌────────────┼────────────┐
                    │            │            │
                    ▼            ▼            ▼
              ┌──────────┐ ┌──────────┐ ┌──────────────┐
              │  GET all │ │ PUT      │ │ POST notify  │
              │ /api/    │ │ /api/    │ │ /api/        │
              │ orders   │ │ orders   │ │ notif..      │
              │ /all     │ │ /{id}    │ │ ications     │
              └────┬─────┘ └────┬─────┘ └──────┬───────┘
                   │            │              │
┌──────────────────┴────────────┴──────────────┴─────────────────────┐
│                      NEXT.JS API LAYER                             │
│                     (app/api/routes)                               │
│                                                                    │
│  ┌──────────────────┐  ┌──────────────────┐  ┌────────────────┐ │
│  │ orders/all       │  │ orders/[id]      │  │ notifications  │ │
│  │ /route.ts        │  │ /route.ts        │  │ /route.ts      │ │
│  │                  │  │                  │  │                │ │
│  │ GET request      │  │ GET request      │  │ POST request   │ │
│  │ ↓                │  │ ↓                │  │ ↓              │ │
│  │ getOrders()      │  │ getOrderById()   │  │ sendEmails()   │ │
│  │                  │  │ updateOrder()    │  │ sendSMS()      │ │
│  │ return all       │  │                  │  │                │ │
│  │ orders (filter)  │  │ PUT request      │  │ return response│ │
│  │                  │  │ ↓                │  │                │ │
│  │                  │  │ updateOrder()    │  │                │ │
│  │                  │  │ add to history   │  │                │ │
│  │                  │  │ return updated   │  │                │ │
│  │                  │  │ order            │  │                │ │
│  └──────────────────┘  └──────────────────┘  └────────────────┘ │
│           │                     │                     │           │
│           └─────────────────────┼─────────────────────┘           │
│                                 │                                 │
│                  ┌──────────────▼──────────────┐                 │
│                  │   Shared Database           │                 │
│                  │  (database.ts)              │                 │
│                  │                             │                 │
│                  │  ordersDatabase =           │                 │
│                  │  [                          │                 │
│                  │   {                         │                 │
│                  │     _id: "...",             │                 │
│                  │     status: "Confirmed",    │                 │
│                  │     statusHistory: [...],   │                 │
│                  │     ...                     │                 │
│                  │   },                        │                 │
│                  │   ...                       │                 │
│                  │  ]                          │                 │
│                  └──────────────┬──────────────┘                 │
│                                 │                                 │
│        ┌────────────────────────┼────────────────────────┐       │
│        │                        │                        │       │
│        ▼                        ▼                        ▼       │
│  ┌──────────────┐         ┌──────────────┐      ┌────────────┐ │
│  │  In-Memory   │         │    Return    │      │ If status  │ │
│  │  Array of    │         │   Updated    │      │ = Confirm, │ │
│  │  Orders      │         │   Orders     │      │ Packed, etc│ │
│  │              │         │              │      │            │ │
│  │  Order 1     │         │  Success: T  │      │ Trigger:   │ │
│  │  Order 2     │         │  Order: {...}│      │ Email + SMS│ │
│  │  Order 3     │         │              │      │            │ │
│  └──────────────┘         └──────────────┘      └────────────┘ │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         │                       │                       │
         ▼                       ▼                       ▼
    ┌──────────────┐      ┌──────────────┐      ┌──────────────┐
    │  Gmail SMTP  │      │   Twilio     │      │  Response    │
    │              │      │              │      │              │
    │ nodemailer   │      │  SMS API     │      │ 200 OK       │
    │ .sendMail()  │      │  .send()     │      │              │
    │              │      │              │      │ {            │
    │ Sends HTML   │      │ Sends Text   │      │   success:   │
    │ email to:    │      │ SMS to:      │      │   true,      │
    │ customer     │      │ customer     │      │   message:   │
    │ email        │      │ phone        │      │   "Sent"     │
    │              │      │              │      │ }            │
    └──────────────┘      └──────────────┘      └──────────────┘
         │                       │
         ▼                       ▼
    ┌──────────────┐      ┌──────────────┐
    │   ✉️ Email   │      │   📱 SMS     │
    │              │      │              │
    │ To: customer │      │ To: phone    │
    │ @email.com   │      │ number       │
    │              │      │              │
    │ Subject:     │      │ "Your order  │
    │ Order Conf.. │      │ LM-2024-001  │
    │              │      │ is Confirmed"│
    │ [Beautiful   │      │              │
    │  HTML Body]  │      │ [Simple Text]│
    │              │      │              │
    └──────────────┘      └──────────────┘
         │                       │
         ▼                       ▼
    ┌──────────────────────────────────┐
    │   CUSTOMER NOTIFICATION          │
    │                                  │
    │   ✅ Order confirmed!            │
    │   Order ID: LM-2024-001          │
    │   Estimated Delivery: Mar 08     │
    │                                  │
    └──────────────────────────────────┘
```

## Order Status Transition Flow

```
┌─────────────────────────────────────────────────────────────────┐
│              ORDER LIFECYCLE WITH NOTIFICATIONS                 │
└─────────────────────────────────────────────────────────────────┘

Admin clicks order → Updates Status → Notification Triggers

┌──────────┐
│  PLACED  │  (No notification)
│ 🏷️ New  │
└─────┬────┘
      │ Admin updates
      ▼
┌──────────────────┐
│   CONFIRMED      │  📧 Notification Sent!
│ ✅ Processing    │     - Email: Order Confirmed
│                  │     - SMS: Order confirmed, will be packed soon
└─────┬────────────┘
      │ Admin updates
      ▼
┌──────────────────┐
│     PACKED       │  📧 Notification Sent!
│ 📦 Ready to ship │     - Email: Order Packed
│                  │     - SMS: Order packed, out for delivery soon
└─────┬────────────┘
      │ Admin updates
      ▼
┌──────────────────┐
│     SHIPPED      │  (No notification - optional)
│ 🚚 In Transit    │
└─────┬────────────┘
      │ Admin updates
      ▼
┌──────────────────────┐
│  OUT FOR DELIVERY    │  📧 Notification Sent!
│ 🗺️ Route optimized  │     - Email: Out for Delivery
│                      │     - SMS: Package out for delivery, arriving today
└─────┬────────────────┘
      │ Admin updates
      ▼
┌──────────────────┐
│   DELIVERED      │  📧 Notification Sent!
│ 🎉 Arrived!      │     - Email: Order Delivered
│                  │     - SMS: Order delivered successfully!
└──────────────────┘

Notification Triggers on: Confirmed, Packed, Out for Delivery, Delivered
```

## Email Template Examples

### Confirmed Email
```
Subject: Your Order LM-2024-001 is Confirmed!

Dear Soyab Khan,

Great news! Your order has been confirmed and is being processed.

Order Details:
  Order ID: LM-2024-001
  Total Amount: ₹587.00
  Delivery Address: House No. 12, Main Market, Nangal

Your order will be packed and shipped soon. We'll send you another
notification with tracking details.

Thank you for shopping with us!
```

### Out for Delivery Email
```
Subject: Your Order LM-2024-001 is Out for Delivery!

Dear Soyab Khan,

Exciting! Your package is on its way and will arrive today!

Order Details:
  Order ID: LM-2024-001
  Expected Delivery: Today between 9 AM - 5 PM
  Delivery Address: House No. 12, Main Market, Nangal

Track your delivery in real-time on our website.

Thank you for shopping with us!
```

## Data Structure

### Order Object
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "orderId": "LM-2024-001",
  "user": {
    "name": "Soyab Khan",
    "email": "soyab@example.com",
    "phone": "+919876543210"
  },
  "status": "Confirmed",
  "items": [
    {
      "id": 1,
      "name": "Fresh Vegetables",
      "price": 149,
      "quantity": 2
    }
  ],
  "totalAmount": 587,
  "deliveryFee": 50,
  "shippingAddress": {
    "name": "Soyab Khan",
    "phone": "+919876543210",
    "addressLine1": "House No. 12",
    "addressLine2": "Main Market",
    "city": "Nangal",
    "state": "Punjab",
    "pincode": "140126"
  },
  "createdAt": "2024-03-05T10:30:00Z",
  "statusHistory": [
    {
      "status": "Confirmed",
      "timestamp": "2024-03-07T08:25:04Z"
    },
    {
      "status": "Packed",
      "timestamp": "2024-03-07T09:15:22Z"
    }
  ],
  "note": "Order confirmed - processing now"
}
```

## Database Location

**In-Memory Storage:**
- File: `/app/api/orders/database.ts`
- Location: RAM (lost on server restart)
- Size: Limited to available memory
- Performance: Ultra-fast

**For Production:**
- Use MongoDB instead
- Set `MONGODB_URI` in `.env.local`
- Persistent storage
- Horizontal scalability

## Key Endpoints

| Method | URL | Purpose | Response |
|--------|-----|---------|----------|
| GET | `/api/orders/all` | Get all orders | `{ success, orders[], total }` |
| GET | `/api/orders/{id}` | Get specific order | Order object |
| PUT | `/api/orders/{id}` | Update order | `{ success, message, order }` |
| POST | `/api/notifications` | Send notification | `{ success, message }` |

---

This architecture ensures:
- ✅ **Fast responses** - In-memory database
- ✅ **Real-time updates** - Immediate status changes
- ✅ **Reliable notifications** - Async email/SMS
- ✅ **Easy debugging** - All in one app
- ✅ **Ready for production** - Easily swappable with MongoDB
