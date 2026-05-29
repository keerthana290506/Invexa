import { useEffect, useState } from "react";
import axiosInstance from "../api/axios";

const Billing = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState("");

  // ================= LOAD PRODUCTS =================
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axiosInstance.get("/products");
        setProducts(res.data.data || res.data || []);
      } catch (err) {
        console.error(err);
      }
    };

    fetchProducts();
  }, []);

  // ================= ADD TO CART =================
  const addToCart = (product) => {
    const exists = cart.find((i) => i.productId === product._id);

    if (exists) {
      setCart(
        cart.map((i) =>
          i.productId === product._id
            ? {
                ...i,
                quantitySold: i.quantitySold + 1,
                totalPrice:
                  (i.quantitySold + 1) * i.unitPrice,
              }
            : i
        )
      );
    } else {
      setCart([
        ...cart,
        {
          productId: product._id,
          productName: product.name,
          sku: product.sku,
          unitPrice: product.price,
          quantitySold: 1,
          totalPrice: product.price,
        },
      ]);
    }
  };

  // ================= UPDATE QTY =================
  const updateQty = (id, qty) => {
    setCart(
      cart.map((i) =>
        i.productId === id
          ? {
              ...i,
              quantitySold: Number(qty),
              totalPrice: i.unitPrice * Number(qty),
            }
          : i
      )
    );
  };

  // ================= REMOVE ITEM =================
  const removeItem = (id) => {
    setCart(cart.filter((i) => i.productId !== id));
  };

  // ================= TOTAL =================
  const totalAmount = cart.reduce(
    (sum, i) => sum + i.totalPrice,
    0
  );

  // ================= CHECKOUT =================
  const handleCheckout = async () => {
    try {
      if (!cart.length) {
        alert("Cart is empty!");
        return;
      }

      await axiosInstance.post("/sales", {
        items: cart,
        customerName: customerName || "Walk-in Customer",
        paymentMethod: "cash",
      });

      alert("Sale Created Successfully!");

      setCart([]);
      setCustomerName("");
    } catch (err) {
      console.error(err);
      alert("Sale failed");
    }
  };

  return (
    <div className="p-6 grid grid-cols-2 gap-6">

      {/* ================= PRODUCTS ================= */}
      <div>
        <h2 className="text-xl font-bold mb-4">
          Products
        </h2>

        <div className="space-y-3">
          {products.map((p) => (
            <div
              key={p._id}
              className="p-3 border rounded flex justify-between"
            >
              <div>
                <p className="font-semibold">{p.name}</p>
                <p className="text-sm text-gray-500">
                  ₹{p.price}
                </p>
              </div>

              <button
                onClick={() => addToCart(p)}
                className="bg-blue-500 text-white px-3 py-1 rounded"
              >
                Add
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ================= BILL ================= */}
      <div>
        <h2 className="text-xl font-bold mb-4">
          Billing
        </h2>

        <input
          type="text"
          placeholder="Customer Name"
          value={customerName}
          onChange={(e) =>
            setCustomerName(e.target.value)
          }
          className="border p-2 w-full mb-4"
        />

        <div className="space-y-3">
          {cart.map((item) => (
            <div
              key={item.productId}
              className="border p-3 rounded"
            >
              <p className="font-semibold">
                {item.productName}
              </p>

              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  value={item.quantitySold}
                  min="1"
                  onChange={(e) =>
                    updateQty(
                      item.productId,
                      e.target.value
                    )
                  }
                  className="border p-1 w-16"
                />

                <p>₹{item.totalPrice}</p>

                <button
                  onClick={() =>
                    removeItem(item.productId)
                  }
                  className="text-red-500"
                >
                  X
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* TOTAL */}
        <div className="mt-5 p-3 bg-gray-100 rounded">
          <h3 className="text-lg font-bold">
            Total: ₹{totalAmount}
          </h3>
        </div>

        {/* CHECKOUT */}
        <button
          onClick={handleCheckout}
          className="mt-4 w-full bg-green-600 text-white py-2 rounded"
        >
          Generate Bill
        </button>
      </div>
    </div>
  );
};

export default Billing;