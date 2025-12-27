"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useCartStore } from "@/store/cart.store";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { cart, fetchCart } = useCartStore();

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const totalItems = cart?.totalItems || 0;

  return (
    <nav className="sticky top-0 z-50 w-full bg-light-100 font-jost">
      <div className="mx-auto flex h-16 max-w-[1920px] items-center justify-between px-4 sm:px-6 lg:px-12">
        {/* Mobile Menu Button */}
        <button
          className="lg:hidden p-2"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        {/* Logo */}
        <Link href="/" className="flex-shrink-0">
          <Image
            src="/logo.png"
            alt="Nike"
            width={60}
            height={20}
            className="h-auto w-16"
          />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex lg:gap-x-8">
          <Link
            href="/products?gender=men"
            className="text-body-medium font-medium text-dark-900 hover:text-dark-700 hover:underline underline-offset-4 decoration-2"
          >
            Men
          </Link>
          <Link
            href="/products?gender=women"
            className="text-body-medium font-medium text-dark-900 hover:text-dark-700 hover:underline underline-offset-4 decoration-2"
          >
            Women
          </Link>
          <Link
            href="/products?gender=kids"
            className="text-body-medium font-medium text-dark-900 hover:text-dark-700 hover:underline underline-offset-4 decoration-2"
          >
            Kids
          </Link>
          <Link
            href="/products"
            className="text-body-medium font-medium text-dark-900 hover:text-dark-700 hover:underline underline-offset-4 decoration-2"
          >
            Sale
          </Link>
          <Link
            href="/products"
            className="text-body-medium font-medium text-dark-900 hover:text-dark-700 hover:underline underline-offset-4 decoration-2"
          >
            SNKRS
          </Link>
        </div>

        {/* Icons */}
        <div className="flex items-center gap-4">
          <div className="relative hidden md:block">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <svg
                className="h-6 w-6 text-dark-900 bg-light-200 rounded-full p-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search"
              className="block w-full rounded-full bg-light-200 py-2 pl-10 pr-3 text-body text-dark-900 placeholder-dark-500 hover:bg-light-300 focus:outline-none focus:ring-1 focus:ring-dark-500"
            />
          </div>
          <button className="p-2 hover:bg-light-200 rounded-full">
            <svg
              className="h-6 w-6 text-dark-900"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </button>
          
          {/* Cart Icon */}
          <Link href="/cart" className="p-2 hover:bg-light-200 rounded-full relative group">
            <svg
              className="h-6 w-6 text-dark-900"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            {totalItems > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-dark-900 rounded-full min-w-[18px]">
                  {totalItems}
                </span>
            )}
          </Link>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden border-t border-light-300">
          <div className="space-y-1 px-4 pb-3 pt-2">
            <Link
              href="/products?gender=men"
              className="block rounded-md px-3 py-2 text-body font-medium text-dark-900 hover:bg-light-200"
              onClick={() => setIsMenuOpen(false)}
            >
              Men
            </Link>
            <Link
              href="/products?gender=women"
              className="block rounded-md px-3 py-2 text-body font-medium text-dark-900 hover:bg-light-200"
              onClick={() => setIsMenuOpen(false)}
            >
              Women
            </Link>
            <Link
              href="/products?gender=kids"
              className="block rounded-md px-3 py-2 text-body font-medium text-dark-900 hover:bg-light-200"
              onClick={() => setIsMenuOpen(false)}
            >
              Kids
            </Link>
            <Link
              href="/products"
              className="block rounded-md px-3 py-2 text-body font-medium text-dark-900 hover:bg-light-200"
              onClick={() => setIsMenuOpen(false)}
            >
              Sale
            </Link>
            <Link
              href="/products"
              className="block rounded-md px-3 py-2 text-body font-medium text-dark-900 hover:bg-light-200"
              onClick={() => setIsMenuOpen(false)}
            >
              SNKRS
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
