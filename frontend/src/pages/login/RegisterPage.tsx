import { RegisterForm } from "@/components/register-form";
import logoSrc from "@/assets/Logo512.png";
import { LogoPatternBackground } from "@/components/LogoPatternBackground";

export default function RegisterPage() {
    return (
        <div className=" w-full rounded-md bg-neutral-950 relative flex flex-col items-center justify-center antialiased">
            <LogoPatternBackground />
            <div className="flex flex-col min-h-screen items-center justify-center p-4 z-1">
                <img src={logoSrc} alt="Logo" className="mb-8 h-24 w-auto" />
                <RegisterForm className="w-full max-w-md" />
            </div>
        </div>
    );
}