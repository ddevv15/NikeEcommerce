import { Star } from "lucide-react";
import { getProductReviews } from "@/lib/actions/product";

interface ProductReviewsProps {
  productId: string;
}

export default async function ProductReviews({ productId }: ProductReviewsProps) {
  const reviews = await getProductReviews(productId);

  if (reviews.length === 0) {
    return (
        <div className="flex items-center gap-2 text-dark-500 py-4">
            <Star className="w-5 h-5 text-light-400" />
            <span>No reviews yet</span>
        </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 py-4">
      {reviews.map((review) => (
        <div key={review.id} className="border-b border-light-200 pb-6 last:border-0 last:pb-0">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-dark-900">{review.user?.name || "Anonymous"}</h4>
            <span className="text-sm text-dark-500">
                {new Date(review.createdAt).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                })}
            </span>
          </div>
          <div className="flex items-center gap-1 mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={14}
                className={star <= review.rating ? "fill-current text-dark-900" : "text-light-400"}
              />
            ))}
          </div>
          {/* We might want to add a title if it exists in schema, but currently showing comment */}
          <p className="text-body text-dark-700 leading-relaxed">
            {review.comment}
          </p>
        </div>
      ))}
    </div>
  );
}
