import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      {/* New accounts go straight to choosing a plan */}
      <SignUp fallbackRedirectUrl="/subscribe" signInFallbackRedirectUrl="/dashboard" />
    </div>
  );
}
