# 📧 Visual Guide - Email & SMS Notifications

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         LocalMart App                           │
│                                                                 │
│  ┌──────────────────┐                                          │
│  │  Admin Updates   │                                          │
│  │  Order Status    │                                          │
│  └────────┬─────────┘                                          │
│           │                                                     │
│  ┌────────▼──────────────────────────────────────────────┐    │
│  │  /admin/orders/page.jsx                               │    │
│  │  - Modal shows notification alert                      │    │
│  │  - Calls handleUpdateStatus()                          │    │
│  │  - Shows real-time sending status                      │    │
│  └────────┬──────────────────────────────────────────────┘    │
│           │                                                     │
│  ┌────────▼──────────────────────────────────────────────┐    │
│  │  Order Status Updated in Database                      │    │
│  └────────┬──────────────────────────────────────────────┘    │
│           │                                                     │
│  ┌────────▼──────────────────────────────────────────────┐    │
│  │  Check if Status Requires Notification                │    │
│  │  (Confirmed, Packed, Out for Delivery, Delivered)     │    │
│  └────────┬──────────────────────────────────────────────┘    │
│           │                                                     │
│  ┌────────▼──────────────────────────────────────────────┐    │
│  │  Parallel Sending                                      │    │
│  └──┬─────────────────────────────────────────────────┬──┘    │
│     │                                                 │         │
│  ┌──▼───────────────────────────┐  ┌──────────────┬─▼──┐    │
│  │ Email Notification            │  │ SMS          │    │    │
│  │ /api/notifications            │  │ Notification │    │    │
│  └──┬───────────────────────────┘  └──────────────┴────┘    │
│     │                                         │                │
└─────┼─────────────────────────────────────────┼──────────────┘
      │                                         │
      ▼                                         ▼
  ┌─────────────────┐               ┌─────────────────┐
  │  Gmail SMTP     │               │  Twilio API     │
  │  (nodemailer)   │               │  (SMS)          │
  └────────┬────────┘               └────────┬────────┘
           │                                 │
           ▼                                 ▼
   ┌────────────────┐              ┌────────────────┐
   │  Gmail Inbox   │              │ Customer Phone │
   │  (HTML Email)  │              │  (SMS Text)    │
   └────────────────┘              └────────────────┘
```

---

## Email Flow

### Step 1: Admin Updates Status
```
┌─────────────────────────────────────────┐
│ Admin Order Management Page             │
├─────────────────────────────────────────┤
│ Orders Table:                           │
│ [LM-001] [Customer] [₹1499] [Pending] │
│         ← "Update Status" button click   │
└─────────────────────────────────────────┘
```

### Step 2: Modal Appears
```
┌─────────────────────────────────────────┐
│ 📋 Update Order Status                  │
├─────────────────────────────────────────┤
│ Order #LM-001                           │
│                                         │
│ New Status: [Confirmed ▼]               │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ 📧 Notification Alert               │ │
│ │ Customer will receive email & SMS   │ │
│ │ when status is updated to Confirmed │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ [Cancel] [Confirm Update]               │
└─────────────────────────────────────────┘
     ▲                    │
     │                    ▼
     │            Click "Confirm Update"
```

### Step 3: API Calls Begin
```
Frontend                  API                Backend
   │                      │                   │
   │──POST /api/orders/──▶│                   │
   │     update status    │─────────────────▶│ Update DB
   │                      │                   │
   │                      │◀─────────────────│ Success
   │                      │                   │
   │─POST /api/──────────▶│                   │
   │ notifications        │                   │
   │                      │──Send Email (Gmail)
   │                      │──Send SMS (Twilio)
```

### Step 4: Success Response
```
┌─────────────────────────────────────────┐
│ 📋 Update Order Status                  │
├─────────────────────────────────────────┤
│ Order #LM-001                           │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ 🟢 ✅ Notifications sent!           │ │
│ │ Email & SMS delivered to customer   │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ [Close Modal]                           │
└─────────────────────────────────────────┘
```

---

## Email Templates Preview

### Template 1: Confirmed Order Email

```
╔════════════════════════════════════════════════════════╗
║                                                        ║
║       ✅ ORDER CONFIRMED                              ║
║   [Purple Gradient Header]                            ║
║                                                        ║
╠════════════════════════════════════════════════════════╣
║                                                        ║
║ Hi Soyab! 👋                                         ║
║                                                        ║
║ Your order #LM-2024-001 has been confirmed!          ║
║                                                        ║
║ ┌──────────────────────────────────────────────────┐  ║
║ │ Order Details:                                   │  ║
║ │ • Order ID: LM-2024-001                         │  ║
║ │ • Status: Confirmed ✅                          │  ║
║ │ • Total: ₹1,499                                 │  ║
║ │ • Delivery: House No. 12, Main Market, Nangal   │  ║
║ └──────────────────────────────────────────────────┘  ║
║                                                        ║
║ Your order will be packed soon and shipped to you.   ║
║ You'll receive an update once it ships!               ║
║                                                        ║
║    ┌──────────────────────────────────┐              ║
║    │  🔗 Track Your Order             │              ║
║    │  [Button with tracking link]     │              ║
║    └──────────────────────────────────┘              ║
║                                                        ║
║ 🛍️ LocalMart • Supporting local businesses           ║
║                                                        ║
╚════════════════════════════════════════════════════════╝
```

### Template 2: Out for Delivery Email

```
╔════════════════════════════════════════════════════════╗
║                                                        ║
║       🚚 OUT FOR DELIVERY TODAY!                       ║
║   [Orange/Red Alert]                                  ║
║                                                        ║
╠════════════════════════════════════════════════════════╣
║                                                        ║
║ Hi Soyab! 👋                                         ║
║                                                        ║
║ Your order #LM-2024-001 is out for delivery today!   ║
║                                                        ║
║ ┌──────────────────────────────────────────────────┐  ║
║ │ ⚠️ DELIVERY TODAY                               │  ║
║ │ • Order ID: LM-2024-001                         │  ║
║ │ • Delivery Address: House No. 12, Main Market   │  ║
║ │ • Phone: +91 98765 43210                        │  ║
║ │ • Please keep phone nearby!                      │  ║
║ └──────────────────────────────────────────────────┘  ║
║                                                        ║
║ Your package will arrive at the delivery address.    ║
║ Delivery driver will contact you soon.                ║
║                                                        ║
║    ┌──────────────────────────────────┐              ║
║    │  🔗 Track Your Order             │              ║
║    │  [Real-time tracking updates]    │              ║
║    └──────────────────────────────────┘              ║
║                                                        ║
║ 🛍️ LocalMart • Supporting local businesses           ║
║                                                        ║
╚════════════════════════════════════════════════════════╝
```

### Template 3: Delivered Email

```
╔════════════════════════════════════════════════════════╗
║                                                        ║
║       🎉 DELIVERED SUCCESSFULLY!                       ║
║   [Green Gradient Header]                             ║
║                                                        ║
╠════════════════════════════════════════════════════════╣
║                                                        ║
║ Hi Soyab! 👋                                         ║
║                                                        ║
║ Your order #LM-2024-001 has been delivered! 🎉       ║
║                                                        ║
║ ┌──────────────────────────────────────────────────┐  ║
║ │ ✅ DELIVERY CONFIRMED                           │  ║
║ │ • Order ID: LM-2024-001                         │  ║
║ │ • Status: Delivered ✅                          │  ║
║ │ • Delivered On: 5 March 2026                    │  ║
║ └──────────────────────────────────────────────────┘  ║
║                                                        ║
║ Thank you for shopping with LocalMart! We hope you   ║
║ enjoy your purchase. Your feedback helps us improve. ║
║                                                        ║
║    ┌──────────────────────────────────┐              ║
║    │  ⭐ Rate Your Order               │              ║
║    │  [Share your experience]         │              ║
║    └──────────────────────────────────┘              ║
║                                                        ║
║ 🛍️ LocalMart • Supporting local businesses           ║
║                                                        ║
╚════════════════════════════════════════════════════════╝
```

---

## SMS Message Flow

### SMS Sent Timeline

```
Time  Event                              SMS Sent to Customer
────────────────────────────────────────────────────────────
2:30  Order Confirmed                    📱 Order confirmed! ✅
      Status → Confirmed                    Total: ₹1499
                                            Track: [link]

3:45  Order Packed                       📱 Packed & ready!
      Status → Packed                       Delivery in 2-3 days 📦

5:00  Order Shipped                      📱 Out for delivery 🚚
      Status → Out for Delivery             Arriving at [address]
                                            Be ready!

6:30  Order Delivered                    📱 Delivered! 🎉
      Status → Delivered                    Thank you for shopping
                                            with LocalMart!
```

---

## Admin Modal States

### State 1: Initial Load
```
┌─────────────────────────────────────────────┐
│ 📋 Update Order Status                      │
├─────────────────────────────────────────────┤
│ Order #LM-001                               │
│ New Status: [Dropdown - select status]      │
│                                             │
│ 📧 Notification Alert Box (if applicable)   │
│                                             │
│ [Cancel]  [Confirm Update]                  │
└─────────────────────────────────────────────┘
```

### State 2: Sending
```
┌─────────────────────────────────────────────┐
│ 📋 Update Order Status                      │
├─────────────────────────────────────────────┤
│ Order #LM-001                               │
│ New Status: Confirmed                       │
│                                             │
│ 📤 Sending notifications...                 │
│   [Loading spinner]                         │
│                                             │
│ [Cancel]  [Confirm Update (disabled)]       │
└─────────────────────────────────────────────┘
```

### State 3: Success
```
┌─────────────────────────────────────────────┐
│ 📋 Update Order Status                      │
├─────────────────────────────────────────────┤
│ Order #LM-001                               │
│ New Status: Confirmed                       │
│                                             │
│ ✅ Notifications sent to customer!          │
│    (Green success box)                      │
│                                             │
│ [Close]                                     │
└─────────────────────────────────────────────┘
  ↓ Auto-closes after 3 seconds
```

### State 4: Error
```
┌─────────────────────────────────────────────┐
│ 📋 Update Order Status                      │
├─────────────────────────────────────────────┤
│ Order #LM-001                               │
│ New Status: Confirmed                       │
│                                             │
│ ❌ Failed to send notifications             │
│    Check console for details                │
│                                             │
│ [Cancel]  [Confirm Update]                  │
│ (Note: Order status WAS updated)            │
└─────────────────────────────────────────────┘
```

---

## Customer Experience

### Timeline Example: Order LM-2024-001

```
Monday 2:30 PM
├─ Customer places order
├─ Payment processed
└─ Order Status: Placed

Monday 3:15 PM  ← Admin updates status
├─ Admin: "Update Status" → "Confirmed"
├─ 📧 Email Arrives:
│   "✅ Your order is confirmed!"
│   [Order details, tracking link]
└─ 📱 SMS Arrives:
   "Order #LM-001 confirmed! ✅ Total: ₹1,499"

Monday 5:00 PM  ← Admin updates status
├─ Admin: "Update Status" → "Packed"
├─ 📧 Email Arrives:
│   "📦 Your order is packed!"
│   [Shipping info, 2-3 day timeline]
└─ 📱 SMS Arrives:
   "Order packed! 📦 Expected in 2-3 days"

Tuesday 8:00 AM  ← Admin updates status
├─ Admin: "Update Status" → "Out for Delivery"
├─ 📧 Email Arrives:
│   "🚚 Out for delivery today!"
│   [Delivery address, contact number]
└─ 📱 SMS Arrives:
   "Out for delivery today! 🚚 Be ready!"

Tuesday 4:30 PM  ← Admin updates status
├─ Admin: "Update Status" → "Delivered"
├─ 📧 Email Arrives:
│   "🎉 Delivered successfully!"
│   [Rate your order button]
└─ 📱 SMS Arrives:
   "Delivered! 🎉 Thank you for shopping!"
```

---

## Database Flow

```
Orders Collection (MongoDB)
│
├─ _id: ObjectId
├─ orderId: "LM-2024-001"
├─ user:
│  ├─ name: "Soyab"
│  ├─ email: "soyab@example.com"
│  └─ phone: "+919876543210"
├─ status: "Delivered" ← Admin updates this
├─ statusHistory: [
│  └─ { status: "Confirmed", timestamp: "2024-03-05T02:30:00Z" }
│  └─ { status: "Packed", timestamp: "2024-03-05T05:00:00Z" }
│  └─ { status: "Out for Delivery", timestamp: "2024-03-06T08:00:00Z" }
│  └─ { status: "Delivered", timestamp: "2024-03-06T16:30:00Z" }
│
└─ When status changes:
   ↓
   Check if status is:
   ✅ Confirmed  ─┐
   📦 Packed     ├─ Send notification
   🚚 Out for    │
   🎉 Delivered  ┘
```

---

## Integration Points

```
LocalMart App Architecture
│
├─ Admin Orders Page
│  └─ Click "Update Status"
│     └─ Modal opens with notification alert
│        └─ Click "Confirm"
│           └─ Calls sendNotification()
│
├─ Notification API
│  ├─ Email Sender (Gmail SMTP)
│  └─ SMS Sender (Twilio)
│
└─ Customer Communication
   ├─ 📧 Gmail Inbox
   └─ 📱 Phone SMS
```

---

**Visual Guide Complete!** 🎨

For more details, see the technical documentation files.
