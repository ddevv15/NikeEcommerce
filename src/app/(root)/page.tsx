import { Card } from "../../components/index";
import { db } from "../../lib/db";

export const dynamic = "force-dynamic";

export default async function Home() {
  // Fetch products with their related category, default variant (for price), and images
  const allProducts = await db.query.products.findMany({
    where: (products, { eq }) => eq(products.isPublished, true),
    with: {
      category: true,
      defaultVariant: true,
      images: true,
    },
  });

  return (
    <main className="min-h-screen bg-light-100 font-jost">
      
      <div className="mx-auto max-w-[1920px] px-4 sm:px-6 lg:px-12 py-12">
        <h1 className="text-heading-3 font-medium text-dark-900 mb-8">
            New Arrivals
        </h1>

        <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
          {allProducts.map((product) => {
            // Get price from default variant
            const price = (product.defaultVariant as { price?: string } | null)?.price ?? "0.00";
            // Get primary image URL (prefer isPrimary, fallback to first image)
            const primaryImage = product.images?.find((img: { isPrimary: boolean }) => img.isPrimary) ?? product.images?.[0];
            const imageUrl = primaryImage?.url ?? "";
            // Get category name
            const categoryName = product.category?.name ?? "Uncategorized";
            
            return (
              <Card 
                key={product.id}
                id={product.id}
                title={product.name}
                category={categoryName}
                price={price}
                imageUrl={imageUrl}
              />
            );
          })}
        </div>
      </div>

    </main>
  );
}