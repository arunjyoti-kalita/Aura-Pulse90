import { motion } from "framer-motion";

const rules = [
  { emoji: "💧", title: "Hydrate First", desc: "Drink a glass of water immediately after waking up." },
  { emoji: "🏋️", title: "Never Skip a Workout", desc: "Show up every day. Even 50% effort beats 0%." },
  { emoji: "🥗", title: "Eat Clean 80%", desc: "Focus on whole foods. Allow 20% flexibility." },
  { emoji: "😴", title: "Sleep 7-8 Hours", desc: "Recovery happens while you sleep. Prioritize rest." },
  { emoji: "📱", title: "Track Everything", desc: "What gets measured gets managed. Log daily." },
  { emoji: "🚶", title: "Move on Rest Days", desc: "Take a 30-min walk. Active recovery beats zero movement." },
  { emoji: "🧠", title: "Mindset Over Motivation", desc: "Discipline > motivation. Build systems, not feelings." },
  { emoji: "📸", title: "Document Progress", desc: "Take photos weekly. The mirror lies, photos don't." },
];

export default function GoldenRules() {
  return (
    <div className="min-h-screen pb-20 px-6 pt-10 max-w-2xl mx-auto relative z-10">
      <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <div className="inline-block px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[13px] font-bold uppercase tracking-[0.2em] text-primary mb-4">
          The Foundation
        </div>
        <h1 className="text-4xl font-display font-bold text-white tracking-tight mb-2">Golden Rules</h1>
        <p className="text-white/50 text-sm">The 8 pillars of your 90-day transformation</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rules.map((rule, i) => (
          <motion.div
            key={rule.title}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="glass-card-premium p-6 group hover:border-primary/30 transition-all duration-500"
          >
            <div className="flex gap-5 items-start">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-2xl group-hover:scale-110 group-hover:bg-primary/10 transition-all duration-500 border border-white/5">
                {rule.emoji}
              </div>
              <div className="flex-1">
                <p className="font-display font-bold text-white/90 group-hover:text-primary transition-colors duration-300">{rule.title}</p>
                <p className="text-sm text-white/40 leading-relaxed mt-1.5 group-hover:text-white/60 transition-colors duration-300">{rule.desc}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        transition={{ delay: 1 }}
        className="mt-12 p-6 glass-card-premium border-primary/20 bg-primary/5 text-center"
      >
        <p className="text-sm text-white/60 italic font-display">
          "Discipline is choosing between what you want now and what you want most."
        </p>
      </motion.div>
    </div>
  );
}

