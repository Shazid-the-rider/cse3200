import Image from "next/image";

type Product = {
  productId: string;
  productName: string;
  description: string;
  images: string[];
  ratings: number;
  reviews: number;
  stock: number;
};

async function getProduct(productId: string): Promise<Product | null> {
  const res = await fetch(
    "http://localhost:5000/products/fetch",
    {
      cache: "no-store",
    }
  );

  if (!res.ok) {
    return null;
  }

  const data = await res.json();

  const products: Product[] = data.products || [];

  const product = products.find(
    (item) => item.productId === productId
  );

  return product || null;
}

export default async function ProductDetails({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = await params;

  const product = await getProduct(productId);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 text-xl">
          Product not found
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

        {/* Image */}
        <div className="w-full h-[450px] bg-gray-100 rounded-2xl overflow-hidden flex items-center justify-center">

          {product.images?.length > 0 ? (
            <Image
              src={product.images[0]}
              alt={product.productName}
              width={600}
              height={450}
              className="w-full h-full object-cover"
               style={{ width: "auto" }}
              priority
            />
          ) : (
            <p className="text-gray-400">
              No Image
            </p>
          )}

        </div>

        {/* Product Information */}
        <div>

          <p className="text-sm text-gray-400">
            ID: {product.productId}
          </p>

          <h1 className="text-4xl font-bold text-gray-800 mt-2">
            {product.productName}
          </h1>

          {/* Rating */}
          <div className="flex items-center gap-2 mt-5">

            <span className="text-yellow-500 text-xl">
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
          <p className="text-gray-600 mt-6 leading-7">
            {product.description}
          </p>

          {/* Stock */}
          <div className="mt-6">

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
            className="w-full mt-8 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-4 rounded-xl font-semibold"
          >
            Add to Cart
          </button>

        </div>

      </div>

    </div>
  );
}