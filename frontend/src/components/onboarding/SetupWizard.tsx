import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Building2, Package, Users, PartyPopper } from "lucide-react";
import { WelcomeStep } from "./steps/WelcomeStep";
import { FirstProductStep } from "./steps/FirstProductStep";
import { DefaultClientStep } from "./steps/DefaultClientStep";
import { CompletionStep } from "./steps/CompletionStep";

interface StepInfo {
    id: string;
    title: string;
    icon: React.ReactNode;
}

const STEPS: StepInfo[] = [
    { id: "welcome", title: "Empresa", icon: <Building2 className="h-4 w-4" /> },
    { id: "product", title: "Producto", icon: <Package className="h-4 w-4" /> },
    { id: "client", title: "Cliente", icon: <Users className="h-4 w-4" /> },
    { id: "complete", title: "Listo", icon: <PartyPopper className="h-4 w-4" /> },
];

export function SetupWizard() {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(0);
    const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

    // Load progress from localStorage
    useEffect(() => {
        const savedStep = localStorage.getItem("vanpos_onboarding_step");
        const savedCompleted = localStorage.getItem("vanpos_onboarding_completed");
        if (savedStep) setCurrentStep(parseInt(savedStep));
        if (savedCompleted) setCompletedSteps(new Set(JSON.parse(savedCompleted)));
    }, []);

    // Save progress to localStorage
    useEffect(() => {
        localStorage.setItem("vanpos_onboarding_step", currentStep.toString());
        localStorage.setItem("vanpos_onboarding_completed", JSON.stringify([...completedSteps]));
    }, [currentStep, completedSteps]);

    const handleStepComplete = () => {
        setCompletedSteps((prev) => new Set([...prev, currentStep]));
        if (currentStep < STEPS.length - 1) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handleFinish = () => {
        localStorage.removeItem("vanpos_onboarding_step");
        localStorage.removeItem("vanpos_onboarding_completed");
        navigate("/");
    };

    const renderStep = () => {
        switch (currentStep) {
            case 0:
                return <WelcomeStep onComplete={handleStepComplete} />;
            case 1:
                return <FirstProductStep onComplete={handleStepComplete} />;
            case 2:
                return <DefaultClientStep onComplete={handleStepComplete} />;
            case 3:
                return <CompletionStep onFinish={handleFinish} />;
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 flex items-center justify-center p-4">
            <Card className="w-full max-w-2xl shadow-xl">
                <CardHeader className="text-center border-b">
                    <CardTitle className="text-2xl">Configuración de VanPOS</CardTitle>
                    <CardDescription>
                        Vamos a preparar tu sistema en unos sencillos pasos
                    </CardDescription>
                </CardHeader>

                {/* Stepper */}
                <div className="px-6 py-4 border-b bg-muted/20">
                    <div className="flex justify-between">
                        {STEPS.map((step, index) => (
                            <div key={step.id} className="flex items-center flex-1">
                                <div className="flex flex-col items-center flex-1">
                                    <div
                                        className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${completedSteps.has(index)
                                                ? "bg-primary border-primary text-primary-foreground"
                                                : index === currentStep
                                                    ? "border-primary text-primary bg-primary/10"
                                                    : "border-muted-foreground/30 text-muted-foreground"
                                            }`}
                                    >
                                        {completedSteps.has(index) ? (
                                            <Check className="h-5 w-5" />
                                        ) : (
                                            step.icon
                                        )}
                                    </div>
                                    <span
                                        className={`mt-2 text-xs font-medium ${index === currentStep
                                                ? "text-primary"
                                                : "text-muted-foreground"
                                            }`}
                                    >
                                        {step.title}
                                    </span>
                                </div>
                                {index < STEPS.length - 1 && (
                                    <div
                                        className={`h-0.5 flex-1 mx-2 transition-colors ${completedSteps.has(index) ? "bg-primary" : "bg-muted"
                                            }`}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <CardContent className="p-6">{renderStep()}</CardContent>
            </Card>
        </div>
    );
}
