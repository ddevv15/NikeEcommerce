import { signUp } from "@/lib/auth/actions";
import { AuthForm } from "../../../components";

export default function SignUpPage() {
  return <AuthForm mode="sign-up" onSubmit={signUp} />;
}
