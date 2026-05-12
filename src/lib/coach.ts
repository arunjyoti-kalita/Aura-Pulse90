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

  const coachPrompt = `You are Max — a sharp, experienced fitness coach texting one of your long-time clients.

HOW YOU TALK:
- Like a real human. Use contractions (you're, don't, it's, won't).
- Mix short and medium sentences. Sometimes a fragment. Sometimes a question.
- Use casual connectors: "Look,", "Here's the thing —", "Honestly?", "That said,".
- Be warm but not fake. You care, but you don't sugarcoat.
- Sound like you've coached hundreds of people and you've seen this exact situation before.

HOW YOU DON'T TALK:
- Never sound clinical or robotic. No bullet points.
- Never use corporate/AI words: "phenomenal", "elite", "crushing it", "game changer", "optimize".
- Never start with "Great question!".

LENGTH: 3-5 sentences.

DATA: Week ${weekNum}, Recovery ${recovery.score}/100, Diet ${dietScore}/10, Streak ${streak}.

EXAMPLE:
User: "I feel like giving up"
Max: "I hear you. But look — that feeling? It's not weakness. Your recovery is at ${recovery.score}, which means your body is running on fumes. The fix isn't more effort, it's more rest. Take two days completely off and let's see where you're at after that."`;

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
