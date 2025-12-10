import { db } from "../db";
import { products } from "../db/schema";
import Image from "next/image";

export const dynamic = "force-dynamic";

export default async function Home() {
  const allProducts = await db.select().from(products);

  return (
    <main className="min-h-screen bg-gray-100 dark:bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Nike New Arrivals
          </h1>
          <span className="text-sm text-gray-500 dark:text-zinc-400">
            {allProducts.length} Items
          </span>
        </div>

        <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
          {allProducts.map((product) => (
            <div key={product.id} className="group relative">
              <div className="aspect-square w-full overflow-hidden rounded-lg bg-gray-200 xl:aspect-[7/8]">
                {product.imageUrl && (
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    width={500}
                    height={500}
                    className="h-full w-full object-cover object-center group-hover:opacity-75"
                  />
                )}
              </div>
              <div className="mt-4 flex justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-zinc-200">
                    <a href="#">
                      <span aria-hidden="true" className="absolute inset-0" />
                      {product.name}
                    </a>
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">
                    {product.category}
                  </p>
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  ${product.price}
                </p>
              </div>
              <p className="mt-2 text-sm text-gray-500 dark:text-zinc-400 line-clamp-2">
                 {product.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
