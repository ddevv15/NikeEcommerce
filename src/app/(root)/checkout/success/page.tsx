import Link from "next/link";
import { CheckCircle } from "lucide-react";

interface SuccessPageProps {
    searchParams: Promise<{ orderId?: string }>;
}

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
    const { orderId } = await searchParams;

    return (
        <div className="mx-auto max-w-7xl px-4 py-32 flex flex-col items-center text-center font-jost">
            <CheckCircle size={80} className="text-green-600 mb-8" />
            <h1 className="text-heading-2 font-bold text-dark-900 mb-4">Your order is on its way!</h1>
            <p className="text-body-medium text-dark-700 max-w-md mb-10">
                Thank you for your purchase. Your order number is <span className="font-bold text-dark-900">#{orderId?.substring(0, 8).toUpperCase()}</span>. 
                We'll send you a confirmation email shortly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                    href="/" 
                    className="py-4 px-8 rounded-full bg-dark-900 text-white font-medium hover:bg-dark-700 transition-colors"
                >
                    Continue Shopping
                </Link>
                {/* Future: View Orders Link */}
            </div>
        </div>
    );
}
