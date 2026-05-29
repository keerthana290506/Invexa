import { useEffect, useState } from "react";
import axiosInstance from "../api/axios";
import Layout from "../components/layout/Layout";

const Stock = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStock = async () => {
      try {
        const res = await axiosInstance.get("/products");

        console.log("STOCK RESPONSE:", res);

        // ✅ FIX: correct access (because axios returns response.data)
        setProducts(res?.data || []);
      } catch (err) {
        console.error("Stock fetch error:", err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStock();
  }, []);

  const getStatus = (qty) => {
    if (qty === 0) return "Out of Stock";
    if (qty <= 5) return "Low Stock";
    return "In Stock";
  };

  const getStatusColor = (qty) => {
    if (qty === 0) return "text-red-600";
    if (qty <= 5) return "text-yellow-600";
    return "text-green-600";
  };

  if (loading) {
    return (
      <Layout>
        <div className="p-6">Loading stock...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Stock Management</h1>

          <div className="text-sm text-gray-500">
            Total Products: {products.length}
          </div>
        </div>

        {/* EMPTY STATE */}
        {products.length === 0 ? (
          <div className="bg-white p-6 rounded-xl shadow text-center text-gray-500">
            No products found
          </div>
        ) : (
          /* TABLE */
          <div className="bg-white shadow rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 text-left">
                <tr>
                  <th className="p-3">Name</th>
                  <th className="p-3">SKU</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Stock</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>

              <tbody>
                {products.map((p) => (
                  <tr key={p._id} className="border-t hover:bg-gray-50">
                    <td className="p-3 font-medium">{p.name}</td>
                    <td className="p-3">{p.sku}</td>
                    <td className="p-3">{p.category}</td>
                    <td className="p-3">{p.stockQuantity}</td>
                    <td className={`p-3 font-semibold ${getStatusColor(p.stockQuantity)}`}>
                      {getStatus(p.stockQuantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Stock;