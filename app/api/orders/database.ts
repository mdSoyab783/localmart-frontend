// app/api/orders/database.ts
export const sampleOrders = [
  {
    _id: "507f1f77bcf86cd799439011",
    orderId: "LM-2024-001",
    user: {
      name: "Soyab Khan",
      email: "khansoyab9748@gmail.com",
      phone: "+919844272532",
    },
    status: "Placed",
    items: [
      { id: 1, name: "Fresh Vegetables", price: 149, quantity: 2 },
      { id: 2, name: "Basmati Rice", price: 289, quantity: 1 },
    ],
    totalAmount: 587,
    deliveryFee: 50,
    shippingAddress: {
      name: "Soyab Khan",
      phone: "+91984272532",
      addressLine1: "House No. 12",
      addressLine2: "Main Market",
      city: "Nangal",
      state: "Punjab",
      pincode: "140126",
    },
    createdAt: new Date("2024-03-05T10:30:00Z").toISOString(),
    statusHistory: [],
  },
  {
    _id: "507f1f77bcf86cd799439012",
    orderId: "LM-2024-002",
    user: {
      name: "Rajesh Kumar",
      email: "rajesh@example.com",
      phone: "+919876543211",
    },
    status: "Confirmed",
    items: [
      { id: 3, name: "Skincare Kit", price: 349, quantity: 1 },
      { id: 4, name: "Cotton Kurti", price: 599, quantity: 1 },
    ],
    totalAmount: 988,
    deliveryFee: 0,
    shippingAddress: {
      name: "Rajesh Kumar",
      phone: "+919876543211",
      addressLine1: "Shop No. 5",
      addressLine2: "Market Road",
      city: "Nangal",
      state: "Punjab",
      pincode: "140126",
    },
    createdAt: new Date("2024-03-04T14:20:00Z").toISOString(),
    statusHistory: [{ status: "Confirmed", timestamp: new Date().toISOString() }],
  },
  {
    _id: "507f1f77bcf86cd799439013",
    orderId: "LM-2024-003",
    user: {
      name: "Priya Singh",
      email: "priya@example.com",
      phone: "+919876543212",
    },
    status: "Packed",
    items: [
      { id: 5, name: "Hand Sanitizer Pack", price: 99, quantity: 3 },
    ],
    totalAmount: 337,
    deliveryFee: 40,
    shippingAddress: {
      name: "Priya Singh",
      phone: "+919876543212",
      addressLine1: "Flat 201",
      addressLine2: "Green Plaza",
      city: "Nangal",
      state: "Punjab",
      pincode: "140126",
    },
    createdAt: new Date("2024-03-03T09:15:00Z").toISOString(),
    statusHistory: [
      { status: "Confirmed", timestamp: new Date(Date.now() - 86400000).toISOString() },
      { status: "Packed", timestamp: new Date().toISOString() },
    ],
  },
];

// Global database - in production use MongoDB
// Use globalThis to ensure it persists across hot-reloads in development
let ordersDatabase: typeof sampleOrders | null = (globalThis as any).__ordersDatabase || null;

function getDatabase() {
  if (!ordersDatabase) {
    console.log("Initializing database with sample data");
    ordersDatabase = [...sampleOrders];
    // Save to globalThis so it persists across hot-reloads
    (globalThis as any).__ordersDatabase = ordersDatabase;
  }
  return ordersDatabase;
}

export function getOrders(status?: string) {
  const db = getDatabase();
  if (status && status !== "") {
    const filtered = db.filter(o => o.status === status);
    console.log(`Filtering orders by status: ${status}. Found: ${filtered.length}`);
    return filtered;
  }
  console.log(`Getting all orders. Total: ${db.length}`);
  return db;
}

export function getOrderById(id: string) {
  const db = getDatabase();
  return db.find(o => String(o._id) === id);
}

export function updateOrder(id: string, updates: any) {
  const db = getDatabase();
  const index = db.findIndex(o => String(o._id) === id);
  if (index === -1) return null;

  const order = db[index];
  
  if (updates.status) {
    if (!order.statusHistory) {
      order.statusHistory = [];
    }
    order.statusHistory.push({
      status: updates.status,
      timestamp: new Date().toISOString(),
    });
    order.status = updates.status;
  }

  if (updates.note) (order as any).note = updates.note;
  if (updates.estimatedDelivery) (order as any).estimatedDelivery = updates.estimatedDelivery;

  db[index] = order;
  console.log(`Updated order ${id} to status: ${updates.status}`);
  return order;
}

export function createOrder(orderData: any) {
  const db = getDatabase();
  const newOrder = {
    _id: new Date().getTime().toString(),
    orderId: `LM-${Date.now()}`,
    ...orderData,
    createdAt: new Date().toISOString(),
    statusHistory: [],
  };

  db.push(newOrder);
  console.log(`Created new order: ${newOrder.orderId}`);
  return newOrder;
}
