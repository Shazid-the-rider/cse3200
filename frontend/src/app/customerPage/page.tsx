
"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface Product {
  _id?: string;
  productId: string;
  productName: string;
  images: string[];
  reviews: number;
  ratings: number;
  description: string;
  stock: number;
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function CustomerPage() {
    const searchParams = useSearchParams();
  const adminId = searchParams.get("adminId");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
       const response = await fetch(
  `${API_URL}/products/fetch?adminId=${encodeURIComponent(adminId || "")}`
);

        if (!response.ok) {
           const errorData = await response.json();

  console.error("API Error:", response.status, errorData);

  throw new Error(
    errorData.message || `Failed to fetch products: ${response.status}`
  );
        }

        const data = await response.json();

        setProducts(data.products || data || []);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = products.filter((product) => {
    const query = search.trim().toLowerCase();

    return (
      product.productName?.toLowerCase().includes(query) ||
      product.productId?.toLowerCase().includes(query)
    );
  });

  const getImageUrl = (image?: string) => {
    if (!image) return "";

    if (image.startsWith("http://") || image.startsWith("https://")) {
      return image;
    }

    // Backend relative path, e.g. uploads/products/image.jpeg
    const normalizedPath = image
      .replace(/\\/g, "/")
      .replace(/^\/+/, "");

    return `${API_URL}/${normalizedPath}`;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-lg text-gray-600">Loading products...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-slate-800 px-6 py-6 shadow-md">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Customer Page
            </h1>
            <p className="mt-1 text-sm text-slate-300">
              Explore our products
            </p>
          </div>

          <div className="w-full sm:max-w-md">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by product ID or name..."
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
            />
          </div>
        </div>
      </header>

      {/* Products */}
      <main className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Our Products
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Browse and view product details
            </p>
          </div>

          <span className="rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700">
            {filteredProducts.length} Products
          </span>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white py-20 text-center">
            <p className="text-lg font-semibold text-gray-600">
              {search ? "No matching products found" : "No products found"}
            </p>
            <p className="mt-2 text-sm text-gray-400">
              Try another product name or ID.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map((product, index) => {
              // First image is displayed on the product card
              const firstImage = getImageUrl(product.images?.[0]);

              return (
                <article
                  key={product._id || product.productId}
                  className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  {/* First Product Image */}
                  <div className="relative h-64 overflow-hidden bg-gray-100">
                    {firstImage ? (
                      <img
                        src={firstImage}
                        alt={product.productName}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        loading={index === 0 ? "eager" : "lazy"}
                        onError={(e) => {
                          console.error(
                            "Product image failed to load:",
                            firstImage
                          );
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-gray-400">
                        No Image Available
                      </div>
                    )}

                    <span
                      className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-semibold ${
                        product.stock > 0
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {product.stock > 0 ? "In Stock" : "Out of Stock"}
                    </span>

                    {product.images?.length > 1 && (
                      <span className="absolute bottom-3 right-3 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white">
                        +{product.images.length - 1} photos
                      </span>
                    )}
                  </div>

                  {/* Product Information */}
                  <div className="p-5">
                    <p className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-400">
                      ID: {product.productId}
                    </p>

                    <h3 className="line-clamp-1 text-xl font-bold text-gray-800">
                      {product.productName}
                    </h3>

                    {/* Rating */}
                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-lg text-amber-500">★</span>
                      <span className="font-semibold text-gray-800">
                        {product.ratings ?? 0}
                      </span>
                      <span className="text-sm text-gray-400">
                        ({product.reviews ?? 0} reviews)
                      </span>
                    </div>

                    {/* Description */}
                    <p className="mt-3 line-clamp-2 min-h-10 text-sm leading-5 text-gray-500">
                      {product.description || "No description available."}
                    </p>

                    {/* Stock */}
                    <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
                      <span className="text-sm text-gray-500">Availability</span>
                      <span
                        className={`text-sm font-semibold ${
                          product.stock > 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {product.stock > 0
                          ? `${product.stock} available`
                          : "Out of stock"}
                      </span>
                    </div>

                    {/* View Product */}
                    <Link
                      href={`/customerPage/${encodeURIComponent(
    product.productId
  )}?adminId=${encodeURIComponent(adminId || "")}`}
                      className="mt-5 block w-full rounded-xl bg-blue-600 px-4 py-3 text-center font-semibold text-white transition hover:bg-blue-700"
                    >
                      View Product
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
