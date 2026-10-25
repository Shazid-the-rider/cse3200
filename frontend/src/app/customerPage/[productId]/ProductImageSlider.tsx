


"use client";

import { useEffect, useState } from "react";

type Props = {
  images?: string[];
  productName: string;
};

export default function ProductImageSlider({
  images = [],
  productName,
}: Props) {
  const validImages = images.filter(
    (image) => typeof image === "string" && image.trim() !== ""
  );

  const [currentImage, setCurrentImage] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const getImageUrl = (image: string) => {
    if (image.startsWith("http")) return image;

    const API_URL =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

    return `${API_URL}/${image
      .replace(/\\/g, "/")
      .replace(/^\/+/, "")}`;
  };

  const showPrevious = () => {
    setCurrentImage((prev) =>
      prev === 0 ? validImages.length - 1 : prev - 1
    );
  };

  const showNext = () => {
    setCurrentImage((prev) =>
      prev === validImages.length - 1 ? 0 : prev + 1
    );
  };

  useEffect(() => {
    if (!isFullscreen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsFullscreen(false);
      if (event.key === "ArrowLeft") showPrevious();
      if (event.key === "ArrowRight") showNext();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isFullscreen, validImages.length]);

  if (validImages.length === 0) {
    return (
      <div className="flex h-80 items-center justify-center rounded-2xl bg-gray-100 text-gray-500">
        No product image available
      </div>
    );
  }

  return (
    <>
      {/* Normal Product Image */}
      <div className="space-y-3">
        <div className="relative overflow-hidden rounded-2xl bg-gray-100">
          <img
            src={getImageUrl(validImages[currentImage])}
            alt={productName}
            onDoubleClick={() => setIsFullscreen(true)}
            title="Double-click to view fullscreen"
            className="h-[350px] w-full cursor-zoom-in object-contain transition-transform"
          />

          {validImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={showPrevious}
                aria-label="Previous image"
                className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/60 px-4 py-2 text-xl text-white hover:bg-black/80"
              >
                ‹
              </button>

              <button
                type="button"
                onClick={showNext}
                aria-label="Next image"
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/60 px-4 py-2 text-xl text-white hover:bg-black/80"
              >
                ›
              </button>
            </>
          )}
        </div>

        {/* Normal Thumbnail Slider */}
        {validImages.length > 1 && (
          <div className="flex gap-3 overflow-x-auto pb-2">
            {validImages.map((image, index) => (
              <button
                type="button"
                key={`${image}-${index}`}
                onClick={() => setCurrentImage(index)}
                className={`shrink-0 overflow-hidden rounded-lg border-2 ${
                  currentImage === index
                    ? "border-blue-600"
                    : "border-transparent"
                }`}
              >
                <img
                  src={getImageUrl(image)}
                  alt={`${productName} ${index + 1}`}
                  className="h-20 w-20 object-cover"
                />
              </button>
            ))}
          </div>
        )}

        <p className="text-center text-xs text-gray-400">
          Double-click the image to enlarge
        </p>
      </div>

      {/* Fullscreen Image Viewer */}
      {isFullscreen && (
        <div
          className="fixed inset-0 z-[9999] flex flex-col bg-black/95 p-3 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label={`${productName} image viewer`}
        >
          {/* Top Bar */}
          <div className="flex shrink-0 items-center justify-between gap-3 pb-3 text-white">
            <p className="truncate text-sm sm:text-base">
              {productName} · {currentImage + 1}/{validImages.length}
            </p>

            <button
              type="button"
              onClick={() => setIsFullscreen(false)}
              aria-label="Close fullscreen"
              className="rounded-full bg-white/15 px-4 py-2 text-2xl hover:bg-white/30"
            >
              ×
            </button>
          </div>

          
{/* Fullscreen Image with Side Navigation */}
<div className="relative flex min-h-0 flex-1 items-center justify-center gap-3">
  {/* Previous Button - Left Side */}
  {validImages.length > 1 && (
    <button
      type="button"
      onClick={showPrevious}
      aria-label="Previous image"
      className="z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/20 text-3xl text-white shadow-lg transition hover:bg-white/40 sm:h-14 sm:w-14"
    >
      ‹
    </button>
  )}

  {/* Current Image */}
  <div className="flex h-full min-w-0 flex-1 items-center justify-center">
    <img
      src={getImageUrl(validImages[currentImage])}
      alt={productName}
      className="max-h-full max-w-full select-none object-contain"
    />
  </div>

  {/* Next Button - Right Side */}
  {validImages.length > 1 && (
    <button
      type="button"
      onClick={showNext}
      aria-label="Next image"
      className="z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/20 text-3xl text-white shadow-lg transition hover:bg-white/40 sm:h-14 sm:w-14"
    >
      ›
    </button>
  )}
</div>


          {/* Manual Thumbnail Slider */}
          {validImages.length > 1 && (
            <div className="mt-4 flex shrink-0 justify-start gap-3 overflow-x-auto py-2">
              {validImages.map((image, index) => (
                <button
                  type="button"
                  key={`${image}-${index}`}
                  onClick={() => setCurrentImage(index)}
                  aria-label={`Show image ${index + 1}`}
                  className={`shrink-0 overflow-hidden rounded-lg border-2 ${
                    currentImage === index
                      ? "border-blue-400"
                      : "border-white/20"
                  }`}
                >
                  <img
                    src={getImageUrl(image)}
                    alt={`${productName} thumbnail ${index + 1}`}
                    className="h-14 w-14 object-cover sm:h-20 sm:w-20"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
