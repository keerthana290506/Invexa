require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');
 
const User = require('../models/User');
const Product = require('../models/Product');
const Sale = require('../models/Sale');
 
const seedData = async () => {
  await connectDB();
 
  console.log('🌱 Starting seed...');
 
  // Clear collections
  await User.deleteMany();
  await Product.deleteMany();
  await Sale.deleteMany();
 
  // --- Create Users ---
  const adminPassword = await bcrypt.hash('admin123', 10);
  const staffPassword = await bcrypt.hash('staff123', 10);
 
  const users = await User.insertMany([
    {
      name: 'Admin User',
      email: 'admin@inventory.com',
      password: adminPassword,
      role: 'admin',
    },
    {
      name: 'Staff User',
      email: 'staff@inventory.com',
      password: staffPassword,
      role: 'staff',
    },
  ]);
 
  console.log('✅ Users seeded');
 
  // --- Create Products ---
  const products = await Product.insertMany([
    { name: 'Laptop Pro 15"', sku: 'ELEC-001', category: 'Electronics', price: 75000, costPrice: 60000, stockQuantity: 25, reorderLevel: 5, unit: 'pcs', supplier: 'TechCorp' },
    { name: 'Wireless Mouse', sku: 'ELEC-002', category: 'Electronics', price: 1500, costPrice: 900, stockQuantity: 8, reorderLevel: 10, unit: 'pcs', supplier: 'TechCorp' },
    { name: 'Mechanical Keyboard', sku: 'ELEC-003', category: 'Electronics', price: 4500, costPrice: 3000, stockQuantity: 3, reorderLevel: 5, unit: 'pcs', supplier: 'KeyMaster' },
    { name: 'USB-C Hub 7-in-1', sku: 'ELEC-004', category: 'Electronics', price: 2800, costPrice: 1800, stockQuantity: 0, reorderLevel: 5, unit: 'pcs', supplier: 'HubTech' },
    { name: 'Office Chair', sku: 'FURN-001', category: 'Furniture', price: 12000, costPrice: 8000, stockQuantity: 15, reorderLevel: 3, unit: 'pcs', supplier: 'FurniPro' },
    { name: 'Standing Desk', sku: 'FURN-002', category: 'Furniture', price: 35000, costPrice: 25000, stockQuantity: 7, reorderLevel: 2, unit: 'pcs', supplier: 'DeskPro' },
    { name: 'A4 Paper Ream 500 Sheets', sku: 'OFF-001', category: 'Office Supplies', price: 450, costPrice: 300, stockQuantity: 2, reorderLevel: 20, unit: 'reams', supplier: 'PaperMart' },
    { name: 'Ballpoint Pen Box', sku: 'OFF-002', category: 'Office Supplies', price: 120, costPrice: 80, stockQuantity: 50, reorderLevel: 15, unit: 'boxes', supplier: 'StatStores' },
    { name: 'Stapler Heavy Duty', sku: 'OFF-003', category: 'Office Supplies', price: 850, costPrice: 550, stockQuantity: 20, reorderLevel: 5, unit: 'pcs', supplier: 'StatStores' },
    { name: 'Hand Sanitizer 500ml', sku: 'HB-001', category: 'Health & Beauty', price: 180, costPrice: 100, stockQuantity: 60, reorderLevel: 20, unit: 'bottles', supplier: 'CleanCo' },
    { name: 'Face Mask Box (50 pcs)', sku: 'HB-002', category: 'Health & Beauty', price: 350, costPrice: 200, stockQuantity: 4, reorderLevel: 10, unit: 'boxes', supplier: 'SafeGuard' },
    { name: 'Green Tea 100 Bags', sku: 'FB-001', category: 'Food & Beverages', price: 250, costPrice: 150, stockQuantity: 45, reorderLevel: 10, unit: 'boxes', supplier: 'TeaHouse' },
    { name: 'Coffee Beans 1kg', sku: 'FB-002', category: 'Food & Beverages', price: 900, costPrice: 600, stockQuantity: 12, reorderLevel: 5, unit: 'kg', supplier: 'BrewMaster' },
    { name: 'Yoga Mat', sku: 'SPT-001', category: 'Sports', price: 1200, costPrice: 700, stockQuantity: 18, reorderLevel: 5, unit: 'pcs', supplier: 'FitGear' },
    { name: 'Resistance Bands Set', sku: 'SPT-002', category: 'Sports', price: 650, costPrice: 350, stockQuantity: 30, reorderLevel: 8, unit: 'sets', supplier: 'FitGear' },
  ]);
 
  console.log('✅ Products seeded');
 
  // --- Create Sales (last 30 days) ---
  const salesData = [];
  const completedProductIds = [
    products[0], products[1], products[2], products[4],
    products[7], products[9], products[11], products[12], products[14],
  ];
 
  for (let i = 0; i < 30; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
 
    const numSales = Math.floor(Math.random() * 3) + 1;
    for (let j = 0; j < numSales; j++) {
      const product = completedProductIds[Math.floor(Math.random() * completedProductIds.length)];
      const qty = Math.floor(Math.random() * 3) + 1;
      const itemTotal = product.price * qty;
 
      salesData.push({
        invoiceNumber: `INV-${String(salesData.length + 1).padStart(6, '0')}`,
        items: [
          {
            productId: product._id,
            productName: product.name,
            sku: product.sku,
            quantitySold: qty,
            unitPrice: product.price,
            totalPrice: itemTotal,
          },
        ],
        totalAmount: itemTotal,
        date,
        customerName: `Customer ${Math.floor(Math.random() * 100) + 1}`,
        paymentMethod: ['cash', 'card', 'upi'][Math.floor(Math.random() * 3)],
        status: 'completed',
        createdBy: users[1]._id,
      });
    }
  }
 
  await Sale.insertMany(salesData);
  console.log('✅ Sales seeded');
 
  console.log('\n🎉 Seed complete!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Admin  → admin@inventory.com  / admin123');
  console.log('Staff  → staff@inventory.com  / staff123');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━');
 
  process.exit(0);
};
 
seedData().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});