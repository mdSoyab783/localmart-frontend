# 📋 ONE PAGE SETUP GUIDE

## Email & SMS Notification System - Quick Setup

---

## ⏱️ 5-MINUTE SETUP

### 🟡 STEP 1: Get Gmail App Password (2 minutes)

```
1. Go to: https://myaccount.google.com/security
2. Click: 2-Step Verification (enable if needed)
3. Go to: "App passwords" (below)
4. Select: Mail + Windows Computer
5. Copy: 16-character password
```

**Example:** `abcd efgh ijkl mnop`

---

### 🟠 STEP 2: Update .env.local (1 minute)

Open `.env.local` in VS Code and add:

```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Replace:**
- `your-email@gmail.com` with your actual Gmail
- `abcd efgh ijkl mnop` with your 16-char password from Step 1

---

### 🟢 STEP 3: Restart Dev Server (1 minute)

Stop and restart:
```bash
# Stop: Ctrl+C
# Start:
npm run dev
```

---

### 🔵 STEP 4: Test! (1 minute)

1. Go to: `http://localhost:3000/admin/orders`
2. Click: "Update Status" button
3. Select: "Confirmed"
4. Click: "Confirm Update"
5. Check: Customer's email ✅

---

## ✅ SUCCESS!

If you see:
- ✅ Green "Notifications sent!" message in admin
- ✅ Email in customer inbox (wait 2-3 seconds)
- ✅ Email has order details and tracking link

**You're done!** 🎉

---

## 📧 WHAT GETS SENT

| When Admin Updates To | Customer Receives |
|---|---|
| ✅ Confirmed | Email + SMS |
| 📦 Packed | Email + SMS |
| 🚚 Out for Delivery | Email + SMS |
| 🎉 Delivered | Email + SMS |

---

## 🆘 TROUBLESHOOTING

### Email not arriving?
- [ ] Check `.env.local` saved correctly
- [ ] Restart dev server
- [ ] Check customer's spam folder
- [ ] Use app-specific password (not Gmail password)

### Can't find app-specific password?
- [ ] You must enable 2-Step Verification first
- [ ] Go to: https://myaccount.google.com/security
- [ ] Look for "App passwords" at bottom
- [ ] If not there, enable 2-Step first

### Modal showing error?
- [ ] Check browser console (F12)
- [ ] Check server logs
- [ ] Verify EMAIL_USER and EMAIL_PASSWORD correct
- [ ] Restart server with new env vars

---

## 📱 OPTIONAL: Add SMS (Twilio)

If you want SMS notifications:

1. Sign up: https://www.twilio.com
2. Go to: console.twilio.com
3. Copy: Account SID + Auth Token
4. Buy: Phone number
5. Add to `.env.local`:

```env
TWILIO_ACCOUNT_SID=ACxxxx
TWILIO_AUTH_TOKEN=xxxx
TWILIO_PHONE_NUMBER=+1234567890
```

⚠️ **Note:** SMS is optional. Email works fine without it.

---

## 🔒 SECURITY

⚠️ **IMPORTANT:** Never commit `.env.local` to git!

```
.gitignore should have:
.env.local ← Keep this line
```

Each developer gets their own `.env.local` with their credentials.

---

## 📚 DOCUMENTATION

Need more help? See these files:

- `ADMIN_NOTIFICATIONS_GUIDE.md` ← Admin how-to
- `NOTIFICATIONS_SETUP.md` ← Detailed setup
- `NOTIFICATIONS.md` ← Technical reference
- `VISUAL_GUIDE.md` ← Diagrams

---

## 🎯 FEATURES

✅ Automatic emails when status updates
✅ Automatic SMS when status updates  
✅ Beautiful HTML email templates
✅ Real-time notification status in admin
✅ Error handling & fallbacks
✅ Works without SMS (email only)
✅ Mobile responsive emails
✅ Production ready

---

## 📊 EMAIL CONTENT

### Each email includes:
- 📧 Subject line with status
- 🎨 Colored header (purple/green/orange)
- 📋 Order details (ID, status, amount)
- 📍 Delivery address
- 🔗 Tracking link button
- 📱 Mobile responsive design

---

## 🚀 YOU'RE READY!

Once `.env.local` is set:
1. Restart server
2. Go to admin orders
3. Update any order status
4. Notifications send automatically ✅

---

## ⏰ TYPICAL TIMELINE

```
2:30 PM: Admin clicks "Update Status" → "Confirmed"
2:33 PM: ✅ Email in customer inbox
2:35 PM: 💬 SMS to customer (if Twilio setup)

3:45 PM: Admin → "Packed"
3:47 PM: ✅ Email in customer inbox
3:49 PM: 💬 SMS to customer

5:00 PM: Admin → "Out for Delivery"
5:02 PM: ✅ Email in customer inbox
5:04 PM: 💬 SMS to customer

6:30 PM: Admin → "Delivered"
6:32 PM: ✅ Email in customer inbox
6:34 PM: 💬 SMS to customer
```

---

## 💡 TIPS

- 📧 Email is faster than SMS
- ✅ Both work in parallel
- 🔄 No manual resend needed
- 📱 All emails mobile responsive
- 🎨 Each status has different design
- ✉️ Always includes tracking link
- 🔗 Tracking link goes to `/orders/track/[orderId]`

---

## ✅ QUICK CHECKLIST

- [ ] Get Gmail app password
- [ ] Add to `.env.local`
- [ ] Restart dev server
- [ ] Test admin orders page
- [ ] Update order status
- [ ] Check email received
- [ ] See green success message

**✅ ALL DONE!**

---

## 📞 QUICK SUPPORT

| Issue | Solution |
|-------|----------|
| Email not sent | Restart server + check `.env.local` |
| Modal shows error | Check EMAIL_USER and EMAIL_PASSWORD |
| Email in spam | Add to contacts / check Gmail settings |
| SMS not working | SMS is optional - email works alone |
| Can't find app password | Enable 2-Step Verification first |

---

## 🎊 SUCCESS INDICATORS

You'll know it's working when:
- ✅ Admin modal shows blue notification alert
- ✅ Modal shows "Sending notifications..."
- ✅ Green success message appears
- ✅ Email arrives in customer inbox
- ✅ Email has beautiful formatting
- ✅ Email includes tracking link

---

**Ready? Start with Step 1 above! ⬆️**

Version: 1.0
Date: March 7, 2026
