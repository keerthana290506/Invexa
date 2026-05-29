const mongoose = require('mongoose');
 
const alertSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    productName: { type: String, required: true },
    sku: { type: String, required: true },
    alertType: {
      type: String,
      enum: ['low_stock', 'out_of_stock', 'restock_suggestion'],
      required: true,
    },
    currentStock: { type: Number, required: true },
    reorderLevel: { type: Number, required: true },
    predictedDemand: { type: Number },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    isResolved: { type: Boolean, default: false },
    emailSent: { type: Boolean, default: false },
  },
  { timestamps: true }
);
 
module.exports = mongoose.model('Alert', alertSchema);