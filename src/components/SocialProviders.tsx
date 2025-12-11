import Image from "next/image";

export default function SocialProviders() {
  return (
    <div className="grid grid-cols-2 gap-3">
      <button
        type="button"
        className="flex w-full items-center justify-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus-visible:ring-transparent"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        <span className="text-sm font-semibold leading-6">Google</span>
      </button>

      <button
        type="button"
        className="flex w-full items-center justify-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus-visible:ring-transparent"
      >
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M13.601 2.326A4.484 4.484 0 0 0 17.505 0a4.486 4.486 0 0 0-4.475 2.325c-0.21.352-.36.714-.43 1.096 1.042.06 2.115.655 2.846 1.487.675.768 1.135 1.745 1.135 2.852 0 .548-.114 1.072-.32 1.554-.188.438-.49.827-.853 1.135-1.745 1.48-4.485 1.682-6.52.883-.827-.32-1.554-.853-2.062-1.503-.66-1.503-1.02-3.175-1.02-4.896 0-3.35 2.326-6.19 5.586-6.842 2.62.905 5.586.58 6.19.167v-.058zM12 11.238c-.352 0-.693.07-1.02.204-.37.153-.693.385-.947.693-.508.618-.804 1.42-.804 2.296 0 .58.114 1.135.32 1.64.188.46.49.87.853 1.19a4.484 4.484 0 0 0 6.52-.883c.827-.32 1.554-.853 2.062-1.503.66-1.503 1.02-3.175 1.02-4.896 0-1.72-.36-3.393-1.02-4.896-.508-.65-1.235-1.183-2.062-1.503-1.042-.404-2.18-.58-3.315-.536-1.896-.757-4.14-.376-5.586.883-.362.32-.665.73-.853 1.19-.206.505-.32 1.06-.32 1.64 0 .905.32 1.735.845 2.39.263.327.59.566.966.702.327.12.678.182 1.042.182z" />
        </svg>
        <span className="text-sm font-semibold leading-6">Apple</span>
      </button>
    </div>
  );
}
