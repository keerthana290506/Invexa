const express = require("express");
const router = express.Router();

const {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  exportProductsCSV,
  getCategories,
} = require("../controllers/productControllers");

const { protect } = require("../middleware/auth");
const { adminOnly } = require("../middleware/roleCheck");

/* =========================
   ALL ROUTES REQUIRE LOGIN
========================= */
router.use(protect);

/* =========================
   PUBLIC (LOGGED-IN USERS)
========================= */
router.get("/", getProducts);
router.get("/categories", getCategories);
router.get("/:id", getProduct);

/* =========================
   ADMIN ONLY ROUTES
========================= */
router.post("/", adminOnly, createProduct);
router.put("/:id", adminOnly, updateProduct);
router.delete("/:id", adminOnly, deleteProduct);
router.get("/export/csv", adminOnly, exportProductsCSV);

module.exports = router;