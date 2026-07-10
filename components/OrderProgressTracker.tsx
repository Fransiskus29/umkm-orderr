import { Check, Clock, ChefHat, PackageCheck, XCircle } from "lucide-react";
import type { OrderStatus } from "@/lib/types";

const steps: { key: OrderStatus; label: string; icon: typeof Check }[] = [
  { key: "pending", label: "Diterima", icon: Clock },
  { key: "diproses", label: "Diproses", icon: ChefHat },
  { key: "selesai", label: "Selesai", icon: PackageCheck },
];

export default function OrderProgressTracker({ status }: { status: OrderStatus }) {
  if (status === "dibatalkan") {
    return (
      <div className="flex items-center gap-2 rounded-xl bg-red-50 p-4 text-red-700">
        <XCircle className="h-5 w-5" />
        <span className="text-sm font-medium">Pesanan ini telah dibatalkan.</span>
      </div>
    );
  }

  const currentIndex = steps.findIndex((s) => s.key === status);

  return (
    <div className="flex items-center">
      {steps.map((step, i) => {
        const done = i <= currentIndex;
        const Icon = step.icon;
        return (
          <div key={step.key} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full transition ${
                  done
                    ? "bg-[#C1440E] text-white shadow-sm"
                    : "bg-[#1C1410]/5 text-[#1C1410]/30"
                }`}
              >
                <Icon className="h-4 w-4" />
              </div>
              <span className={`text-xs font-medium ${done ? "text-[#1C1410]" : "text-[#1C1410]/30"}`}>
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`mx-1.5 h-1 flex-1 rounded-full transition ${
                  i < currentIndex ? "bg-[#C1440E]" : "bg-[#1C1410]/8"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
