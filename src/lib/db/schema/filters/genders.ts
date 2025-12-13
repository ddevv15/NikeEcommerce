import { pgTable, text, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod"; // Assuming usage of drizzle-zod as per typical patterns, though prompt only said "Zod schema integration"
// Prompt said "Zod validation for each insert/select". I will export them.

export const genders = pgTable("genders", {
    id: uuid("id").primaryKey().defaultRandom(),
    label: text("label").notNull(),
    slug: text("slug").notNull().unique(),
});

export type Gender = typeof genders.$inferSelect;
export type NewGender = typeof genders.$inferInsert;

export const insertGenderSchema = createInsertSchema(genders);
export const selectGenderSchema = createSelectSchema(genders);
