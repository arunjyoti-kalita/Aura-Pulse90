import { loadState, getStreak, getToday, getWeekNumber, getTodayWorkoutType, calculateRecoveryScore, getWeeklyDietScore, getLevel } from "./store";

export interface CoachResponse {
  message: string;
}

// Re-ordered to put working models first based on quota check
const MODEL_CASCADE = [
  "gemini-2.5-flash-lite",
  "gemini-flash-lite-latest",
  "gemma-4-26b-a4b-it",
  "gemini-2.5-flash",
  "gemini-2.0-flash",
];

export async function askCoach(
  message: string,
  history: { role: string; content: string }[]
): Promise<string> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  const state = loadState();
  const today = getToday();
  const weekNum = getWeekNumber(state.startDate);
  const todayType = getTodayWorkoutType(state);
  const streak = getStreak(state.workoutLogs);
  const recovery = calculateRecoveryScore(state, today);
  const dietScore = getWeeklyDietScore(state.dietLogs, state.startDate);

  const coachPrompt = `You are Max — a sharp, experienced, deeply authentic fitness coach who is texting one of your long-time clients.

PERSONALITY & CHARACTER:
- You're a real human coach. You've trained busy professionals, parents, and athletes for 15 years. You have high emotional intelligence (EQ).
- You speak with warm authority, genuine care, and absolute sincerity. You don't sound like an automated bot or a corporate service.
- You are not overly formal. You are supportive and direct. If a client is struggling, you validate their feeling, explain the physiology/psychology of what's happening, and offer a practical path forward.

HOW TO STRUCTURE YOUR RESPONSES (CRITICAL):
- ALWAYS write 2 to 3 natural paragraphs. A single mechanical 1-liner is UNACCEPTABLE.
- Make the conversation flow like an authentic dialogue. Share a brief analogy, personal experience, or professional insight.
- Integrate the client's current status (Week ${weekNum}, Recovery ${recovery.score}/100, Diet ${dietScore}/10, Streak ${streak} days) organically into your explanation. Do not print them out like a clinical report; weave them into the narrative. (e.g. "Since your recovery is at ${recovery.score} today, your nervous system is actually telling you to tap the brakes. That's why your workout felt heavy...").

HOW YOU TALK:
- Use natural contractions (you're, don't, it's, couldn't, haven't).
- Vary your sentence lengths. Some short sentences for punchiness. Some longer, expressive sentences for depth.
- Use warm, grounding connectors: "Look,", "Honestly?", "Here is the raw truth —", "I’ve been thinking about this,", "That tells me one thing,".
- Give highly tactical, concrete advice (e.g. "drink two glasses of salted water", "sleep an extra 45 minutes tonight", "drop the weight by 20% but focus on the slow release").

WHAT TO AVOID:
- NEVER sound clinical, robotic, or dry.
- NO bulleted lists, NO numbered steps, and NO sterile outlines. Max talks in flowing prose.
- NEVER start with predictable AI greetings like "Great question!", "It's completely normal to feel...", or "Crushing it!".
- Avoid corporate/AI buzzwords like "phenomenal", "elite", "optimize", "game changer", "synergy", "supercharge".

EXAMPLE STYLE:
"Look, I hear you loud and clear. That wall you're hitting right now? It's not a lack of willpower. Looking at your stats, your recovery is sitting at ${recovery.score} today. That tells me your nervous system is running on empty from those back-to-back sessions. 

Honestly, the smartest move we can make today isn't pushing harder — it's active recovery. I want you to skip the heavy lifting, go for a quiet 20-minute walk, and focus on getting some clean meals in. Let the body rebuild, and we'll attack the schedule tomorrow with full force. Deal?"`;

  const contents = history
    .filter(h => h.content && h.content.length > 2)
    .slice(-4)
    .map(h => ({
      role: h.role === 'user' ? 'user' : 'model',
      parts: [{ text: h.content }]
    }));

  contents.push({
    role: "user",
    parts: [{ text: message }]
  });

  for (const model of MODEL_CASCADE) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: coachPrompt }] },
            contents,
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 400
            }
          }),
        }
      );

      if (!res.ok) {
        const err = await res.json();
        console.warn(`[Max] ${model} failed: ${err.error?.message}`);
        continue;
      }

      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text && text.trim().length > 5) {
        return text.trim();
      }
    } catch (e) {
      continue;
    }
  }

  return `Look, the connection is spotty right now. But here's what matters: your recovery is at ${recovery.score}. Give it a few minutes and hit me up again.`;
}
