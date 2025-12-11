"use client";

import Link from "next/link";
import SocialProviders from "./SocialProviders";
import Image from "next/image";

interface AuthFormProps {
  type: "sign-in" | "sign-up";
}

export default function AuthForm({ type }: AuthFormProps) {
  return (
    <div className="bg-white px-6 py-12 shadow sm:rounded-lg sm:px-12 font-jost">
      <div className="sm:mx-auto sm:w-full sm:max-w-md mb-8">
        <Image
          className="mx-auto h-8 w-auto"
          src="/logo.png"
          alt="Nike"
          width={60}
          height={30}
        />
        <h2 className="mt-6 text-center text-heading-3 font-bold tracking-tight text-gray-900">
          {type === "sign-in" ? "Sign in to your account" : "Create your account"}
        </h2>
        
        {type === "sign-up" && (
            <p className="mt-2 text-center text-sm text-gray-600">
              Join us to get the latest updates and exclusive offers.
            </p>
        )}
      </div>

      <form className="space-y-6" action="#">
        {type === "sign-up" && (
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              Name
            </label>
            <div className="mt-2">
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6 pl-3"
              />
            </div>
          </div>
        )}

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium leading-6 text-gray-900"
          >
            Email address
          </label>
          <div className="mt-2">
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6 pl-3"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label
              htmlFor="password"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              Password
            </label>
            {type === "sign-in" && (
                <div className="text-sm">
                  <a href="#" className="font-semibold text-gray-600 hover:text-black">
                    Forgot password?
                  </a>
                </div>
            )}
          </div>
          <div className="mt-2">
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6 pl-3"
            />
          </div>
        </div>

        {type === "sign-up" && (
            <div className="flex items-start">
              <div className="flex h-6 items-center">
                <input
                  id="privacy"
                  name="privacy"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
                />
              </div>
              <div className="ml-3 text-sm leading-6">
                <label htmlFor="privacy" className="text-gray-600">
                  I agree to the <a href="#" className="font-semibold text-black hover:underline">Privacy Policy</a> and <a href="#" className="font-semibold text-black hover:underline">Terms of Use</a>.
                </label>
              </div>
            </div>
          )}

        <div>
          <button
            type="submit"
            className="flex w-full justify-center rounded-md bg-black px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black uppercase tracking-wider"
          >
            {type === "sign-in" ? "Sign In" : "Sign Up"}
          </button>
        </div>
      </form>

      <div className="mt-10">
        <div className="relative">
          <div
            className="absolute inset-0 flex items-center"
            aria-hidden="true"
          >
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-sm font-medium leading-6">
            <span className="bg-white px-6 text-gray-900">
              Or Sign up with
            </span>
          </div>
        </div>

        <div className="mt-6">
          <SocialProviders />
        </div>

        <p className="mt-10 text-center text-sm text-gray-500">
          {type === "sign-in" ? "Not a member?" : "Already a member?"}{" "}
          <Link
            href={type === "sign-in" ? "/sign-up" : "/sign-in"}
            className="font-semibold leading-6 text-black hover:underline underline-offset-2"
          >
            {type === "sign-in" ? "Join Us" : "Sign In"}
          </Link>
        </p>
      </div>
    </div>
  );
}
