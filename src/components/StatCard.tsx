import { motion } from "framer-motion";

export function StatCard({
  label,
  value,
  hint,
  icon,
  delay = 0,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -4, scale: 1.02 }}
      className="glass rounded-2xl p-5 shadow-card relative overflow-hidden group"
    >
      <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gradient-gold opacity-10 group-hover:opacity-20 transition-opacity" />
      <div className="flex items-start justify-between relative">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
          <p className="text-3xl font-display font-bold mt-2 gold-text">{value}</p>
          {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
        </div>
        <div className="w-11 h-11 rounded-xl bg-gradient-gold/20 flex items-center justify-center text-primary">
          {icon}
        </div>
      </div>
    </motion.div>
  );
}
