import { db } from "../db";
import { products } from "../db/schema";
import { config } from "dotenv";

config({ path: ".env.local" });

const SAMPLE_PRODUCTS = [
    {
        name: "Nike Air Max 1",
        description: "Iconic style with modern comfort.",
        category: "Shoes",
        imageUrl: "/shoes/shoe-1.jpg",
        price: "140.00",
        colors: "5 Colors",
        badge: { label: "Just In", tone: "orange" },
    },
    {
        name: "Nike Air Force 1",
        description: "The classic look you love.",
        category: "Shoes",
        imageUrl: "/shoes/shoe-2.webp",
        price: "110.00",
        colors: "2 Colors",
        badge: null,
    },
    {
        name: "Nike Dunk Low",
        description: "Streetwear favorite.",
        category: "Shoes",
        imageUrl: "/shoes/shoe-3.webp",
        price: "115.00",
        colors: "4 Colors",
        badge: null,
    },
    {
        name: "Nike Zoom Vomero",
        description: "Responsive cushioning for your run.",
        category: "Shoes",
        imageUrl: "/shoes/shoe-4.webp",
        price: "160.00",
        colors: "6 Colors",
        badge: { label: "Bestseller", tone: "green" },
    },
    {
        name: "Nike Air Max 90",
        description: "Heritage style with Max Air.",
        category: "Shoes",
        imageUrl: "/shoes/shoe-5.avif",
        price: "130.00",
        colors: "3 Colors",
        badge: null,
    },
    {
        name: "Nike Pegasus 40",
        description: "A daily workhorse with a springy ride.",
        category: "Shoes",
        imageUrl: "/shoes/shoe-6.avif",
        price: "130.00",
        colors: "8 Colors",
        badge: null,
    },
    {
        name: "Nike Metcon 9",
        description: "Durability and stability for your workout.",
        category: "Shoes",
        imageUrl: "/shoes/shoe-7.avif",
        price: "150.00",
        colors: "5 Colors",
        badge: { label: "Sustainable", tone: "green" },
    },
    {
        name: "Nike Calm Slide",
        description: "Minimalist comfort.",
        category: "Shoes",
        imageUrl: "/shoes/shoe-8.avif",
        price: "50.00",
        colors: "9 Colors",
        badge: { label: "Hot", tone: "red" },
    },
    {
        name: "Nike Blazer Mid '77",
        description: "Vintage hoops style.",
        category: "Shoes",
        imageUrl: "/shoes/shoe-9.avif",
        price: "105.00",
        colors: "3 Colors",
        badge: null,
    },
    {
        name: "Nike Air Max Plus",
        description: "Tunned Air experience.",
        category: "Shoes",
        imageUrl: "/shoes/shoe-10.avif",
        price: "180.00",
        colors: "7 Colors",
        badge: null,
    },
    {
        name: "Nike P-6000",
        description: "Retro running vibes.",
        category: "Shoes",
        imageUrl: "/shoes/shoe-11.avif",
        price: "120.00",
        colors: "2 Colors",
        badge: null,
    },
    {
        name: "Nike Air Huarache",
        description: "Foot-hugging comfort.",
        category: "Shoes",
        imageUrl: "/shoes/shoe-12.avif",
        price: "125.00",
        colors: "4 Colors",
        badge: null,
    },
    {
        name: "Nike Cortez",
        description: "The original running shoe.",
        category: "Shoes",
        imageUrl: "/shoes/shoe-13.avif",
        price: "90.00",
        colors: "3 Colors",
        badge: { label: "Sale", tone: "red" },
    },
    {
        name: "Nike Monarch IV",
        description: "Total comfort for training.",
        category: "Shoes",
        imageUrl: "/shoes/shoe-14.avif",
        price: "75.00",
        colors: "2 Colors",
        badge: null,
    },
    {
        name: "Nike Air Max 97",
        description: "Ripple design lines.",
        category: "Shoes",
        imageUrl: "/shoes/shoe-15.avif",
        price: "175.00",
        colors: "6 Colors",
        badge: null,
    },
];

async function seed() {
    console.log("Seeding database...");
    try {
        // Clear existing products
        await db.delete(products);
        console.log("Cleared existing products.");

        for (const product of SAMPLE_PRODUCTS) {
            await db.insert(products).values(product);
        }
        console.log("Seeding complete!");
    } catch (error) {
        console.error("Error seeding database:", error);
    } finally {
        process.exit(0);
    }
}

seed();
