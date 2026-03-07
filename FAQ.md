# ❓ FAQ - Frequently Asked Questions

## General Questions

### Q: Is the backend external or built-in?
**A:** The backend is now **built into your Next.js app**! No more external localhost:8000 needed.
- **Before:** External Express.js server at localhost:8000
- **Now:** API routes in `/app/api/` within your Next.js app
- **Benefits:** No extra server to manage, everything in one place

### Q: Will my data persist after server restart?
**A:** Currently **NO** - data is stored in RAM and resets when server restarts.
- **Current:** In-memory storage (fast for development)
- **Production:** Need to integrate MongoDB
- **Timeline:** See `BACKEND_API_SETUP.md` for MongoDB migration guide

### Q: Can I use this with my current database?
**A:** **YES!** The database layer is in `/app/api/orders/database.ts`
- Easy to swap in-memory for MongoDB
- Or connect to any other database
- No changes needed to API endpoints

### Q: How do I enable email notifications?
**A:** Add these to `.env.local`:
```
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```
Then restart dev server. See `BACKEND_API_SETUP.md` for detailed steps.

## Technical Questions

### Q: What framework is being used?
**A:** Next.js 16.1.6 with React 19 and TypeScript

### Q: Where are the API files?
**A:**
- `/app/api/orders/all/route.ts` - GET all orders
- `/app/api/orders/[id]/route.ts` - GET/PUT single order
- `/app/api/orders/database.ts` - Shared database logic
- `/app/api/notifications/route.ts` - Email/SMS notifications

### Q: How do I add more orders?
**A:** Edit `/app/api/orders/database.ts` and add to `sampleOrders` array

### Q: Can I change the status options?
**A:** Yes! Edit `/app/admin/orders/page.jsx` line 4:
```javascript
const STATUSES = ["Placed", "Confirmed", "Packed", "Shipped", "Out for Delivery", "Delivered"];
```

### Q: What's the data structure for orders?
**A:** See `ARCHITECTURE_DIAGRAM.md` for complete JSON schema

## Troubleshooting Questions

### Q: Why can't I see my orders?
**A:** Check these in order:
1. Is dev server running? `lsof -i :3000 | grep LISTEN`
2. Is API responding? `curl http://localhost:3000/api/orders/all`
3. Open F12 console - any red errors?
4. Check Network tab - see GET request?

### Q: Why isn't the modal responding?
**A:** Most likely causes:
1. API endpoint failed - check Network tab (F12)
2. Console errors - check F12 Console tab
3. Try refreshing the page
4. Try a different order

### Q: Why is the notification failing?
**A:** Likely causes:
1. Email credentials not set (normal, error will show)
2. Gmail app password incorrect
3. Twilio credentials missing (SMS only)
4. Check `/app/api/notifications/route.ts` logs

### Q: Why are orders empty after I restart the server?
**A:** Because data is in-memory (RAM) and gets cleared on restart.
- This is **expected behavior** during development
- Switch to MongoDB for permanent storage
- Or use a `.db` file with SQLite

### Q: Why do I get a 404 error?
**A:** Common reasons:
1. Wrong URL path - double-check `/api/orders` spelling
2. Wrong order ID - make sure ID exists
3. Server not running - restart with `npm run dev`

### Q: Why is the admin page showing "Loading..."?
**A:** 
1. Wait a few seconds - it might be compiling
2. Refresh page (F5)
3. Check Network tab (F12) for failed requests
4. Check console for errors

## Feature Questions

### Q: Can I update multiple orders at once?
**A:** Currently **NO**, but you can:
1. Click each order individually
2. Or create a bulk update API route
3. Or implement in the `/app/admin/orders/page.jsx` file

### Q: Can customers see their order status?
**A:** Currently **YES** - at `/orders/page.tsx` and `/orders/track/[orderId]/page.jsx`
- But these don't connect to backend yet
- They need to be updated to fetch from API

### Q: Can I add more columns to the orders table?
**A:** **YES!** Edit `/app/admin/orders/page.jsx` in the JSX table section

### Q: Can I customize the email template?
**A:** **YES!** Edit `/app/api/notifications/route.ts`
- Look for email templates around line 20-40
- Change HTML, styling, colors as you like

### Q: Can I change notification statuses?
**A:** **YES!** Edit `/app/admin/orders/page.jsx` line 16:
```javascript
const NOTIFICATION_STATUSES = ["Confirmed", "Packed", "Out for Delivery", "Delivered"];
```

## Integration Questions

### Q: How do I connect to MongoDB?
**A:** 
1. Install MongoDB driver: `npm install mongodb`
2. Update `/app/api/orders/database.ts` with MongoDB functions
3. Set `MONGODB_URI` in `.env.local`
4. See `BACKEND_API_SETUP.md` for detailed guide

### Q: How do I add Razorpay payment?
**A:**
1. Install Razorpay SDK: `npm install razorpay`
2. Create payment endpoint: `/app/api/payments/route.ts`
3. Add payment form to checkout page
4. See Razorpay documentation for details

### Q: How do I add real-time updates?
**A:**
1. Socket.io is already in package.json
2. Create socket server: `/app/socket.ts`
3. Listen for order updates
4. Broadcast to clients in real-time

### Q: Can I deploy this to production?
**A:** **YES!** But first:
1. ✅ Integrate MongoDB (not in-memory storage)
2. ✅ Add authentication to admin routes
3. ✅ Set environment variables properly
4. ✅ Add rate limiting to notifications
5. ✅ Test everything thoroughly
6. Then deploy to Vercel, Heroku, or your server

## Performance Questions

### Q: Why is the first request slow?
**A:** Next.js compiles on first request (~1 second). This is normal.
- Subsequent requests are fast (<50ms)
- In production (Next.js build), it's instant

### Q: How many orders can the system handle?
**A:** Depends on storage method:
- **In-memory:** Limited by RAM (~10,000+ orders typical)
- **MongoDB:** Millions of orders easily
- **Response times:** Stay <100ms even with 1000+ orders

### Q: Is it slow compared to external API?
**A:** Actually **faster** because:
- No network latency
- Runs in same process
- No firewall/routing delays
- Direct database access

## Best Practices Questions

### Q: Should I use this code in production?
**A:** Not yet - you need to:
1. ✅ Switch to MongoDB (currently in-memory)
2. ✅ Add authentication (no auth required now)
3. ✅ Add rate limiting (none currently)
4. ✅ Add error logging (basic only)
5. ✅ Test thoroughly (manual testing only)

### Q: How do I make the system more secure?
**A:** 
1. Add JWT authentication check in routes
2. Validate user is admin before allowing updates
3. Add CORS restrictions
4. Use HTTPS in production
5. Validate all input data
6. Add rate limiting

### Q: How do I make it faster?
**A:**
1. Use MongoDB with proper indexes
2. Add caching layer (Redis)
3. Use CDN for static assets
4. Add pagination to orders list
5. Use database transactions

### Q: How do I make it more reliable?
**A:**
1. Add error handling to all routes
2. Add retry logic for notifications
3. Use message queue for emails
4. Add database backups
5. Add monitoring and alerts

## Migration Questions

### Q: Can I migrate from old localhost:8000 backend?
**A:** **YES!** Here's what changed:
- **Before:** `http://localhost:8000/api/orders/...`
- **Now:** `http://localhost:3000/api/orders/...`
- **Updated in:** `/app/admin/orders/page.jsx`

### Q: How do I transfer old data?
**A:**
1. Export data from old backend (JSON file)
2. Update `/app/api/orders/database.ts` with old data
3. Or write migration script to import into MongoDB
4. Test with different orders

### Q: What if I want to keep using the old backend?
**A:**
1. Revert changes in `/app/admin/orders/page.jsx`
2. Change API URLs back to `localhost:8000`
3. Make sure old server is running
4. But new API also works if you want!

## Support Questions

### Q: Where can I find more help?
**A:** 
- Check `BACKEND_API_SETUP.md` for setup issues
- Check `TESTING_GUIDE.md` for testing
- Check `ARCHITECTURE_DIAGRAM.md` for understanding
- Check `VERIFICATION_CHECKLIST.md` for verification
- Check code comments in `/app/api/` files

### Q: Can I modify the code?
**A:** **YES!** This is your code. Feel free to:
- Change endpoints
- Add new features
- Modify templates
- Customize anything

### Q: How do I report issues?
**A:**
1. Check console (F12) for error messages
2. Check Network tab for failed requests
3. Review the relevant `.md` file
4. Check code comments for hints

### Q: Is there a REST API documentation?
**A:** Yes! See:
- API Documentation in `BACKEND_API_SETUP.md`
- Example requests in `TESTING_GUIDE.md`
- Inline comments in `/app/api/` files

## Learning Questions

### Q: How does the notification system work?
**A:** Step by step:
1. Admin updates order status
2. Frontend calls: `PUT /api/orders/{id}`
3. Backend updates database
4. Frontend calls: `POST /api/notifications`
5. Notification endpoint sends email + SMS
6. Customer receives notification

### Q: How is the data structured?
**A:** See full schema in `ARCHITECTURE_DIAGRAM.md` JSON section

### Q: How should I organize my code?
**A:** Follow current structure:
- `/app/api/` - All API routes
- `/app/admin/` - Admin pages
- `/app/orders/` - Customer order pages
- `/lib/` - Shared utilities
- `/public/` - Static assets

## Conclusion

**Have a question not listed here?**
1. Check the documentation files
2. Review the code comments
3. Check this FAQ again
4. Try searching the code files

**Found a bug or want to suggest improvement?**
1. Note what went wrong
2. Check if it's in troubleshooting section
3. Review the code in relevant files
4. Implement the fix!

---

**Happy developing!** 🚀

Remember: This is **your** code. Modify it, break it, fix it, learn from it! 🎓
