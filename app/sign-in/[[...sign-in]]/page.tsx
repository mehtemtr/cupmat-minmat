import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#060b14]">
      <SignIn 
        appearance={{
          elements: {
            card: "bg-[#060b14] border border-white/10 rounded-2xl shadow-2xl",
            headerTitle: "text-white font-bold",
            headerSubtitle: "text-zinc-400",
            formButtonPrimary: "bg-emerald-500 hover:bg-emerald-400 text-emerald-950",
            formFieldLabel: "text-zinc-300",
            formFieldInput: "bg-white/10 border-white/20 text-white",
            socialButtonsBlockButton: "bg-white/10 hover:bg-white/20 text-white border-white/10",
          }
        }}
      />
    </div>
  );
}
