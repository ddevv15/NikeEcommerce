import { db } from "../db";
import { products } from "../db/schema";
import { config } from "dotenv";

config({ path: ".env.local" });

const SAMPLE_PRODUCTS = [
    {
        name: "Nike Air Max Dn",
        description:
            "The Nike Air Max Dn features our Dynamic Air unit system of dual-pressure tubes, creating a reactive sensation with every step. This futuristic design results in a design that is comfortable enough to wear all day.",
        category: "Shoes",
        imageUrl:
            "https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/a5448375-7b5c-43f0-b9cc-9e657c91350a/AIR+MAX+DN.png",
        price: "160.00",
    },
    {
        name: "Nike Air Force 1 '07",
        description:
            "The radiance lives on in the Nike Air Force 1 '07, the b-ball icon that puts a fresh spin on what you know best: crisp leather, bold colors and the perfect amount of flash to make you shine.",
        category: "Shoes",
        imageUrl:
            "https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/b7d9211c-26e7-431a-ac24-b0540fb3c00f/AIR+FORCE+1+%2707.png",
        price: "115.00",
    },
    {
        name: "Nike Dunk Low Retro",
        description:
            "Created for the hardwood but taken to the streets, the '80s b-ball icon returns with perfectly sheened overlays and original university colors. With its classic hoops design, the Nike Dunk Low Retro channels '80s vintage back onto the streets while its padded, low-cut collar lets you take your game anywhere—in comfort.",
        category: "Shoes",
        imageUrl:
            "https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/a3e7dead-1ad2-4c40-996d-93ebc9df0fca/DUNK+LOW+RETRO.png",
        price: "115.00",
    },
    {
        name: "Nike Sportswear Tech Fleece Windrunner",
        description:
            "Blending two of our most iconic looks, this full-zip hoodie draws design inspiration from our timeless Windrunner jacket as well as our Tech Fleece jacket. It's designed to feel relaxed through the shoulders, chest and body for an athletic fit you can layer. Our premium, smooth-on-both-sides fleece feels warmer and softer than ever, while keeping the same lightweight build you love.",
        category: "Apparel",
        imageUrl:
            "https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/e69fa033-5c8e-4da5-9b2f-7634f195d2c5/AS+M+NK+TCH+FLC+WR+FZ+HDY+REV.png",
        price: "145.00",
    },
    {
        name: "Nike Sportswear Club Fleece",
        description:
            "Club Fleece sweatshirts, universally loved for their coziness and consistency, are for everyone. Always soft and made with our standard fit, they’re essentials that help you do more. This crew-neck option is a cold-weather essential.",
        category: "Apparel",
        imageUrl:
            "https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/8806950f-2395-4654-8c88-6625505dbec9/M+NK+CLUB+CRW+BB.png",
        price: "60.00",
    },
];

async function seed() {
    console.log("Seeding database...");
    try {
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
