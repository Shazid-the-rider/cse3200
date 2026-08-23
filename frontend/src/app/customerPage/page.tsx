"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

interface Product {
  productId: string;
  productName: string;
  images: string[];
  reviews: number;
  ratings: number;
  description: string;
  stock: number;
}

export default function page() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/products/fetch"
        );

        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }

        const data = await response.json();


console.log("API DATA:", data);
console.log("PRODUCT:", data.products[0]);
console.log("IMAGES:", data.products[0]?.images);


setProducts(data.products);
        setProducts(data.products || data);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Loading products...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="w-full py-6 px-6 bg-slate-700">
        <h1 className="text-2xl font-bold text-white">
          Customer Page
        </h1>
      </div>

      {/* Products */}
      <div className="max-w-7xl mx-auto px-6 py-10">

        <h2 className="text-2xl font-bold mb-6">
          Our Products
        </h2>

        {products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500">
              No products found
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

            {products.map((product) => (

              <div
                key={product.productId}
                className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition"
              >

                {/* Image */}
                <div className="w-full h-64 bg-gray-100 flex items-center justify-center">
                  {product.images?.length > 0 ? (
                    <Image
                      src={product.images[0]}
                      alt={product.productName}
                      width={400}
                      height={300}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <p className="text-gray-400">
                      No Image
                    </p>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-5">

                  <h3 className="text-xl font-bold text-gray-800">
                    {product.productName}
                  </h3>

                  <p className="text-sm text-gray-400 mt-1">
                    ID: {product.productId}
                  </p>

                  {/* Rating */}
                  <div className="flex items-center gap-2 mt-3">

                    <span className="text-yellow-500">
                      ★
                    </span>

                    <span className="font-semibold">
                      {product.ratings}
                    </span>

                    <span className="text-gray-400">
                      ({product.reviews} reviews)
                    </span>

                  </div>

                  {/* Description */}
                  <p className="text-gray-600 mt-3 line-clamp-2">
                    {product.description}
                  </p>

                  {/* Stock */}
                  <div className="mt-4">

                    {product.stock > 0 ? (
                      <span className="text-green-600 font-semibold">
                        In Stock ({product.stock})
                      </span>
                    ) : (
                      <span className="text-red-600 font-semibold">
                        Out of Stock
                      </span>
                    )}

                  </div>

                  {/* Button */}
                  <button
                    disabled={product.stock === 0}
                    className="w-full mt-5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 rounded-xl font-semibold"
                  >
                    View Product
                  </button>

                </div>

              </div>

            ))}

          </div>
        )}

      </div>
    </div>
  );
}