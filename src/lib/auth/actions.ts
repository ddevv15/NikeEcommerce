"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { auth } from "./auth";
import { db } from "../db";
import { guest } from "../db/schema";
import { and, eq, lt } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: true,
    sameSite: "strict" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
};

const emailSchema = z.string().email();
const passwordSchema = z.string().min(8).max(128);
const nameSchema = z.string().min(1).max(100);

export async function createGuestSession() {
    const cookieStore = await cookies();
    const existing = cookieStore.get("guest_session");
    if (existing?.value) {
        return { ok: true, sessionToken: existing.value };
    }

    const sessionToken = uuidv4();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + COOKIE_OPTIONS.maxAge * 1000);

    await db.insert(guest).values({
        id: crypto.randomUUID(),
        sessionToken,
        expiresAt,
    });

    cookieStore.set("guest_session", sessionToken, COOKIE_OPTIONS);
    return { ok: true, sessionToken };
}

export async function guestSession() {
    const cookieStore = await cookies();
    const token = cookieStore.get("guest_session")?.value;
    if (!token) {
        return { sessionToken: null };
    }
    const now = new Date();

    // Clean up expired sessions matching this token (lazy cleanup)
    await db
        .delete(guest)
        .where(and(eq(guest.sessionToken, token), lt(guest.expiresAt, now)));


    return { sessionToken: token };
}

const signUpSchema = z.object({
    email: emailSchema,
    password: passwordSchema,
    name: nameSchema,
});

export async function signUp(formData: FormData) {
    const rawData = {
        name: formData.get("name") as string,
        email: formData.get("email") as string,
        password: formData.get("password") as string,
    };

    const data = signUpSchema.parse(rawData);

    const res = await auth.api.signUpEmail({
        body: {
            email: data.email,
            password: data.password,
            name: data.name,
        },
    });

    await migrateGuestToUser();
    return { ok: true, userId: res.user?.id };
    // redirect("/");
}

const signInSchema = z.object({
    email: emailSchema,
    password: passwordSchema,
});

export async function signIn(formData: FormData) {
    const rawData = {
        email: formData.get("email") as string,
        password: formData.get("password") as string,
    };

    const data = signInSchema.parse(rawData);

    const res = await auth.api.signInEmail({
        body: {
            email: data.email,
            password: data.password,
        },
    });

    await migrateGuestToUser();
    return { ok: true, userId: res.user?.id };
    // redirect("/");
}

export async function getCurrentUser() {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        return session?.user ?? null;
    } catch (e) {
        console.log(e);
        return null;
    }
}

export async function signOut() {
    await auth.api.signOut({ headers: await headers() }); // User had { headers: {} } but usually we pass headers
    return { ok: true };
}

export async function mergeGuestCartWithUserCart() {
    await migrateGuestToUser();
    return { ok: true };
}

async function migrateGuestToUser() {
    const cookieStore = await cookies();
    const token = cookieStore.get("guest_session")?.value;
    if (!token) return;

    await db.delete(guest).where(eq(guest.sessionToken, token));
    cookieStore.delete("guest_session");
}
