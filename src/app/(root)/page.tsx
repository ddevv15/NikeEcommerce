import { Card } from "../../components/index";
import { db } from "../../lib/db";
import { products } from "../../lib/db/schema";

export const dynamic = "force-dynamic";

export default async function Home() {
  const allProducts = await db.select().from(products);

  return (
    <main className="min-h-screen bg-light-100 font-jost">
      
      <div className="mx-auto max-w-[1920px] px-4 sm:px-6 lg:px-12 py-12">
        <h1 className="text-heading-3 font-medium text-dark-900 mb-8">
            New Arrivals
        </h1>

        <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
          {allProducts.map((product) => (
             <Card 
                key={product.id}
                title={product.name}
                category={product.category}
                price={product.price}
                imageUrl={product.imageUrl || ""}
                colors={product.colors}
                badge={product.badge as any}
             />
          ))}
        </div>
      </div>

    </main>
  );
}