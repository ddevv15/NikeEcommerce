import { config } from "dotenv";
config({ path: ".env.local" });

import { db } from "./index";
import * as schema from "./schema";
import { faker } from "@faker-js/faker";
import fs from "fs";
import path from "path";
import { eq } from "drizzle-orm";

async function main() {
    console.log("🌱 Starting seed...");

    // --- Clean DB (Optional: Be careful in prod) ---
    // In a real scenario, you might truncate. For now, we append or specific logic.
    // Let's assume clear slate for dev.
    console.log("Cleaning existing data...");
    // Order matters for deletion due to FKs
    // First, update products to remove defaultVariantId references
    await db.update(schema.products).set({ defaultVariantId: null });
    // Then delete in order: items referencing products/variants first, then variants, then products
    await db.delete(schema.orderItems);
    await db.delete(schema.payments);
    await db.delete(schema.orders);
    await db.delete(schema.cartItems);
    await db.delete(schema.carts);
    await db.delete(schema.reviews);
    await db.delete(schema.wishlists);
    await db.delete(schema.productImages);
    await db.delete(schema.productCollections);
    await db.delete(schema.productVariants); // Delete variants before products
    await db.delete(schema.products);
    await db.delete(schema.collections);
    await db.delete(schema.categories);
    await db.delete(schema.brands);
    await db.delete(schema.genders);
    await db.delete(schema.colors);
    await db.delete(schema.sizes);
    // keeping users for now or clear them too? Let's keep existing users if any, or maybe clear them.
    // Not clearing users to avoid breaking auth for now if developer has account.

    // --- Seed Filters ---
    console.log("Seeding filters...");

    // Genders
    const gendersData = [
        { label: "Men", slug: "men" },
        { label: "Women", slug: "women" },
        { label: "Unisex", slug: "unisex" },
        { label: "Kids", slug: "kids" },
    ];
    const insertedGenders = await db.insert(schema.genders).values(gendersData).returning();
    const genderMap = new Map(insertedGenders.map(g => [g.slug, g.id]));

    // Colors
    const colorsData = [
        { name: "Red", slug: "red", hexCode: "#FF0000" },
        { name: "Blue", slug: "blue", hexCode: "#0000FF" },
        { name: "Green", slug: "green", hexCode: "#008000" },
        { name: "Black", slug: "black", hexCode: "#000000" },
        { name: "White", slug: "white", hexCode: "#FFFFFF" },
        { name: "Grey", slug: "grey", hexCode: "#808080" },
        { name: "Yellow", slug: "yellow", hexCode: "#FFFF00" },
        { name: "Orange", slug: "orange", hexCode: "#FFA500" },
    ];
    const insertedColors = await db.insert(schema.colors).values(colorsData).returning();

    // Sizes
    const sizesData = [
        { name: "XS", slug: "xs", sortOrder: 1 },
        { name: "S", slug: "s", sortOrder: 2 },
        { name: "M", slug: "m", sortOrder: 3 },
        { name: "L", slug: "l", sortOrder: 4 },
        { name: "XL", slug: "xl", sortOrder: 5 },
        { name: "XXL", slug: "xxl", sortOrder: 6 },

    ];
    const insertedSizes = await db.insert(schema.sizes).values(sizesData).returning();

    // --- Seed Brands ---
    console.log("Seeding brands...");
    const brandsData = [
        { name: "Nike", slug: "nike", logoUrl: "/uploads/nike-logo.png" }, // Mock logo

    ];
    const insertedBrands = await db.insert(schema.brands).values(brandsData).returning();
    const nikeBrand = insertedBrands.find(b => b.slug === "nike") || insertedBrands[0];

    // --- Seed Categories ---
    console.log("Seeding categories...");
    const categoriesData = [
        { name: "Shoes", slug: "shoes" },
        { name: "Clothing", slug: "clothing" },
        { name: "Accessories", slug: "accessories" },
    ];
    const insertedCategories = await db.insert(schema.categories).values(categoriesData).returning();
    const shoesCategory = insertedCategories.find(c => c.slug === "shoes")!;

    // Sub-categories
    const subCategoriesData = [
        { name: "Running", slug: "running", parentId: shoesCategory.id },
        { name: "Basketball", slug: "basketball", parentId: shoesCategory.id },
        { name: "Lifestyle", slug: "lifestyle", parentId: shoesCategory.id },
    ];
    await db.insert(schema.categories).values(subCategoriesData);

    // --- Seed Collections ---
    console.log("Seeding collections...");
    const collectionsData = [
        { name: "Summer '25", slug: "summer-25" },
        { name: "New Arrivals", slug: "new-arrivals" },
    ];
    const insertedCollections = await db.insert(schema.collections).values(collectionsData).returning();

    // --- Images Handling ---
    // Read from public/shoes
    const shoesDir = path.join(process.cwd(), "public", "shoes");
    let shoeImages: string[] = [];
    if (fs.existsSync(shoesDir)) {
        const files = fs.readdirSync(shoesDir);
        // Only valid images - include avif format
        shoeImages = files.filter(f => /\.(png|jpg|jpeg|webp|avif)$/i.test(f));
        console.log(`Found ${shoeImages.length} image files in public/shoes`);
    } else {
        console.warn("No public/shoes directory found. Using placeholders.");
    }

    // --- Seed Products ---
    console.log("Seeding products...");
    const NIKE_PRODUCTS = [
        "Air Max 270", "Air Force 1", "Pegasus 40", "Dunk Low", "Blazer Mid",
        "Metcon 9", "Infinity Run 4", "Vomero 5", "Tech Hera", "Cortez",
        "Air Max 90", "Air Max 97", "Air Max Plus", "Jordan 1 Retro", "LeBron XXI"
    ];

    for (const prodName of NIKE_PRODUCTS) {
        const genderSlug = faker.helpers.arrayElement(["men", "women", "unisex"]);
        const genderId = genderMap.get(genderSlug)!;

        // Insert Product
        const productResult = await db.insert(schema.products).values({
            name: prodName,
            description: faker.commerce.productDescription(),
            categoryId: shoesCategory.id, // Simplifying to shoes for now
            genderId: genderId,
            brandId: nikeBrand.id,
            isPublished: true,
        }).returning();
        const product = Array.isArray(productResult) ? productResult[0] : productResult;

        // Create variants
        const color = faker.helpers.arrayElement(insertedColors);
        const productSizes = faker.helpers.arrayElements(insertedSizes, 3); // 3 sizes per product

        let firstVariantId: string | undefined;

        for (const size of productSizes) {
            const price = faker.commerce.price({ min: 80, max: 200 });
            const sku = `${prodName.replace(/\s+/g, '-').toUpperCase()}-${color.slug.toUpperCase()}-${size.name}`;

            const variantResult = await db.insert(schema.productVariants).values({
                productId: product.id,
                sku: sku + "-" + faker.string.alphanumeric(4).toUpperCase(), // Ensure unique
                price: price,
                colorId: color.id,
                sizeId: size.id,
                inStock: faker.number.int({ min: 0, max: 50 }),
                weight: faker.number.float({ min: 0.5, max: 2 }),
            }).returning();
            const variant = Array.isArray(variantResult) ? variantResult[0] : variantResult;

            if (!firstVariantId) firstVariantId = variant.id;

            // Add Images to Variant/Product
            // Use more images if available to showcase the gallery
            if (shoeImages.length > 0) {
                // Ensure we at least have 3 images if possible, or all available
                const numImages = Math.min(5, shoeImages.length);
                const imgs = faker.helpers.arrayElements(shoeImages, numImages);
                for (let i = 0; i < imgs.length; i++) {
                    await db.insert(schema.productImages).values({
                        productId: product.id,
                        variantId: variant.id,
                        url: `/shoes/${imgs[i]}`,
                        sortOrder: i,
                        isPrimary: i === 0,
                    });
                }
            } else {
                console.warn(`No images available for product ${prodName}`);
            }
        }

        // Set default variant
        if (firstVariantId) {
            await db.update(schema.products)
                .set({ defaultVariantId: firstVariantId })
                .where(eq(schema.products.id, product.id));
        }

        // Add to random collection
        const col = faker.helpers.arrayElement(insertedCollections);
        await db.insert(schema.productCollections).values({
            productId: product.id,
            collectionId: col.id,
        });

        // Add some random reviews
        if (faker.datatype.boolean()) {
            // Need a user id... let's skip reviews if no users or mock one
            // Assuming no users seeded here yet.
        }
    }

    console.log("✅ Seeding completed!");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        // Close connection if needed? Drizzle neon http is stateless mostly, but good practice.
        // process.exit(0);
    });
