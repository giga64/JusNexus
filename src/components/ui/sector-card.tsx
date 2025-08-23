import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SectorCardProps {
  icon: string;
  title: string;
  description: string;
  onClick: () => void;
  variant: 'reu' | 'autor';
  className?: string;
}

export const SectorCard = ({ icon, title, description, onClick, variant, className }: SectorCardProps) => {
  const gradientClass = variant === 'reu' ? 'gradient-reu' : 'gradient-autor';
  const glowClass = variant === 'reu' ? 'glow-reu' : 'glow-autor';

  return (
    <Card className={cn("glass border-glow hover-scale cursor-pointer transition-all duration-300", glowClass, className)}>
      <CardContent className="p-8 text-center">
        <div className="text-6xl mb-6">{icon}</div>
        <h3 className="text-2xl font-bold text-foreground mb-4">{title}</h3>
        <p className="text-muted-foreground mb-6 leading-relaxed">{description}</p>
        <Button 
          onClick={onClick}
          className={cn("w-full text-white font-semibold py-3 transition-all duration-300", gradientClass)}
        >
          Acessar Setor
        </Button>
      </CardContent>
    </Card>
  );
};