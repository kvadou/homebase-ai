import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-navy-900">
      <SignUp
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
