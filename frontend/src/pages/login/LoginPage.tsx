import { LoginForm } from "@/components/login-form";
import logoSrc from "@/assets/Logo512.png";
import { LogoPatternBackground } from "@/components/LogoPatternBackground";

export default function LoginPage() {
    return (
        <div className="w-full rounded-md bg-neutral-950 relative flex flex-col items-center justify-center antialiased overflow-hidden">
            <LogoPatternBackground />
            <div className="flex flex-col min-h-screen items-center justify-center p-4 z-10 relative">
                <img src={logoSrc} alt="Logo" className="mb-8 h-24 w-auto" />
                <LoginForm className="w-full max-w-md" />
            </div>
        </div>
    );
}
