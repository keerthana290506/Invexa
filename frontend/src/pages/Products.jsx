import { useEffect, useState } from "react";
import Layout from "../components/layout/Layout";
import { productAPI } from "../api/products";
import { getCategories } from "../api/category";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    category: "",
    price: "",
    costPrice: "",
    stockQuantity: "",
    reorderLevel: "",
    unit: "",
  });

  /* FETCH PRODUCTS */
  const fetchProducts = async () => {
    try {
      const res = await productAPI.getProducts();
      setProducts(res?.data?.data || []);
    } catch (error) {
      console.log("Products error:", error);
    }
  };

  /* FETCH CATEGORIES WITH FALLBACK */
  const fetchCategories = async () => {
    try {
      const res = await getCategories();

      const data =
        res?.data?.data ||
        res?.data ||
        [];

      // If backend empty → fallback demo categories
      const finalCategories =
        Array.isArray(data) && data.length > 0
          ? data
          : [
              { _id: "1", name: "Food" },
              { _id: "2", name: "Clothing" },
              { _id: "3", name: "Electronics" },
              { _id: "4", name: "Furniture" },
              { _id: "5", name: "Beauty" },
            ];

      setCategories(finalCategories);
    } catch (error) {
      console.log("Categories error:", error);

      // fallback even if API fails
      setCategories([
        { _id: "1", name: "Food" },
        { _id: "2", name: "Clothing" },
        { _id: "3", name: "Electronics" },
      ]);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await productAPI.createProduct(formData);

      alert("Product Added Successfully");

      setFormData({
        name: "",
        sku: "",
        category: "",
        price: "",
        costPrice: "",
        stockQuantity: "",
        reorderLevel: "",
        unit: "",
      });

      fetchProducts();
    } catch (error) {
      console.log(error);
      alert("Failed to add product");
    }
  };

  const handleDelete = async (id) => {
    try {
      await productAPI.deleteProduct(id);
      alert("Product Deleted");
      fetchProducts();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Layout>
      <h1 className="text-3xl font-bold mb-6">
        Product Management
      </h1>

      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-2 gap-4 bg-white p-5 rounded-xl shadow"
      >
        <input
          type="text"
          name="name"
          placeholder="Product Name"
          value={formData.name}
          onChange={handleChange}
          className="border p-3 rounded"
          required
        />

        <input
          type="text"
          name="sku"
          placeholder="SKU"
          value={formData.sku}
          onChange={handleChange}
          className="border p-3 rounded"
          required
        />
        <select
  name="category"
  value={formData.category}
  onChange={(e) =>
    setFormData({ ...formData, category: e.target.value })
  }
  className="border p-3 rounded"
>
  <option value="">Select Category</option>

  {categories.map((cat) => (
    <option key={cat._id} value={cat.name}>
      {cat.name}
    </option>
  ))}
</select>

        <input
          type="number"
          name="price"
          placeholder="Selling Price"
          value={formData.price}
          onChange={handleChange}
          className="border p-3 rounded"
          required
        />

        <input
          type="number"
          name="costPrice"
          placeholder="Cost Price"
          value={formData.costPrice}
          onChange={handleChange}
          className="border p-3 rounded"
          required
        />

        <input
          type="number"
          name="stockQuantity"
          placeholder="Stock Quantity"
          value={formData.stockQuantity}
          onChange={handleChange}
          className="border p-3 rounded"
          required
        />

        <input
          type="number"
          name="reorderLevel"
          placeholder="Reorder Level"
          value={formData.reorderLevel}
          onChange={handleChange}
          className="border p-3 rounded"
          required
        />

        <input
          type="text"
          name="unit"
          placeholder="Unit"
          value={formData.unit}
          onChange={handleChange}
          className="border p-3 rounded"
          required
        />

        <button
          type="submit"
          className="bg-blue-600 text-white py-3 rounded col-span-2"
        >
          Add Product
        </button>
      </form>

      {/* TABLE */}
      <div className="bg-white mt-8 p-5 rounded-xl shadow overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">SKU</th>
              <th className="p-3 text-left">Category</th>
              <th className="p-3 text-left">Price</th>
              <th className="p-3 text-left">Stock</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {products.map((product) => (
              <tr key={product._id} className="border-b">
                <td className="p-3">{product.name}</td>
                <td className="p-3">{product.sku}</td>
                <td className="p-3">{product.category}</td>
                <td className="p-3">₹{product.price}</td>
                <td className="p-3">{product.stockQuantity}</td>
                <td className="p-3">
                  <button
                    onClick={() => handleDelete(product._id)}
                    className="bg-red-500 text-white px-3 py-1 rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
};

export default Products;