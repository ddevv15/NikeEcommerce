import { notFound } from "next/navigation";
import Link from "next/link";
import { Star, Heart, ShoppingBag } from "lucide-react";

import { ColorPicker, ProductGallery, SizePicker, CollapsibleSection, Card } from "@/components";
import { getProduct, getAllProducts } from "@/lib/actions/product";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: PageProps) {
  const { id } = await params;

  // 1. Fetch main product details
  const product = await getProduct(id);
  if (!product) return notFound();

  // 2. Fetch related products (same category)
  // We'll just fetch a few products from the same category, excluding current
  const relatedResult = await getAllProducts({
    // We could add category-based filtering if it exists in filters, 
    // but for now let's just use the default newest.
    // Ideally we'd filter by category slug or id.
  });
  
  // Filter out the current product and take first 4
  const relatedProducts = relatedResult.products
    .filter(p => p.id !== product.id)
    .slice(0, 4);

  // Extract necessary UI data
  const title = product.name;
  const category = (product.gender?.label ? `${product.gender.label}'s ` : '') + (product.category?.name || "Shoes");
  const price = product.defaultVariant?.price ? Number(product.defaultVariant.price) : product.minPrice;
  const compareAtPrice = product.defaultVariant?.salePrice ? Number(product.defaultVariant.price) : undefined;
  const actualPrice = product.defaultVariant?.salePrice ? Number(product.defaultVariant.salePrice) : price;
  
  const discountPercent = compareAtPrice 
    ? Math.round(((compareAtPrice - actualPrice) / compareAtPrice) * 100) 
    : 0;

  // Process images
  const allImages = product.images.length > 0 
    ? product.images.map(img => img.url) 
    : ["/shoes/shoe-1.jpg"]; // Fallback if no images found

  // Process unique colors from variants
  // Map colors for the ColorPicker
  const uniqueColorsMap = new Map();
  product.variants.forEach(v => {
      if (v.color && !uniqueColorsMap.has(v.color.name)) {
          uniqueColorsMap.set(v.color.name, {
              name: v.color.name,
              hex: (v.color as any).hexCode || "#000" // Assuming hexCode is in the DB
          });
      }
  });
  const availableColors = Array.from(uniqueColorsMap.values());

  // Process unique sizes from variants
  const availableSizes = Array.from(new Set(product.variants.map(v => v.size?.name).filter(Boolean))) as string[];

  // Rating and reviews (placeholders if not in DB)
  const rating = 4.8; 
  const reviewCount = (product as any).reviews?.length || 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 font-jost">
      
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center text-sm text-dark-700">
         <Link href="/" className="hover:text-dark-900">Home</Link>
         <span className="mx-2">/</span>
         <span className="font-medium text-dark-900">{title}</span>
      </nav>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
        
        {/* Left Column: Gallery */}
        <div className="lg:col-span-7">
           <ProductGallery images={allImages} />
        </div>

        {/* Right Column: Product Info */}
        <div className="lg:col-span-5 flex flex-col gap-6">
           
           {/* Header Info */}
           <div className="flex flex-col gap-1">
              <div className="flex justify-between items-start">
                  <h1 className="text-heading-3 md:text-heading-2 font-bold text-dark-900 leading-tight">
                    {title}
                  </h1>
              </div>
              <p className="text-body-medium text-dark-700">{category}</p>
              
              <div className="mt-4 flex items-baseline gap-4">
                 <span className="text-xl font-medium text-dark-900">${actualPrice.toFixed(2)}</span>
                 {compareAtPrice && (
                     <span className="text-body text-dark-500 line-through">${compareAtPrice.toFixed(2)}</span>
                 )}
                 {discountPercent > 0 && (
                     <span className="text-body font-medium text-[#007d48]">
                         {discountPercent}% off
                     </span>
                 )}
              </div>
              
              <div className="flex items-center gap-1 mt-2">
                 <div className="flex text-dark-900">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} size={16} className={star <= Math.round(rating) ? "fill-current" : "text-light-400"} />
                    ))}
                 </div>
                 <span className="text-sm text-dark-700 ml-2">({reviewCount} Review{reviewCount !== 1 ? 's' : ''})</span>
              </div>
           </div>

           {/* Interactive Buying Form */}
           <div className="flex flex-col gap-8 mt-4">
               {availableColors.length > 0 && <ColorPicker colors={availableColors} />}
               {availableSizes.length > 0 && <SizePicker sizes={availableSizes} />}
           </div>

           {/* Actions */}
           <div className="flex flex-col gap-3">
               <button className="w-full py-4 rounded-full bg-dark-900 text-white font-medium hover:bg-dark-700 transition-colors flex items-center justify-center gap-2">
                   Add to Bag
               </button>
               <button className="w-full py-4 rounded-full border border-light-400 text-dark-900 font-medium hover:border-dark-900 transition-colors flex items-center justify-center gap-2">
                   Favorite <Heart size={20} />
               </button>
           </div>
           
           {/* Description */}
           <div className="text-body text-dark-700 leading-relaxed mt-4">
               {product.description || "No description available for this product."}
           </div>

           {/* Collapsible Sections */}
           <div className="mt-6 flex flex-col">
               <CollapsibleSection title="Product Details">
                   <p>Style: {product.id.substring(0, 8).toUpperCase()}</p>
                   <p>Country/Region of Origin: Vietnam</p>
                   <p className="mt-2 text-dark-550 italic">More details about materials and construction vary by variant.</p>
               </CollapsibleSection>
               <CollapsibleSection title="Shipping & Returns">
                   <p>Free standard shipping on orders over $50.</p>
                   <p>You can return your order for any reason, free of charge, within 30 days.</p>
               </CollapsibleSection>
                <CollapsibleSection title={`Reviews (${reviewCount})`}>
                   {reviewCount > 0 ? (
                       <div className="py-2">
                           {/* Review list placeholder */}
                           <p>Real reviews from verified buyers will appear here.</p>
                       </div>
                   ) : (
                        <div className="flex items-center gap-2 text-dark-500 py-4">
                            <Star className="w-5 h-5 text-light-400" />
                            <span>No reviews yet</span>
                        </div>
                   )}
               </CollapsibleSection>
           </div>

        </div>

      </div>

      {/* Recommended Products */}
      {relatedProducts.length > 0 && (
          <div className="mt-24">
              <h2 className="text-heading-3 font-medium text-dark-900 mb-8">You Might Also Like</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {relatedProducts.map((p) => (
                      <Card 
                         key={p.id}
                         id={p.id}
                         title={p.name}
                         category={(p.gender?.label ? `${p.gender.label}'s ` : '') + (p.category?.name || "Shoes")}
                         price={p.minPrice.toFixed(2)}
                         imageUrl={p.images[0]?.url || ""}
                         colors={`${(p as any).variants?.length || 0} Colours`}
                         badge={p.createdAt > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) ? { label: "New", tone: "green" } : null}
                      />
                  ))}
              </div>
          </div>
      )}

    </div>
  );
}

