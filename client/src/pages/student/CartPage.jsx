import React from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";

export default function CartPage() {
  const { cart, remove, clear } = useCart();
  const navigate = useNavigate();

  if (!cart) return <div className="p-6">Your cart is empty.</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Your Cart</h2>
      <div className="space-y-4">
        {cart.items.map((item) => (
          <div
            key={item._id}
            className="p-4 border rounded flex justify-between items-center"
          >
            <div>
              <div className="font-medium">{item.title}</div>
              <div className="text-sm text-gray-500">
                ${item.price?.toFixed?.() ?? "0"}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button onClick={() => remove(item._id)} className="text-red-500">
                Remove
              </button>
            </div>
          </div>
        ))}

        <div className="p-4 border rounded">
          <div className="flex justify-between">
            <div>Subtotal</div>
            <div>${cart.summary.subtotal.toFixed(2)}</div>
          </div>
          <div className="mt-4 flex space-x-2">
            <button onClick={clear} className="px-4 py-2 bg-red-500 text-white">
              Clear Cart
            </button>
            <button
              onClick={() => navigate("/checkout")}
              className="px-4 py-2 bg-green-600 text-white"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
