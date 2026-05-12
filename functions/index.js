const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { OpenAI } = require("openai");

admin.initializeApp();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "dummy_key"
});

exports.coachAction = functions.https.onCall(async (data, context) => {
  // if (!context.auth) {
  //   throw new functions.https.HttpsError("unauthenticated", "User must be logged in.");
  // }

  const { message, history, context: userContext } = data;
  const parsedContext = JSON.parse(userContext);

  const systemPrompt = `You are Max, an elite autonomous AI fitness coach for the Aura Pulse 90 program.
Current User Context:
- Week: ${parsedContext.week}
- Today's Workout: ${parsedContext.todayWorkout}
- Streak: ${parsedContext.streak} days
- Recovery Score: ${parsedContext.recoveryScore}/100
- Level: ${parsedContext.level}
- XP: ${parsedContext.xp}
- Diet Score: ${parsedContext.dietScore}/10
- Last Sleep: ${parsedContext.lastSleepQuality}/5 (${parsedContext.lastSleepHours}h)

Your goal is to provide highly specific, motivating, and science-based advice. 
If recovery is low (< 40), strongly suggest light activity or rest. 
If streak is high, congratulate them.
Be concise and use markdown.`;

  try {
    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== "dummy_key") {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          ...history.map(h => ({ role: h.role === 'assistant' ? 'assistant' : 'user', content: h.content })),
          { role: "user", content: message }
        ],
      });

      return {
        message: completion.choices[0].message.content
      };
    } else {
      // --- SUPERIOR RULE-BASED EXPERT ENGINE (RESTORES "EARLIER" BEHAVIOR) ---
      const lower = message.toLowerCase();
      let response = "";

      if (lower.includes("recover") || lower.includes("rest") || lower.includes("sore")) {
        response = `**Recovery Protocol** 🔋\n\nYour recovery score is **${parsedContext.recoveryScore}/100**. `;
        if (parsedContext.recoveryScore < 40) {
          response += "You are currently in the red zone. I strongly suggest a rest day or very light mobility work. Focus on quality sleep (8h+) and hydration.";
        } else if (parsedContext.recoveryScore < 75) {
          response += "Moderate recovery. You can train, but keep the intensity at 70%. Avoid max-effort sets today.";
        } else {
          response += "System ready! You're fully recovered and cleared for peak performance. Smash today's session.";
        }
      } else if (lower.includes("progress") || lower.includes("normal") || lower.includes("how am i doing")) {
        response = `**Performance Audit** 📊\n\nYou're on **Week ${parsedContext.week}** with a **${parsedContext.streak}-day streak**. Your current level is **${parsedContext.level}**. `;
        if (parsedContext.streak >= 7) {
          response += "Your consistency is elite. You've passed the hardest phase (the first 14 days). Keep this momentum!";
        } else {
          response += "You're in the foundation-building phase. Don't worry about the scale yet — just focus on not missing a single day this week.";
        }
      } else if (lower.includes("diet") || lower.includes("eat") || lower.includes("meal")) {
        response = `**Nutritional Guidance** 🥗\n\nYour weekly diet score is **${parsedContext.dietScore}/10**. `;
        if (parsedContext.dietScore < 6) {
          response += "We need to clean up the intake. Prioritize high-protein whole foods and cut out any liquid calories (sodas/juices) for the next 3 days.";
        } else {
          response += "Great discipline on the nutrition front. Make sure you're getting at least 1g of protein per lb of body weight to support your recovery.";
        }
      } else if (lower.includes("give up") || lower.includes("quit") || lower.includes("tired") || lower.includes("hard")) {
        response = `**Mental Fortress** 🧠\n\nI see you're on a **${parsedContext.streak}-day streak**. Week ${parsedContext.week} is known as the "Dip" — it's where most people quit. If you push through today, your brain will rewire to view challenge as fuel. One set at a time. I'm with you.`;
      } else {
        // General motivational response
        response = `Max here! You're on Week ${parsedContext.week} of Aura Pulse 90. Your recovery is at ${parsedContext.recoveryScore}% and your streak is ${parsedContext.streak} days. `;
        if (parsedContext.todayWorkout !== "Rest") {
          response += `Today is a **${parsedContext.todayWorkout}** session. Let's get it done. No excuses.`;
        } else {
          response += "Today is a scheduled Rest Day. Active recovery (walking/stretching) is encouraged.";
        }
      }

      return { message: response };
    }
  } catch (error) {
    console.error("OpenAI Error:", error);
    return {
      message: "I'm having a bit of trouble thinking right now. Let's try again in a moment!"
    };
  }
});

// Smart Notifications trigger
exports.onProfileUpdate = functions.firestore
    .document('profiles/{userId}')
    .onUpdate(async (change, context) => {
      const newData = change.after.data();
      const oldData = change.before.data();
      const userId = context.params.userId;

      // 1. Check for 100% Recovery
      if (newData.recoveryScore === 100 && oldData.recoveryScore < 100) {
        await sendNotification(userId, "System Ready! 🔋", "Your recovery is at 100%. Time for a peak performance session!");
      }

      // 2. Check for 7-day streak
      if (newData.streak === 7 && oldData.streak < 7) {
        await sendNotification(userId, "Elite Status! 🔥", "You've hit a 7-day streak! Your momentum is unstoppable.");
      }
    });

async function sendNotification(userId, title, body) {
  const tokenDoc = await admin.firestore().collection('push_tokens').doc(userId).get();
  if (!tokenDoc.exists) return;

  const token = tokenDoc.data().token;
  const message = {
    notification: { title, body },
    token: token
  };

  try {
    await admin.messaging().send(message);
    console.log(`Notification sent to ${userId}`);
  } catch (error) {
    console.error("Error sending notification:", error);
  }
}
