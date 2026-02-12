import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-navy-900">
      <SignIn
        appearance={{
          elements: {
            formButtonPrimary:
              "bg-teal-500 hover:bg-teal-600 text-white",
            card: "rounded-xl shadow-2xl",
          },
        }}
      />
    </div>
  );
}
