const Sale = require("../models/Sale");
const Product = require("../models/Product");

const createSale = async (req, res) => {
  try {
    const { items, customerName, paymentMethod } = req.body;

    let totalAmount = 0;

    // process each item
    for (let item of items) {
      const product = await Product.findById(item.productId);

      if (!product) continue;

      const totalPrice = product.price * item.quantitySold;

      totalAmount += totalPrice;

      // reduce stock
      product.stockQuantity -= item.quantitySold;
      await product.save();

      // update item fields
      item.productName = product.name;
      item.sku = product.sku;
      item.unitPrice = product.price;
      item.totalPrice = totalPrice;
    }

    const sale = await Sale.create({
      items,
      totalAmount,
      customerName,
      paymentMethod,
    });

    res.json({
      success: true,
      message: "Sale created successfully",
      data: sale,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createSale };