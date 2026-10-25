

"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import Link from "next/link";
const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface Product {
  _id: string;
  adminId: string;
  productId: string;
  productName: string;
  description: string;
  stock: number | string;
  images: string[];
  ratings?: number;
  reviews?: number;

  reviewEntries?: {
    name?: string;
    comment: string;
    createdAt?: string | Date;
  }[];

  ratingEntries?: {
    rating: number;
    reviewerToken: string;
    createdAt?: string | Date;
  }[];
}

export default function AdminPage() {
  const [adminId, setAdminId] = useState("");
  const [adminName, setAdminName] = useState("");
const [adminGmail, setAdminGmail] = useState("");
  const [productId, setProductId] = useState("");
  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [stock, setStock] = useState("0");
  const [images, setImages] = useState<File[]>([]);
const [search, setSearch] = useState("");
const [products, setProducts] = useState<Product[]>([]);
const [selectedProduct, setSelectedProduct] =  useState<Product | null>(null);
const [searchLoading, setSearchLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [newImages, setNewImages] = useState<File[]>([]);
const [removedImages, setRemovedImages] = useState<string[]>([]);

  useEffect(() => {
    const savedAdminId = localStorage.getItem("adminId");
const savedAdmin = localStorage.getItem("admin");
    if (savedAdminId) {
      setAdminId(savedAdminId);
    } else {
      setError("Admin ID পাওয়া যায়নি। আগে login করো।");
    }

    if (savedAdmin) {
    try {
      const admin = JSON.parse(savedAdmin);
      setAdminName(admin.name || "");
      setAdminGmail(admin.gmail || "");
    } catch {
      setAdminName("");
      setAdminGmail("");
    }
    }
  }, []);


useEffect(() => {
  if (!adminId) return;

  const controller = new AbortController();

  const timer = setTimeout(async () => {
    setSearchLoading(true);

    try {
      const params = new URLSearchParams({
        q: search,
        adminId,
      });

      const response = await fetch(
        `${API_URL}/api/admin/products/search?${params}`,
        { signal: controller.signal }
      );

      const data = await response.json();
console.log("Upload status:", response.status);
console.log("Upload response:", data);
      if (response.ok) {
        setProducts(data.products || []);
      }
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") {
        console.error(error);
      }
    } finally {
      if (!controller.signal.aborted) {
        setSearchLoading(false);
      }
    }
  }, 250);

  return () => {
    clearTimeout(timer);
    controller.abort();
  };
}, [adminId, search]);

async function updateProduct() {
  if (!selectedProduct || !adminId) return;

  const parsedStock = Number(selectedProduct.stock);

  if (!Number.isInteger(parsedStock) || parsedStock < 0) {
    alert("Stock অবশ্যই শূন্য বা তার চেয়ে বড় পূর্ণসংখ্যা হতে হবে।");
    return;
  }

  const formData = new FormData();

  formData.append("adminId", adminId);
  formData.append("productId", selectedProduct.productId.trim());
  formData.append("productName", selectedProduct.productName.trim());
  formData.append("description", selectedProduct.description.trim());
  formData.append("stock", String(parsedStock));

  // Existing images যেগুলো remove করা হয়েছে
  formData.append(
    "removedImages",
    JSON.stringify(removedImages)
  );

  // নতুন image-গুলো পাঠাবে
newImages.forEach((file) => {
  formData.append("images", file);
});


  try {
    const response = await fetch(
      `${API_URL}/api/admin/products/${selectedProduct._id}`,
      {
        method: "PUT",
        body: formData,
      }
    );

    const data = await response.json();
console.log("Product images from database:", data.product?.images);
console.log("Updated product:", data.product);
    if (!response.ok) {
      alert(data.message || "Update failed");
      return;
    }

    setProducts((prev) =>
  prev.map((product) =>
    product._id === data.product._id ? data.product : product
  )
);


    setSelectedProduct(data.product);
console.log("Updated image paths:", data.product.images);
    // Image editing state reset
    setNewImages([]);
    setRemovedImages([]);

    alert("Product updated successfully!");
  } catch (error) {
    console.error("Update product error:", error);
    alert("Server-এর সঙ্গে connect করা যাচ্ছে না।");
  }
}




async function deleteProduct() {
  if (!selectedProduct || !adminId) return;

  if (!window.confirm("Delete this product permanently?")) return;

  const response = await fetch(
    `${API_URL}/api/admin/products/${selectedProduct._id}?adminId=${encodeURIComponent(adminId)}`,
    { method: "DELETE" }
  );

  const data = await response.json();

  if (!response.ok) {
    alert(data.message || "Delete failed");
    return;
  }

  setProducts((previous) =>
    previous.filter((product) => product._id !== selectedProduct._id)
  );

  setSelectedProduct(null);
}
const handleImagesChange = (
  e: React.ChangeEvent<HTMLInputElement>
) => {
  const selectedFiles = Array.from(e.target.files || []);

  if (images.length + selectedFiles.length > 5) {
    alert("Maximum 5 images are allowed.");
    e.target.value = "";
    return;
  }

  const validFiles = selectedFiles.filter((file) => {
    const validType = [
      "image/png",
      "image/jpeg",
      "image/webp",
    ].includes(file.type);

    const validSize = file.size <= 5 * 1024 * 1024;

    return validType && validSize;
  });

  if (validFiles.length !== selectedFiles.length) {
    alert("Only PNG, JPG, WEBP images up to 5 MB each are allowed.");
  }

  setImages((prev) => [...prev, ...validFiles]);

  
  e.target.value = "";
};

  

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!adminId) {
      setError("Admin ID পাওয়া যায়নি। আগে login করো।");
      return;
    }

    if (images.length === 0) {
      setError("কমপক্ষে একটি product image select করো।");
      return;
    }

    const parsedStock = Number(stock);

    if (
      !Number.isInteger(parsedStock) ||
      parsedStock < 0
    ) {
      setError("Stock অবশ্যই শূন্য বা তার চেয়ে বড় পূর্ণসংখ্যা হতে হবে।");
      return;
    }

    const formData = new FormData();

    formData.append("adminId", adminId);
    formData.append("productId", productId.trim());
    formData.append("productName", productName.trim());
    formData.append("description", description.trim());
    formData.append("stock", String(parsedStock));

    formData.append(
  "removedImages",
  JSON.stringify(removedImages)
);
    images.forEach((image) => {
      formData.append("images", image);
    });

    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/api/admin/products/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();
console.log("Upload status:", response.status);
console.log("Upload response:", data);
      if (!response.ok) {
        throw new Error(
          data.message || data.error || "Product upload failed."
        );
      }

      setMessage("Product successfully database-এ save হয়েছে!");

      setProductId("");
      setProductName("");
      setDescription("");
      setStock("0");
      setImages([]);

      const fileInput = document.getElementById(
        "images"
      ) as HTMLInputElement | null;

      if (fileInput) fileInput.value = "";
    } catch (err) {
      console.error("CREATE PRODUCT ERROR:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Server-এর সঙ্গে connect করা যাচ্ছে না।"
      );
      
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10";

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-700 text-white">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-6 w-6"
              >
                <path d="M3 7h18l-2 14H5L3 7Z" />
                <path d="M8 9V6a4 4 0 0 1 8 0v3" />
              </svg>
            </div>

            <div>
              <h1 className="text-xl font-extrabold text-slate-900">
                Online<span className="text-emerald-700">Shop</span>
              </h1>
              <p className="text-xs text-slate-500">
                Product management   
              </p>
            </div>
          </div>

       
<div className="flex items-center gap-3">
  <Link
    href={`/customerPage?adminId=${encodeURIComponent(adminId || "")}`}
    className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-emerald-700"
  >
    Customer Page
  </Link>

  <div className="rounded-xl bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800">
    Admin: {adminId || "Loading..."}
  </div>

  <button
    type="button"
    onClick={() => {
      localStorage.removeItem("adminId");
      localStorage.removeItem("admin");
      window.location.href = "/loginPage";
    }}
    className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-red-700"
  >
    Logout
  </button>
</div>

        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-12">
        <div className="mb-8">
          <p className="text-sm font-semibold text-emerald-700">
            ADMIN DASHBOARD
          </p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Add New Product
          </h2>
          <p className="mt-3 text-slate-500">
            Product details পূরণ করে store-এ নতুন product যোগ করো।
          </p>
        </div>


      
<div className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
  <label
    htmlFor="productSearch"
    className="mb-2 block text-sm font-semibold text-slate-700"
  >
    Search Products
  </label>

  <input
    id="productSearch"
    type="search"
    value={search}
    onChange={(e) => {
      setSearch(e.target.value);
      setSelectedProduct(null);
    }}
    placeholder="Search by Product ID or Product Name..."
    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10"
  />

  <p className="mt-2 text-xs text-slate-500">
    {searchLoading
      ? "Searching..."
      : `${products.length} product(s) found`}
  </p>

  <div className="mt-4 space-y-2">
     {search.trim() !== "" && (
    <>
    {products.map((product) => (
      <button
        key={product._id}
        type="button"
        onClick={() => setSelectedProduct(product)}
        className={`flex w-full items-center justify-between gap-3 rounded-xl border p-4 text-left transition ${
          selectedProduct?._id === product._id
            ? "border-emerald-600 bg-emerald-50"
            : "border-slate-200 hover:bg-slate-50"
        }`}
      >
        <span className="min-w-0">
          <span className="block truncate font-semibold text-slate-900">
            {product.productName}
          </span>
          <span className="mt-1 block text-xs text-slate-500">
            ID: {product.productId}
          </span>
        </span>

        <span className="shrink-0 text-sm font-medium text-emerald-700">
          Select →
        </span>
      </button>
    ))}

    {!searchLoading && products.length === 0 && (
      <p className="py-5 text-center text-sm text-slate-500">
        No products found.
      </p>
    )}
    </>
  )}
  </div>
</div>
  
{selectedProduct && (
  <div className="space-y-4 rounded-2xl border border-emerald-200 bg-white p-6">
    <h3 className="text-xl font-bold">Edit Product</h3>

    <label className="block text-sm font-medium">
      Product ID
      <input
        className="mt-2 w-full rounded-xl border p-3"
        value={selectedProduct.productId}
        onChange={(e) =>
          setSelectedProduct({
            ...selectedProduct,
            productId: e.target.value,
          })
        }
      />
    </label>

    <label className="block text-sm font-medium">
      Product Name
      <input
        className="mt-2 w-full rounded-xl border p-3"
        value={selectedProduct.productName}
        onChange={(e) =>
          setSelectedProduct({
            ...selectedProduct,
            productName: e.target.value,
          })
        }
      />
    </label>

{/* Product Images */}
<div className="space-y-3">
  <label className="block text-sm font-medium">
    Product Images
  </label>

  {/* Existing Images */}
 
{/* Existing Images */}
 
{/* Existing Images */}
<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
  {(selectedProduct.images || [])
    .filter(
      (image:string): image is string =>
        typeof image === "string" && image.trim() !== ""
    )
    .filter((image:string) => !removedImages.includes(image))
    .map((image:string, index:number) => (
      <div
        key={`${image}-${index}`}
        className="relative overflow-hidden rounded-xl border"
      >
        <img
  src={
    image.startsWith("http")
      ? image
      : `${API_URL}/${image.replace(/\\/g, "/").replace(/^\/+/, "")}`
  }
  alt={`Product ${index + 1}`}
  className="h-32 w-full rounded-xl object-cover"
/>

        <button
          type="button"
          onClick={() => {
            setRemovedImages((prev) =>
              prev.includes(image) ? prev : [...prev, image]
            );
          }}
          className="absolute right-2 top-2 rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white"
        >
          Remove
        </button>
      </div>
    ))}

  {/* Newly selected images */}
  {newImages.map((file, index) => (
    <div
      key={`${file.name}-${index}`}
      className="relative overflow-hidden rounded-xl border"
    >
      <img
        src={URL.createObjectURL(file)}
        alt={file.name}
        className="h-32 w-full rounded-xl object-cover"
      />

      <button
        type="button"
        onClick={() => {
          setNewImages((prev) =>
            prev.filter((_, i) => i !== index)
          );
        }}
        className="absolute right-2 top-2 rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white"
      >
        Remove
      </button>
    </div>
  ))}
</div>

{/* Upload New Images */}
<input
  type="file"
  accept="image/*"
  multiple
  onChange={(e) => {
    const files = Array.from(e.target.files || []);
    setNewImages((prev) => [...prev, ...files]);
    e.target.value = "";
  }}
  className="block w-full rounded-xl border p-3 text-sm"
/>

<p className="text-xs text-slate-500">
  Existing images দেখতে পারবে, Remove করে বাদ দিতে পারবে,
  অথবা নতুন ছবি upload করতে পারবে।
</p>
</div>
    <label className="block text-sm font-medium">
      Description
      <textarea
        className="mt-2 w-full rounded-xl border p-3"
        rows={4}
        value={selectedProduct.description}
        onChange={(e) =>
          setSelectedProduct({
            ...selectedProduct,
            description: e.target.value,
          })
        }
      />
    </label>



    <label className="block text-sm font-medium">
      Stock
      <input
        type="number"
        min="0"
        className="mt-2 w-full rounded-xl border p-3"
        value={selectedProduct.stock}
        onChange={(e) =>
          setSelectedProduct({
            ...selectedProduct,
            stock: e.target.value,
          })
        }
      />
    </label>
    <div className="flex flex-wrap gap-3">
      <button
        type="button"
        onClick={updateProduct}
        className="rounded-xl bg-emerald-700 px-5 py-3 font-semibold text-white"
      >
        Save Changes
      </button>

      <button
        type="button"
        onClick={deleteProduct}
        className="rounded-xl bg-red-600 px-5 py-3 font-semibold text-white"
      >
        Delete Product
      </button>
    </div>

    {/* Product Ratings and Customer Reviews - Admin */}
    <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-bold text-slate-900">
            Customer Ratings & Reviews
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Product ID: {selectedProduct.productId}
          </p>
        </div>

        <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
          {selectedProduct.reviewEntries?.length || 0} Comments
        </span>
      </div>

      {/* Rating and Review Summary */}
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
          <p className="text-sm font-medium text-slate-600">
            Average Rating
          </p>

          <p className="mt-2 text-3xl font-bold text-amber-500">
            ★ {Number(selectedProduct.ratings || 0).toFixed(1)}
            <span className="ml-2 text-base font-medium text-slate-500">
              / 5
            </span>
          </p>

          <p className="mt-2 text-sm text-slate-600">
            Based on {selectedProduct.ratingEntries?.length || 0} ratings
          </p>
        </div>

        <div className="rounded-xl border border-blue-200 bg-blue-50 p-5">
          <p className="text-sm font-medium text-slate-600">
            Total Comments
          </p>

          <p className="mt-2 text-3xl font-bold text-blue-700">
            {selectedProduct.reviewEntries?.length || 0}
          </p>

          <p className="mt-2 text-sm text-slate-600">
            Customer comments received
          </p>
        </div>
      </div>

      {/* All Customer Comments */}
      <div className="mt-6">
        <h4 className="text-lg font-bold text-slate-900">
          All Customer Comments
        </h4>

        <div className="mt-4 max-h-[450px] space-y-3 overflow-y-auto">
          {!selectedProduct.reviewEntries?.length ? (
            <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center">
              <p className="font-medium text-slate-600">
                No customer comments yet.
              </p>
              <p className="mt-1 text-sm text-slate-400">
                Customer reviews will appear here.
              </p>
            </div>
          ) : (
            selectedProduct.reviewEntries.map((review, index) => (
              <div
                key={`${review.createdAt || "review"}-${index}`}
                className="rounded-xl border border-slate-200 bg-slate-50 p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-700">
                    {(review.name?.trim() || "A")
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-900">
                      {review.name?.trim() || "Anonymous"}
                    </p>

                    <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">
                      {review.comment}
                    </p>

                    {review.createdAt && (
                      <p className="mt-2 text-xs text-slate-400">
                        {new Date(review.createdAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
      </div>
)}

        <div className="grid items-start gap-8 lg:grid-cols-[1fr_320px]">
          <form
            onSubmit={handleSubmit}
            className="space-y-7 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8"
          >
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Product Information
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                সব প্রয়োজনীয় তথ্য দাও।
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="productId"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Product ID *
                </label>
                <input
                  id="productId"
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  placeholder="যেমন: PROD001"
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="productName"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Product Name *
                </label>
                <input
                  id="productName"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="Product-এর নাম"
                  className={inputClass}
                  required
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="description"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Description *
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Product সম্পর্কে বিস্তারিত লেখো..."
                rows={5}
                className={`${inputClass} resize-y`}
                required
              />
            </div>

            <div>
              <label
                htmlFor="stock"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Stock Quantity *
              </label>
              <input
                id="stock"
                type="number"
                min="0"
                step="1"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className={inputClass}
                required
              />
            </div>

            <div>
              <label
                htmlFor="images"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Product Images *
              </label>

              <label
                htmlFor="images"
                className="flex cursor-pointer flex-col items-center rounded-2xl border-2 border-dashed border-emerald-200 bg-emerald-50/50 px-5 py-8 text-center transition hover:border-emerald-500 hover:bg-emerald-50"
              >
                <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-white text-emerald-700 shadow-sm">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-6 w-6"
                  >
                    <path d="M12 16V4m-5 5 5-5 5 5" />
                    <path d="M4 16v4h16v-4" />
                  </svg>
                </span>
                <span className="text-sm font-semibold text-slate-800">
                  Click to upload images
                </span>
                <span className="mt-2 text-xs text-slate-500">
                  PNG, JPG or WEBP · Maximum 5 images · 5 MB each
                </span>

                <input
                  id="images"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImagesChange}
                  className="sr-only"
                />
              </label>

              {images.length > 0 && (
                <div className="mt-3 space-y-2">
                  {images.map((image, index) => (
                    <div
                      key={`${image.name}-${index}`}
                      className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm"
                    >
                      <span className="truncate text-slate-700">
                        {image.name}
                      </span>
                      <span className="ml-3 shrink-0 text-xs text-slate-500">
                        {(image.size / (1024 * 1024)).toFixed(2)} MB
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {error && (
              <p
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
              >
                {error}
              </p>
            )}

            {message && (
              <p
                role="status"
                className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
              >
                {message}
              </p>
            )}

            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  setProductId("");
                  setProductName("");
                  setDescription("");
                  setStock("0");
                  setImages([]);
                  setError("");
                  setMessage("");

                  const input = document.getElementById(
                    "images"
                  ) as HTMLInputElement | null;

                  if (input) input.value = "";
                }}
                className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Clear Form
              </button>

              <button
                type="submit"
                disabled={loading || !adminId}
                className="rounded-xl bg-emerald-700 px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-800/15 transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Uploading Product..." : "Save Product →"}
              </button>
            </div>
          </form>

          <aside className="space-y-5">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="font-bold text-slate-900">
                Before you save
              </h3>

              <ul className="mt-4 space-y-4 text-sm text-slate-600">
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-800">
                    1
                  </span>
                  <span>প্রতিটি product-এর Product ID আলাদা হতে হবে।</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-800">
                    2
                  </span>
                  <span>কমপক্ষে একটি image upload করতে হবে।</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-800">
                    3
                  </span>
                  <span>Stock-এর পরিমাণ ঋণাত্মক হতে পারবে না।</span>
                </li>
              </ul>
            </div>

            
<div className="rounded-2xl bg-emerald-800 p-6 text-white">
  <p className="text-sm font-medium text-emerald-100">
    Product Owner
  </p>

  <div className="mt-4 space-y-4">
    <div>
      <p className="text-xs text-emerald-200">Admin ID</p>
      <p className="mt-1 break-all text-xl font-bold">
        {adminId || "Not available"}
      </p>
    </div>

    <div>
      <p className="text-xs text-emerald-200">Name</p>
      <p className="mt-1 text-base font-semibold">
        {adminName || "Not available"}
      </p>
    </div>

    <div>
      <p className="text-xs text-emerald-200">Gmail</p>
      <p className="mt-1 break-all text-sm font-medium">
        {adminGmail || "Not available"}
      </p>
    </div>
  </div>

  <p className="mt-5 border-t border-emerald-700 pt-4 text-sm leading-6 text-emerald-100">
    এই admin-এর অধীনে product তৈরি হবে।
  </p>
</div>

          </aside>
        </div>
      </div>
    </main>
  );
}
