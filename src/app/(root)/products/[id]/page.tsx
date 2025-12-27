import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Star, Heart } from "lucide-react";

import { ColorPicker, ProductGallery, SizePicker, CollapsibleSection, ProductReviews, RecommendedProducts, ProductActions } from "@/components";
import { getProduct } from "@/lib/actions/product";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: PageProps) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
      return notFound();
  }

  // Extract necessary UI data
  const title = product.name;
  const category = (product.gender?.label ? `${product.gender.label}'s ` : '') + (product.category?.name || "Shoes");
  
  // Price Logic
  const defaultPrice = product.defaultVariant?.price ? Number(product.defaultVariant.price) : product.minPrice;
  const defaultSalePrice = product.defaultVariant?.salePrice ? Number(product.defaultVariant.salePrice) : undefined;
  
  const currentPrice = defaultSalePrice || defaultPrice;
  const originalPrice = defaultSalePrice ? defaultPrice : undefined;

  const discountPercent = originalPrice 
    ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) 
    : 0;

  // Process images
  const allImages = product.images.length > 0 
    ? product.images.map(img => img.url) 
    : ["/shoes/shoe-1.jpg"];

  // Process colors
  const uniqueColorsMap = new Map();
  product.variants.forEach(v => {
      if (v.color && !uniqueColorsMap.has(v.color.name)) {
          uniqueColorsMap.set(v.color.name, {
              name: v.color.name,
              hex: (v.color as any).hexCode || "#000" // Fallback if hexCode missing
          });
      }
  });
  const availableColors = Array.from(uniqueColorsMap.values());

  // Process sizes
  const availableSizes = Array.from(new Set(product.variants.sort((a,b) => {
      // Sort logic for sizes if needed, otherwise rely on DB order or default sort
      return 0; 
  }).map(v => v.size?.name).filter(Boolean))) as string[];

  // Reviews placeholder logic for stars (actual reviews distinct)
  const rating = 4.8; 
  // We don't have total review count in product table, so we might need to count them or use separate query.
  // For now, let's just say "Reviews" and load them below.

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
              <h1 className="text-heading-3 md:text-heading-2 font-bold text-dark-900 leading-tight">
                {title}
              </h1>
              <p className="text-body-medium text-dark-700">{category}</p>
              
              <div className="mt-4 flex items-baseline gap-4">
                 <span className="text-xl font-medium text-dark-900">${currentPrice.toFixed(2)}</span>
                 {originalPrice && (
                     <span className="text-body text-dark-500 line-through">${originalPrice.toFixed(2)}</span>
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
                 {/* <span className="text-sm text-dark-700 ml-2">({reviewCount} Review{reviewCount !== 1 ? 's' : ''})</span> */}
              </div>
           </div>

           {/* Interactive Buying Form */}
           {/* We pass all variants so the client component can determine ID, Stock, Price for selected combos */}
           <ProductActions 
                productId={product.id}
                variants={product.variants.map(v => ({
                    id: v.id,
                    color: v.color?.name || "",
                    size: v.size?.name || "",
                    stock: v.inStock,
                    price: Number(v.price)
                }))}
                colors={availableColors}
                sizes={availableSizes}
           />

           
           {/* Description */}
           <div className="text-body text-dark-700 leading-relaxed mt-4">
               {product.description || "No description available for this product."}
           </div>

           {/* Collapsible Sections */}
           <div className="mt-6 flex flex-col">
               <CollapsibleSection title="Product Details">
                   <p>Style: {product.id.substring(0, 8).toUpperCase()}</p>
                   <p>Country/Region of Origin: Vietnam</p>
                   {product.brand && <p>Brand: {product.brand.name}</p>}
               </CollapsibleSection>
               <CollapsibleSection title="Shipping & Returns">
                   <p>Free standard shipping on orders over $50.</p>
                   <p>You can return your order for any reason, free of charge, within 30 days.</p>
               </CollapsibleSection>
                <CollapsibleSection title="Reviews">
                   <Suspense fallback={<div className="py-4 text-center">Loading reviews...</div>}>
                        <ProductReviews productId={product.id} />
                   </Suspense>
               </CollapsibleSection>
           </div>

        </div>

      </div>

      {/* Recommended Products */}
      <Suspense fallback={<div className="h-96 mt-24 animate-pulse bg-light-200 rounded-lg"></div>}>
          <RecommendedProducts productId={product.id} />
      </Suspense>

    </div>
  );
}

