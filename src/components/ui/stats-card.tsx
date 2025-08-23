import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  icon: string;
  title: string;
  value: string | number;
  subtitle?: string;
  className?: string;
}

export const StatsCard = ({ icon, title, value, subtitle, className }: StatsCardProps) => {
  return (
    <Card className={cn("glass border-glow hover-scale cursor-pointer", className)}>
      <CardContent className="p-6 text-center">
        <div className="text-4xl mb-4">{icon}</div>
        <h3 className="text-2xl font-bold text-foreground mb-1">{title}</h3>
        <p className="text-3xl font-bold bg-gradient-brand bg-clip-text text-transparent mb-2">
          {value}
        </p>
        {subtitle && (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
};