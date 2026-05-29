import { useEffect, useState } from "react";
import axiosInstance from "../api/axios";
import Layout from "../components/layout/Layout";

const Sales = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  // ================= FETCH SALES =================
  useEffect(() => {
    const fetchSales = async () => {
      try {
        const res = await axiosInstance.get("/sales");

        // backend returns { success, data }
        setSales(res.data || []);
      } catch (err) {
        console.error("Sales fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSales();
  }, []);

  // ================= LOADING =================
  if (loading) {
    return (
      <Layout>
        <p>Loading sales...</p>
      </Layout>
    );
  }

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-5">
        Sales History
      </h1>

      {sales.length === 0 ? (
        <p>No sales found</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border">Invoice</th>
                <th className="p-2 border">Customer</th>
                <th className="p-2 border">Amount</th>
                <th className="p-2 border">Payment</th>
                <th className="p-2 border">Date</th>
              </tr>
            </thead>

            <tbody>
              {sales.map((sale) => (
                <tr key={sale._id}>
                  <td className="p-2 border">
                    {sale.invoiceNumber}
                  </td>

                  <td className="p-2 border">
                    {sale.customerName}
                  </td>

                  <td className="p-2 border">
                    ₹{sale.totalAmount}
                  </td>

                  <td className="p-2 border">
                    {sale.paymentMethod}
                  </td>

                  <td className="p-2 border">
                    {new Date(sale.date).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
};

export default Sales;