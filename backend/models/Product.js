const mongoose = require('mongoose');
 
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [100, 'Product name cannot exceed 100 characters'],
    },
    sku: {
      type: String,
      required: [true, 'SKU is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      enum: [
        'Electronics',
        'Clothing',
        'Food & Beverages',
        'Office Supplies',
        'Furniture',
        'Health & Beauty',
        'Sports',
        'Toys',
        'Automotive',
        'Other',
      ],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    costPrice: {
      type: Number,
      min: [0, 'Cost price cannot be negative'],
      default: 0,
    },
    stockQuantity: {
      type: Number,
      required: [true, 'Stock quantity is required'],
      min: [0, 'Stock quantity cannot be negative'],
      default: 0,
    },
    reorderLevel: {
      type: Number,
      required: [true, 'Reorder level is required'],
      min: [0, 'Reorder level cannot be negative'],
      default: 10,
    },
    unit: {
      type: String,
      default: 'pcs',
      trim: true,
    },
    supplier: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    alertSent: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);
 
// Virtual: isLowStock
productSchema.virtual('isLowStock').get(function () {
  return this.stockQuantity <= this.reorderLevel;
});
 
// Virtual: profit margin
productSchema.virtual('profitMargin').get(function () {
  if (this.costPrice === 0) return 0;
  return (((this.price - this.costPrice) / this.price) * 100).toFixed(2);
});
 
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });
 
// Index for search
productSchema.index({ name: 'text', sku: 'text', category: 'text' });
 
module.exports = mongoose.model('Product', productSchema);