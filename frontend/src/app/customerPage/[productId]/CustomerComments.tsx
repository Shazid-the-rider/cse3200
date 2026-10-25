
type Review = {
  name?: string;
  comment: string;
  createdAt?: string | Date;
};

type Props = {
  reviewEntries: Review[];
};

export default function CustomerComments({
  reviewEntries,
}: Props) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-gray-900">
          Customer Comments
        </h2>

        <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
          {reviewEntries.length}
        </span>
      </div>

      <div className="mt-5 max-h-[600px] space-y-4 overflow-y-auto">
        {reviewEntries.length === 0 ? (
          <p className="rounded-xl bg-gray-50 p-4 text-sm text-gray-500">
            No comments yet.
          </p>
        ) : (
          reviewEntries.map((review, index) => (
            <article
              key={`${review.createdAt ?? "review"}-${index}`}
              className="rounded-xl border border-gray-100 bg-gray-50 p-4"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">
                  {(review.name || "A").charAt(0).toUpperCase()}
                </div>

                <div>
                  <p className="font-semibold text-gray-900">
                    {review.name?.trim() || "Anonymous"}
                  </p>

                  {review.createdAt && (
                    <p className="text-xs text-gray-500">
                      {new Date(review.createdAt).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>

              <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-gray-700">
                {review.comment}
              </p>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
