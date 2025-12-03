import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    const { part, variant, language = 'ru' } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const questionCount = 30;
    const isPartOne = part === 1;
    
    const systemPrompt = `You are an expert ORT (Общереспубликанское тестирование) math test creator for Kyrgyzstan. 
Generate ${questionCount} original math questions in ${language === 'ru' ? 'Russian' : language === 'kg' ? 'Kyrgyz' : 'English'}.

For Part 1 questions: Use the Column A vs Column B comparison format where students compare two values.
For Part 2 questions: Use standard multiple choice format with 4 options.

Each question must be:
- Original and not copied from any existing test
- Appropriate difficulty for ORT exam
- Clear and unambiguous
- Have exactly one correct answer

Return ONLY valid JSON array with this structure:
[
  {
    "question_text": "Question text here",
    "options": ["А) option1", "Б) option2", "В) option3", "Г) option4"],
    "correct_option": 0,
    "explanation": "Brief explanation of the answer"
  }
]

For Part 1 comparison questions, options should be:
- А) Величина в колонке А больше
- Б) Величина в колонке Б больше  
- В) Величины равны
- Г) Невозможно определить`;

    const userPrompt = isPartOne 
      ? `Generate ${questionCount} Part 1 ORT math comparison questions. Each question should present two columns (Колонка А and Колонка Б) with mathematical expressions or values to compare. Topics: arithmetic, algebra, geometry basics, percentages, fractions.`
      : `Generate ${questionCount} Part 2 ORT math questions. Standard multiple choice with 4 options each. Topics: equations, functions, geometry, trigonometry, probability, statistics.`;

    console.log(`Generating ORT test Part ${part}, Variant ${variant}`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error("No content in AI response");
    }

    // Parse JSON from response
    let questions;
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        questions = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON array found in response");
      }
    } catch (parseError) {
      console.error("Parse error:", parseError, "Content:", content);
      throw new Error("Failed to parse questions from AI response");
    }

    console.log(`Generated ${questions.length} questions`);

    return new Response(JSON.stringify({ 
      success: true,
      questions,
      part,
      variant,
      questionCount: questions.length
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error generating ORT test:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
