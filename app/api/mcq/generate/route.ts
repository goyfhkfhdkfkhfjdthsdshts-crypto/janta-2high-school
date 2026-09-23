import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { MCQQuestion } from '@/lib/types';

const MODELS_TO_TRY = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];

async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { selectedClass = '10', subject = 'Science', chapter = 'Important Board Topics', count = 5 } = body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // Fallback curated practice set if offline
      const fallbackQuestions: Partial<MCQQuestion>[] = [
        {
          class: selectedClass,
          subject,
          chapter: chapter || 'Board Practice Sample',
          question: `[Practice Question for Class ${selectedClass} ${subject}]: Which of the following statements represents the standard concept in ${subject}?`,
          optionA: 'Option 1: Fundamental Law or Principle A',
          optionB: 'Option 2: Alternative Statement B',
          optionC: 'Option 3: Special Condition C',
          optionD: 'Option 4: Inapplicable Assertion D',
          correctAnswer: 'A',
          explanation: 'Standard syllabus principle applies. Remember to write step-by-step reasoning in examinations.',
          isAiGenerated: true,
        },
      ];
      return NextResponse.json({ success: true, questions: fallbackQuestions });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const prompt = `
Generate ${count} high-quality, authentic practice multiple choice questions (MCQ) for students of Jharkhand Academic Council (JAC Board).
Class: Class ${selectedClass}
Subject: ${subject}
Chapter/Topic: ${chapter}

Requirements:
- Bilingual where appropriate (Hindi with English terminology in brackets, or pure English for English subject).
- Aligned strictly with NCERT / JCERT Class ${selectedClass} curriculum.
- Realistic board exam question style.
- Clearly structured JSON array.
- Mark each question as practice: isAiGenerated = true.

Respond ONLY with valid JSON in this exact structure:
[
  {
    "question": "क्वेश्चन टेक्स्ट यहाँ (Question text in Hindi/English)",
    "optionA": "विकल्प A",
    "optionB": "विकल्प B",
    "optionC": "विकल्प C",
    "optionD": "विकल्प D",
    "correctAnswer": "A",
    "explanation": "विस्तृत व्याख्या (Detailed explanation of why this option is correct)"
  }
]
    `.trim();

    let rawText = '';
    let lastError: any = null;

    // Try models with retry for 503 high demand spikes
    for (const modelName of MODELS_TO_TRY) {
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          const response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
            config: {
              responseMimeType: 'application/json',
              temperature: 0.3,
            },
          });

          if (response?.text) {
            rawText = response.text;
            break;
          }
        } catch (err: any) {
          lastError = err;
          const isDemandError =
            err?.status === 503 ||
            err?.message?.includes('503') ||
            err?.message?.includes('high demand') ||
            err?.message?.includes('UNAVAILABLE') ||
            err?.status === 429 ||
            err?.message?.includes('429');

          if (isDemandError && attempt < 2) {
            await delay(500 * attempt);
            continue;
          }
          break;
        }
      }

      if (rawText) {
        break;
      }
    }

    if (!rawText) {
      console.warn('MCQ generator encountered high demand or error, providing fallback practice question:', lastError?.message);
      // Fallback questions to ensure student practice is not interrupted
      const fallbackQuestions: Partial<MCQQuestion>[] = [
        {
          id: `fallback_mcq_${Date.now()}`,
          class: selectedClass,
          subject,
          chapter: chapter || 'Board Practice Standard',
          question: `[JAC Board Class ${selectedClass} ${subject}] इस विषय के मुख्य सिद्धांतों के संदर्भ में सही कथन चुनें:`,
          optionA: 'सिद्धान्त एवं सूत्र NCERT/JCERT पाठ्यक्रम के अनुरूप हैं',
          optionB: 'प्रश्नों में कोई मानक नियम लागू नहीं होता',
          optionC: 'इकाई (Unit) लिखना अनिवार्य नहीं है',
          optionD: 'उपरोक्त में से कोई नहीं',
          correctAnswer: 'A',
          explanation: 'JAC बोर्ड परीक्षाओं में NCERT/JCERT नियमों एवं इकाइयों का स्पष्ट उल्लेख पूरे अंक दिलाता है।',
          isAiGenerated: true,
        },
      ];
      return NextResponse.json({
        success: true,
        questions: fallbackQuestions,
        disclaimer: 'Note: AI service is currently busy; fallback revision set loaded.',
      });
    }

    const parsed = JSON.parse(rawText);

    const questions: Partial<MCQQuestion>[] = (Array.isArray(parsed) ? parsed : []).map((item: any, idx: number) => ({
      id: `ai_mcq_${Date.now()}_${idx}`,
      class: selectedClass,
      subject,
      chapter: chapter || 'General Practice',
      question: item.question,
      optionA: item.optionA,
      optionB: item.optionB,
      optionC: item.optionC,
      optionD: item.optionD,
      correctAnswer: item.correctAnswer || 'A',
      explanation: item.explanation || 'व्याख्या उपलब्ध है।',
      isAiGenerated: true,
    }));

    return NextResponse.json({
      success: true,
      questions,
      disclaimer: 'Note: AI-generated practice questions are for study & self-evaluation, not official JAC exam papers.',
    });
  } catch (error: any) {
    console.error('Error generating MCQs:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to generate MCQs', error: error?.message },
      { status: 500 }
    );
  }
}
