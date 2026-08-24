
"use client";

import { useState } from "react";
import Link from "next/link";
export default function page() {
  const [productId, setProductId] = useState("");
  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [stock, setStock] = useState("");

  const [images, setImages] = useState<File[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);

  // Image select
  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!e.target.files) return;

    const selectedFiles = Array.from(e.target.files);

    // Maximum 5 images
    if (selectedFiles.length > 5) {
      alert("Maximum 5 images can be uploaded.");
      return;
    }

    setImages(selectedFiles);

    const previews = selectedFiles.map((file) =>
      URL.createObjectURL(file)
    );

    setPreviewImages(previews);
  };

  // Remove image
  const removeImage = (index: number) => {
    const newImages = images.filter(
      (_, i) => i !== index
    );

    const newPreviews = previewImages.filter(
      (_, i) => i !== index
    );

    setImages(newImages);
    setPreviewImages(newPreviews);
  };

  //submit
  const handleSubmit = async (
  e: React.FormEvent<HTMLFormElement>
) => {
  e.preventDefault();

  if (images.length === 0) {
    alert("Please select at least one image");
    return;
  }

  try {
    setLoading(true);

    const formData = new FormData();

    formData.append("productId", productId);
    formData.append("productName", productName);
    formData.append("description", description);
    formData.append("stock", stock);

    // IMPORTANT
    images.forEach((image) => {
      formData.append("images", image);
    });

    // Check what is being sent
    for (const [key, value] of formData.entries()) {
      console.log(
        key,
        value instanceof File
          ? value.name
          : value
      );
    }

    const response = await fetch(
      "http://localhost:5000/products/upload",
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await response.json();

    console.log("STATUS:", response.status);
    console.log("RESPONSE:", data);

    if (!response.ok) {
      throw new Error(
        data.message || "Failed to create product"
      );
    }

    alert("Product uploaded successfully!");

  } catch (error) {
    console.error(error);

    alert(
      error instanceof Error
        ? error.message
        : "Something went wrong"
    );
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Header */}
      <div className="w-full py-6 px-6 bg-slate-700">
        <h1 className="text-2xl font-bold text-white">
          Admin Page
        </h1>
         <Link href="/customerPage">
  Customer Page
</Link>
      </div>
     

      {/* Main */}
      <div className="max-w-4xl mx-auto px-6 py-10">

        <div className="bg-white rounded-2xl shadow-sm border p-8">

          <h2 className="text-xl font-bold mb-6">
            Add New Product
          </h2>

          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >

            {/* Product ID */}
            <div>
              <label className="block font-semibold mb-2">
                Product ID
              </label>

              <input
                type="text"
                value={productId}
                onChange={(e) =>
                  setProductId(e.target.value)
                }
                placeholder="PROD-001"
                className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-slate-500"
                required
              />
            </div>

            {/* Product Name */}
            <div>
              <label className="block font-semibold mb-2">
                Product Name
              </label>

              <input
                type="text"
                value={productName}
                onChange={(e) =>
                  setProductName(e.target.value)
                }
                placeholder="Enter product name"
                className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-slate-500"
                required
              />
            </div>

            {/* Images */}
            <div>
              <label className="block font-semibold mb-2">
                Product Images
              </label>

              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="w-full border rounded-lg px-4 py-3"
              />

              <p className="text-sm text-gray-500 mt-2">
                You can select maximum 5 images.
              </p>
            </div>

            {/* Image Preview */}
            {previewImages.length > 0 && (
              <div>
                <p className="font-semibold mb-3">
                  Image Preview
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">

                  {previewImages.map(
                    (image, index) => (
                      <div
                        key={index}
                        className="relative border rounded-xl overflow-hidden"
                      >

                        <img
                          src={image}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-28 object-cover"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            removeImage(index)
                          }
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-7 h-7 text-sm"
                        >
                          ×
                        </button>

                      </div>
                    )
                  )}

                </div>
              </div>
            )}

            {/* Description */}
            <div>
              <label className="block font-semibold mb-2">
                Description
              </label>

              <textarea
                value={description}
                onChange={(e) =>
                  setDescription(e.target.value)
                }
                placeholder="Write product description..."
                rows={6}
                className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-slate-500 resize-none"
                required
              />
            </div>

            {/* Stock */}
            <div>
              <label className="block font-semibold mb-2">
                Stock
              </label>

              <input
                type="number"
                min="0"
                value={stock}
                onChange={(e) =>
                  setStock(e.target.value)
                }
                placeholder="Enter stock quantity"
                className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-slate-500"
                required
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-700 text-white py-3 rounded-lg font-semibold hover:bg-slate-800 transition disabled:opacity-50"
            >
              {loading
                ? "Uploading..."
                : "Upload Product"}
            </button>

          </form>

        </div>

      </div>

    </div>
  );
}