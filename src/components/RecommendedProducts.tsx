import Link from "next/link";
import Card from "@/components/Card";
import { getRecommendedProducts } from "@/lib/actions/product";

interface RecommendedProductsProps {
  productId: string;
}

export default async function RecommendedProducts({ productId }: RecommendedProductsProps) {
  const recommendedProducts = await getRecommendedProducts(productId);

  if (!recommendedProducts || recommendedProducts.length === 0) {
    return null;
  }

  return (
    <div className="mt-24">
      <h2 className="text-heading-3 font-medium text-dark-900 mb-8">You Might Also Like</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {recommendedProducts.map((p) => (
          <Card
            key={p.id}
            id={p.id}
            title={p.name}
            category={(p.gender?.label ? `${p.gender.label}'s ` : '') + (p.category?.name || "Shoes")}
            price={p.minPrice.toFixed(2)}
            imageUrl={p.images[0]?.url || ""}
            colors={`${p.variants?.length || 0} Colours`}
            // Logic for badges: New if created within 30 days
            badge={
                new Date(p.createdAt).getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000 
                ? { label: "New", tone: "green" as const } 
                : null
            }
          />
        ))}
      </div>
    </div>
  );
}
