# 🧪 Complete Testing Guide

This guide will walk you through testing the entire order management and notification system end-to-end.

## Step 1: Verify API is Running

```bash
# Check if server is running on port 3000
curl -s http://localhost:3000/api/orders/all | jq '.total'
# Should output: 3
```

## Step 2: Test Admin Dashboard

### Via Browser:
1. Open: `http://localhost:3000/admin/orders`
2. You should see 3 orders in a table
3. Each order has an "Update Status" button

### Via API:
```bash
# Get all orders
curl -s http://localhost:3000/api/orders/all | jq '.'
```

## Step 3: Manual Order Status Update via API

```bash
# Update order LM-2024-001 from "Placed" to "Confirmed"
curl -X PUT http://localhost:3000/api/orders/507f1f77bcf86cd799439011 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "Confirmed",
    "note": "Order confirmed by admin"
  }'

# Should return:
# {
#   "success": true,
#   "message": "Order status updated",
#   "order": {
#     "status": "Confirmed",
#     "statusHistory": [
#       {"status": "Confirmed", "timestamp": "..."}
#     ]
#   }
# }
```

## Step 4: Send Notification

```bash
# Send notification for order status change
curl -X POST http://localhost:3000/api/notifications \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "LM-2024-001",
    "status": "Confirmed",
    "customerName": "Soyab Khan",
    "email": "soyab@example.com",
    "phoneNumber": "+919876543210",
    "totalAmount": 587,
    "address": "House No. 12, Main Market, Nangal"
  }'

# Should return:
# {
#   "success": true,
#   "message": "Notification requests processed"
# }
```

## Step 5: Browser Interactive Test

1. **Open Admin Dashboard**: `http://localhost:3000/admin/orders`

2. **Click "Update Status" button** on the first order (Soyab Khan)

3. **Select new status** from dropdown (e.g., "Confirmed")

4. **Enter optional note** (e.g., "Confirmed - processing now")

5. **Click "Confirm Update"**

6. **Expected behavior:**
   - Modal shows "Sending..." status
   - After 1-2 seconds, shows "Sent!" ✅
   - Order status in table updates
   - Modal closes automatically

7. **Check Console** (F12):
   - No red errors
   - Should see: "Notification sent:" message

## Step 6: Verify Data Updates

### Check updated order:
```bash
curl -s http://localhost:3000/api/orders/507f1f77bcf86cd799439011 | jq '.status'
# Should output: "Confirmed"
```

### Check all orders with filter:
```bash
# Get only "Confirmed" orders
curl -s "http://localhost:3000/api/orders/all?status=Confirmed" | jq '.orders | length'
```

## Step 7: Test Multiple Status Transitions

### Try the full order lifecycle:

1. **Placed** → Click Update → Change to **Confirmed** → Click Confirm
2. **Confirmed** → Click Update → Change to **Packed** → Click Confirm
3. **Packed** → Click Update → Change to **Shipped** → Click Confirm
4. **Shipped** → Click Update → Change to **Out for Delivery** → Click Confirm
5. **Out for Delivery** → Click Update → Change to **Delivered** → Click Confirm

### Expected results:
- Each transition should trigger a notification
- Modal should show "Sending..." then "Sent!" or "Failed"
- Table should update after modal closes
- Status history should accumulate in the order

## Step 8: Error Handling Test

### Try invalid order ID:
```bash
curl -s http://localhost:3000/api/orders/invalid-id-123
# Should return: { "error": "Order not found" } (404)
```

### Try malformed request:
```bash
curl -X PUT http://localhost:3000/api/orders/507f1f77bcf86cd799439011 \
  -H "Content-Type: application/json" \
  -d '{"invalid": "data"}'
# Should still work (optional fields)
```

## Test Results Checklist

- [ ] API returns 3 sample orders
- [ ] Can fetch specific order by ID
- [ ] Can update order status via API
- [ ] Status history tracks all changes
- [ ] Admin dashboard loads without errors
- [ ] Can update status from browser
- [ ] Notification sends after status update
- [ ] Modal shows status properly (Sending/Sent/Failed)
- [ ] Table updates after modal closes
- [ ] Filter by status works
- [ ] Error responses are correct (404, etc.)

## Performance Benchmarks

Expected response times on localhost:

| Endpoint | Method | Time | Notes |
|----------|--------|------|-------|
| `/api/orders/all` | GET | <50ms | First request compiles (~3ms) |
| `/api/orders/{id}` | GET | <20ms | After compilation |
| `/api/orders/{id}` | PUT | <20ms | Database update |
| `/api/notifications` | POST | 1000-2000ms | Includes email/SMS delays |

## Production Considerations

Before deploying to production:

1. **Replace in-memory database** with MongoDB
   - Update: `/app/api/orders/database.ts`
   - Add connection pooling
   - Add indexes for performance

2. **Add authentication** to admin endpoints
   - Check JWT token in request headers
   - Validate user role is "admin"

3. **Set up environment variables** properly
   - Create `.env.production` in deployment environment
   - Configure EMAIL_USER, EMAIL_PASSWORD
   - Configure TWILIO credentials

4. **Add rate limiting**
   - Prevent abuse of notification endpoint
   - Limit status updates per user/minute

5. **Add logging**
   - Log all order status changes
   - Log failed notifications
   - Monitor email/SMS delivery

6. **Add monitoring**
   - Alert on failed status updates
   - Alert on notification failures
   - Track API response times

## Common Issues & Solutions

### Issue: "Order not found" when updating
**Solution:** Verify you're using the correct order `_id` (not `orderId`)

### Issue: Notification shows "Failed"
**Solution:** Check browser console, likely missing email credentials in `.env.local`

### Issue: Modal keeps loading
**Solution:** Check network tab (F12) for failed API requests

### Issue: Status doesn't update in table
**Solution:** Refresh page or check console for JavaScript errors

---

✅ **Once all tests pass, your order management system is production-ready!**
