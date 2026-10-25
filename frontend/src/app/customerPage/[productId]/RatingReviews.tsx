

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
type ReviewEntry = {
  name?: string;
  comment: string;
  createdAt?: string | Date;
};
type Props = {
  productId: string;
  adminId: string;
  ratings: number;
  reviews: number;
   reviewEntries: ReviewEntry[];
};

export default function RatingsReviews({
  productId,
  adminId,
  ratings,
  reviews,
   reviewEntries,
}: Props) {
  const router = useRouter();

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [reviewerToken, setReviewerToken] = useState("");
  const [hasRated, setHasRated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const key = `reviewerToken:${adminId}:${productId}`;
    let token = localStorage.getItem(key);

    if (!token) {
      token = crypto.randomUUID();
      localStorage.setItem(key, token);
    }

    setReviewerToken(token);
    setHasRated(
      localStorage.getItem(`hasRated:${adminId}:${productId}`) ===
        token
    );
  }, [adminId, productId]);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setMessage("");

    if (!reviewerToken) {
      setMessage("Please wait and try again.");
      return;
    }

    if (!hasRated && rating === 0 && !comment.trim()) {
      setMessage("Select a rating or write a review.");
      return;
    }

    setLoading(true);

    try {
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL ||
        "http://localhost:5000";

      const payload: {
        adminId: string;
        productId: string;
        reviewerToken: string;
        rating?: number;
        comment?: string;
      } = {
        adminId,
        productId,
        reviewerToken,
      };

      if (!hasRated && rating > 0) {
        payload.rating = rating;
      }

      if (comment.trim()) {
        payload.comment = comment.trim();
      }

      const response = await fetch(
        `${API_URL}/products/reviews`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save review");
      }

      if (payload.rating !== undefined) {
        localStorage.setItem(
          `hasRated:${adminId}:${productId}`,
          reviewerToken
        );
        setHasRated(true);
        setRating(0);
      }

      setComment("");
      setMessage("Your review has been saved successfully!");

      // Refresh server component to fetch updated MongoDB values.
      router.refresh();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900">
        Ratings & Reviews
      </h2>

      <div className="mt-3 flex items-center gap-3">
        <span className="text-2xl font-semibold text-yellow-500">
          ★ {Number(ratings || 0).toFixed(1)}
        </span>
        <span className="text-sm text-gray-500">
          {reviews || 0} reviews
        </span>
      </div>

      <form onSubmit={handleSubmit} className="mt-6">
        <label className="block font-semibold">
          Your Rating
        </label>

        {hasRated ? (
          <p className="mt-2 text-sm text-green-700">
            You have already rated this product in this browser.
          </p>
        ) : (
          <div className="mt-2 flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                aria-label={`Rate ${star} stars`}
                onClick={() => setRating(star)}
                className={`text-3xl transition ${
                  star <= rating
                    ? "text-yellow-400"
                    : "text-gray-300 hover:text-yellow-300"
                }`}
              >
                ★
              </button>
            ))}
          </div>
        )}

        <label
          htmlFor="review-comment"
          className="mt-5 block font-semibold"
        >
          Write a Review
        </label>

        <textarea
          id="review-comment"
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          placeholder="Share your experience..."
          maxLength={2000}
          rows={4}
          className="mt-2 w-full rounded-xl border border-gray-300 p-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />

        {message && (
          <p
            role="status"
            className="mt-3 text-sm text-blue-700"
          >
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={
            loading ||
            (!hasRated && rating === 0 && !comment.trim())
          }
          className="mt-4 w-full rounded-xl bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
        >
          {loading ? "Saving..." : "Submit Review"}
        </button>
      </form>
    </div>
  );
}
