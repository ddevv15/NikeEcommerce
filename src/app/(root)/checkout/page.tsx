import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/actions";
import CheckoutForm from "@/components/CheckoutForm";

export default async function CheckoutPage() {
    const user = await getCurrentUser();

    if (!user) {
        redirect("/sign-in?redirect=/checkout");
    }

    return (
        <div className="bg-white min-h-screen">
            <CheckoutForm />
        </div>
    );
}
