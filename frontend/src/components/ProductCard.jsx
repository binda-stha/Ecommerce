import React from "react";
import { Star, Plus, Store } from "lucide-react";
import { useCart } from "../context/CartContext";

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart(product);
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={14}
        className={
          i < rating ? "text-yellow-400 fill-current" : "text-gray-300"
        }
      />
    ));
  };

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group overflow-hidden">
      <div className="relative aspect-square overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute top-3 right-3 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
          +{product.points} pts
        </div>
        <div className="absolute top-3 left-3 bg-white/20 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
          <Store size={12} />
          <span>{product.shop}</span>
        </div>
      </div>
      <div className="p-4">
        <div className="text-xs text-gray-500 mb-1">by {product.trader}</div>
        <h3 className="font-semibold text-gray-900 mb-2">{product.name}</h3>
        <div className="flex items-center space-x-1 mb-3">
          <div className="flex space-x-1">{renderStars(product.rating)}</div>
          <span className="text-sm text-gray-600">({product.rating})</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-gray-900">
            ₹{product.price.toLocaleString()}
          </span>
          <button
            onClick={handleAddToCart}
            className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg transition-all duration-200"
          >
            <Plus size={20} />
          </button>
        </div>
        <div className="mt-3 pt-3 border-t border-gray-200">
          <span className="text-xs text-gray-500 uppercase tracking-wide">
            {product.category}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
