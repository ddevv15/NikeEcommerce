import { Suspense } from "react";
import { signIn } from "@/lib/auth/actions";
import { AuthForm } from "../../../components";

export default function SignInPage() {
  return (
    <Suspense>
      <AuthForm mode="sign-in" onSubmit={signIn} />
    </Suspense>
  );
}
