"use client";

import { cn } from "@/lib/utils";

interface PasswordStrengthProps {
  score: number;
}

const strengthLevels = [
  { text: "Weak", color: "bg-red-500" },
  { text: "Weak", color: "bg-red-500" },
  { text: "Fair", color: "bg-yellow-500" },
  { text: "Good", color: "bg-blue-500" },
  { text: "Strong", color: "bg-green-500" },
];

export function PasswordStrength({ score }: PasswordStrengthProps) {
  const level = strengthLevels[score];

  return (
    <div className="flex items-center gap-2 text-sm">
      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={cn("h-full transition-all", level.color)}
          style={{ width: `${(score + 1) * 20}%` }}
        />
      </div>
      <span className="w-12 text-right font-medium">{level.text}</span>
    </div>
  );
}
