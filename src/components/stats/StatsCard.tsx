interface Props {
  title: string;
  value: number | string;
  icon: string;
  color?: 'primary' | 'accent' | 'warning' | 'success' | 'destructive';
}

export function StatsCard({ title, value, icon, color = 'primary' }: Props) {
  const colorStyles = {
    primary: 'bg-primary/10 text-primary border-primary/20',
    accent: 'bg-accent/10 text-accent border-accent/20',
    warning: 'bg-warning/10 text-warning border-warning/20',
    success: 'bg-success/10 text-success border-success/20',
    destructive: 'bg-destructive/10 text-destructive border-destructive/20',
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground mb-1">{title}</p>
          <p className="text-4xl font-black">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl border ${colorStyles[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
