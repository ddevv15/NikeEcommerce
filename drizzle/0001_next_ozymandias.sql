ALTER TABLE "product_images" DROP CONSTRAINT "product_images_variant_id_product_variants_id_fk";
--> statement-breakpoint
ALTER TABLE "products" DROP CONSTRAINT "products_default_variant_id_product_variants_id_fk";
