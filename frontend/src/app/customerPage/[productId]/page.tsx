
import Link from "next/link";
import ProductImageSlider from "./ProductImageSlider";
import RatingsReviews from "./RatingReviews";
import CustomerComments from "./CustomerComments";
type Product = {
  productId: string;
  productName: string;
  description: string;
  images: string[];
  ratings: number;
  reviews: number;
  stock: number;
  adminId: string;
   reviewEntries?: {
    name?: string;
    comment: string;
    createdAt?: string | Date;
  }[];
};

async function getProduct(
  productId: string,
  adminId: string
): Promise<Product | null> {
  const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const response = await fetch(
    `${API_URL}/products/fetch?adminId=${encodeURIComponent(adminId)}`,
    { cache: "no-store" }
  );

  if (!response.ok) {
    console.error("Failed to fetch products:", response.status);
    return null;
  }

  const data = await response.json();
  const products: Product[] = data.products || [];
  const product =
    products.find((item) => item.productId === productId) || null;

  console.log("Product detail images:", product?.images);
console.log("Product ID:", product?.productId);
console.log("Images from API:", product?.images);
  return (
    products.find(
      (item) => item.productId === productId
    ) || null
  );
}

export default async function ProductDetails({
  params,
  searchParams,
}: {
  params: Promise<{ productId: string }>;
  searchParams: Promise<{ adminId?: string }>;
}) {
  const { productId } = await params;
  const { adminId } = await searchParams;

  if (!adminId) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-20 text-center">
        <h1 className="text-2xl font-bold">
          Admin ID পাওয়া যায়নি।
        </h1>

        <Link
          href="/customerPage"
          className="mt-4 inline-block text-blue-600 hover:underline"
        >
          Back to Products
        </Link>
      </div>
    );
  }

  let product: Product | null;

  try {
    product = await getProduct(productId, adminId);
  } catch (error) {
    console.error("Product fetch failed:", error);
    product = null;
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-20 text-center">
        <h1 className="text-2xl font-bold">
          Product not found
        </h1>

        <p className="mt-2 text-gray-500">
          এই Admin-এর অধীনে product পাওয়া যায়নি।
        </p>

        <Link
          href="/customerPage"
          className="mt-4 inline-block text-blue-600 hover:underline"
        >
          Back to Products
        </Link>
      </div>
    );
  }

  const images = Array.isArray(product.images)
    ? product.images.filter(
        (image) =>
          typeof image === "string" && image.trim() !== ""
      )
    : [];

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
        {/* Product Image + Slider */}
        <section>
          <ProductImageSlider
            images={images}
            productName={product.productName}
          />

          {/* Rating and Reviews: Below Pictures */}
          {/* Rating and Reviews + Customer Comments */}
<div className="mt-6 w-300 grid grid-cols-1 items-start gap-6 lg:grid-cols-2">

  {/* Left Side: Rating and Review Form */}
  <div className="rounded-2xl border border-gray-200 p-5">
    <RatingsReviews
      productId={product.productId}
      adminId={adminId}
      ratings={Number(product.ratings || 0)}
      reviews={Number(product.reviews || 0)}
      reviewEntries={product.reviewEntries || []}
    />
  </div>

  {/* Right Side: All Customer Comments */}
  <CustomerComments
    reviewEntries={product.reviewEntries || []}
  />

</div>
        </section>

        {/* Product Information */}
        <section>
          <p className="text-sm text-gray-500">
            Admin ID: {product.adminId}
          </p>

          <p className="mt-1 text-sm text-gray-500">
            Product ID: {product.productId}
          </p>

          <h1 className="mt-3 text-3xl font-bold text-gray-900">
            {product.productName}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className="text-yellow-500">
              ★ {Number(product.ratings || 0).toFixed(1)}
            </span>

            <span className="text-sm text-gray-500">
              ({product.reviews || 0} reviews)
            </span>
          </div>

          <div className="mt-6">
            <h2 className="text-lg font-semibold">
              Description
            </h2>

            <p className="mt-2 whitespace-pre-wrap leading-7 text-gray-600">
              {product.description || "No description available."}
            </p>
          </div>

          <div className="mt-6">
            <span className="font-semibold">Stock: </span>

            <span
              className={
                product.stock > 0
                  ? "text-green-600"
                  : "text-red-600"
              }
            >
              {product.stock > 0
                ? `${product.stock} available`
                : "Out of Stock"}
            </span>
          </div>

          {/* Order Now */}
         {/* Order Now */}
<Link
  href={`/customerPage/${encodeURIComponent(
    product.productId
  )}/order?adminId=${encodeURIComponent(adminId)}`}
  aria-disabled={product.stock <= 0}
  tabIndex={product.stock > 0 ? 0 : -1}
  className={`mt-8 block w-full rounded-xl py-4 text-center font-semibold text-white shadow-md transition-all duration-200 ${
    product.stock > 0
      ? "bg-blue-600 hover:bg-blue-700 hover:shadow-lg active:scale-[0.98]"
      : "pointer-events-none bg-gray-400"
  }`}
>
  {product.stock > 0 ? "Order Now" : "Out of Stock"}
</Link>

{/* More Products - Centered Below Button */}
<div className="mt-5 flex justify-center">
  <Link
    href={`/customerPage?adminId=${encodeURIComponent(adminId)}`}
    className="inline-flex items-center gap-2 rounded-full border border-blue-600 px-6 py-3 font-semibold text-blue-600 shadow-sm transition-all duration-200 hover:bg-blue-600 hover:text-white hover:shadow-md active:scale-95"
  >
    <span>←</span>
    <span>More Products</span>
  </Link>
</div>
        </section>
      </div>
    </main>
  );
}
