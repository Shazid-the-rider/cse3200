
"use client";

import Image from "next/image";
import { use, useEffect, useState } from "react";
import { Phone, Mic, Send } from "lucide-react";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
interface OrderPageProps {
  params: Promise<{
    productId: string;
  }>;
}

interface Product {
  productId: string;
  productName: string;
  price: number;
  stock: number;
  images: string[];
}

async function getProduct(
  productId: string
): Promise<Product | null> {
  try {
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
  } catch (error) {
    console.error("Product fetch error:", error);
    return null;
  }
}

export default function page({
  params,
}: OrderPageProps) {
  const { productId } = use(params);

  const [product, setProduct] = useState<Product | null>(
    null
  );

  const [loading, setLoading] = useState(true);

  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true);

      const data = await getProduct(productId);

      setProduct(data);

      setLoading(false);
    };

    loadProduct();
  }, [productId]);

  const handleSend = () => {
    if (!message.trim()) return;

    console.log("Message:", message);

    setMessage("");
  };

  const handleVoice = () => {
    console.log("Voice button clicked");
  };

  const handleCall = () => {
    console.log("Call button clicked");
  };

  /* ================= LOADING ================= */

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-gray-500">
          Loading product...
        </p>
      </div>
    );
  }

  /* ================= PRODUCT NOT FOUND ================= */

  if (!product) {
    return (
        <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-red-500">
          Product not found
        </p>
      </div>
    );
  }

  // ================= UI =================

  return (
    <div className="min-h-screen bg-gray-100 p-4">
     {/* <div className="max-w-7xl mx-auto h-[calc(100vh-32px)] bg-white rounded-2xl shadow-lg overflow-hidden flex">*/}
<div className="grid grid-cols-2 gap-[10px] w-full h-screen">
        {/* ================= LEFT : PRODUCT ================= */}
        <div className="w-full h-full flex items-center justify-center">
        <div>
<Card className="w-150 h-180">
    <div className="flex flex-col items-center justify-center mt-10">
         <h1 className="text-2xl font-bold mb-6">
            Product Details
          </h1>

          {/* Product Image */}
          <div className="relative w-full h-[450px] bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center">
{product.images && product.images.length > 0 ? (
    <Image
      src={product.images[0]}
      alt={product.productName}
      fill
      className="object-contain"
    />
  ) : (
    <div className="w-full h-full flex items-center justify-center text-gray-400">
      No Image
    </div>
  )}
           

          </div>

          {/* Product Info */}
          <div className="mt-6">

            <h2 className="text-3xl font-bold">
              {product.productName}
            </h2>

            <p className="text-2xl font-semibold text-blue-600 mt-4">
              ৳{product.price}
            </p>

            <p
              className={`mt-3 font-medium ${
                product.stock > 0
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {product.stock > 0
                ? `In Stock: ${product.stock}`
                : "Out of Stock"}
            </p>

          </div>
          </div>
</Card>
</div>
        </div>


        {/* ================= RIGHT : MESSENGER ================= */}
        <div className="w-full h-full flex items-center justify-center">
            <div>
<Card className="w-150 h-180">
          {/* Chat Header */}
          <div className="h-20  px-6 flex items-center justify-between">

            <div>
              <h2 className="font-bold text-lg">
                Seller
              </h2>

              <p className="text-sm text-green-500">
                ● Active now
              </p>
            </div>

            <button
              onClick={handleCall}
              className="w-11 h-11 rounded-full bg-green-100 text-green-600 flex items-center justify-center hover:bg-green-200"
            >
              <Phone size={20} />
            </button>

          </div>


          {/* Messages */}
          <div className="flex-1 p-6 overflow-y-auto bg-gray-50">

            {/* Seller message */}
            <div className="flex justify-start mb-4">

              <div className="bg-white shadow-sm rounded-2xl rounded-bl-sm px-4 py-3 max-w-[70%]">
                <p>
                  Hello! How can I help you?
                </p>

                <span className="text-xs text-gray-400">
                  2:30 PM
                </span>
              </div>

            </div>


            {/* Customer message */}
            <div className="flex justify-end mb-4">

              <div className="bg-blue-600 text-white rounded-2xl rounded-br-sm px-4 py-3 max-w-[70%]">
                <p>
                  Is this product available?
                </p>

                <span className="text-xs text-blue-100">
                  2:31 PM
                </span>
              </div>

            </div>

          </div>


          {/* Message Input */}
          <div className=" p-4">

            <div className="flex items-center gap-3">

              {/* Text Input */}
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSend();
                  }
                }}
                placeholder="Type a message..."
                className="flex-1 border border-gray-300 rounded-full px-5 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />


              {/* Voice */}
              <button
                onClick={handleVoice}
                className="w-12 h-12 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
              >
                <Mic size={21} />
              </button>


              {/* Send */}
              <button
                onClick={handleSend}
                className="w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center"
              >
                <Send size={20} />
              </button>

            </div>

          </div>
</Card>
</div>
        </div>

      {/*</div>*/}
      </div>
    </div>
  );
}
