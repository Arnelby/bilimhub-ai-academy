import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { topic, level, weakAreas, language = 'ru' } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const languageInstructions = {
      ru: "Respond entirely in Russian.",
      kg: "Respond entirely in Kyrgyz language.",
      en: "Respond entirely in English."
    };

    const prompt = `Create an interactive math lesson on "${topic}" for ORT exam preparation.

Student Level: ${level}/5
${weakAreas ? `Areas needing focus: ${weakAreas.join(', ')}` : ''}

Create a comprehensive lesson with this JSON structure:
{
  "title": "Lesson title",
  "introduction": "Brief engaging introduction (2-3 sentences)",
  "sections": [
    {
      "title": "Section title",
      "content": "Detailed explanation with examples",
      "keyPoints": ["Point 1", "Point 2"],
      "example": {
        "problem": "Example problem",
        "solution": "Step-by-step solution"
      }
    }
  ],
  "quiz": [
    {
      "question": "Quiz question",
      "options": ["A", "B", "C", "D"],
      "correctOption": 0,
      "explanation": "Why this is correct"
    }
  ],
  "summary": "Key takeaways (3-4 bullet points)",
  "vocabulary": [
    { "term": "Math term", "definition": "Definition" }
  ]
}

Include 3-4 sections and 3-5 quiz questions.
${languageInstructions[language as keyof typeof languageInstructions] || languageInstructions.ru}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are an expert math teacher creating engaging lessons. Always respond with valid JSON." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI lesson generation error:", response.status, errorText);
      throw new Error("Failed to generate lesson");
    }

    const aiData = await response.json();
    const content = aiData.choices[0].message.content;
    
    // Extract JSON from potential markdown code blocks
    const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/\{[\s\S]*\}/);
    const lesson = JSON.parse(jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content);

    console.log("Lesson generated for topic:", topic);

    return new Response(JSON.stringify(lesson), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Lesson generation error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
