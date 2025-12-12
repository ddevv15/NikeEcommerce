import { signIn } from "@/lib/auth/actions";
import { AuthForm } from "../../../components";

export default function SignInPage() {
  return <AuthForm mode="sign-in" onSubmit={signIn} />;
}
