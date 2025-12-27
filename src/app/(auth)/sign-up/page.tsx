import { Suspense } from "react";
import { signUp } from "@/lib/auth/actions";
import { AuthForm } from "../../../components";

export default function SignUpPage() {
  return (
    <Suspense>
      <AuthForm mode="sign-up" onSubmit={signUp} />
    </Suspense>
  );
}
