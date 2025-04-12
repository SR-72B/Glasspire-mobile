import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface GlassTypeOption {
  value: string;
  label: string;
  description?: string;
}

interface GlassTypeSelectorProps {
  options: GlassTypeOption[];
  value: string;
  onChange: (value: string) => void;
}

export function GlassTypeSelector({ options, value, onChange }: GlassTypeSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
      {options.map((option) => (
        <Card
          key={option.value}
          className={cn(
            "cursor-pointer transition-all hover:border-primary hover:shadow-md",
            value === option.value ? "border-2 border-primary" : ""
          )}
          onClick={() => onChange(option.value)}
        >
          <CardContent className="p-4">
            <div className="text-center">
              <div className="mb-2 h-16 w-full rounded-md bg-muted"></div>
              <h3 className="font-medium">{option.label}</h3>
              {option.description && (
                <p className="text-xs text-muted-foreground">{option.description}</p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}