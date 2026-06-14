import React from "react";
import { useWishlist } from "../../context/WishlistContext";
import { useCart } from "../../context/CartContext";

export default function WishlistPage() {
  const { wishlist, remove, moveToCart } = useWishlist();
  const { reload } = useCart();

  if (!wishlist) return <div className="p-6">No items in wishlist.</div>;

  const handleMove = async (courseId) => {
    const res = await moveToCart(courseId);
    // Optionally reload cart context if API returned cart
    await reload();
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Your Wishlist</h2>
      <div className="space-y-4">
        {wishlist.courses.map((c) => (
          <div
            key={c._id}
            className="p-4 border rounded flex justify-between items-center"
          >
            <div>
              <div className="font-medium">{c.title}</div>
              <div className="text-sm text-gray-500">
                ${c.price?.toFixed?.() ?? "0"}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleMove(c._id)}
                className="px-3 py-1 bg-blue-600 text-white"
              >
                Move to cart
              </button>
              <button onClick={() => remove(c._id)} className="text-red-500">
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
