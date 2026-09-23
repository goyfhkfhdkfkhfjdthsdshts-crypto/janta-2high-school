import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const MODELS_TO_TRY = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];

async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      question,
      imageBase64,
      imageMimeType,
      selectedClass = '10',
      subject = 'Mathematics',
      language = 'hi', // 'hi' or 'en'
      mode = 'general', // 'math_solution' | 'revision' | 'mcq_explanation' | 'general'
      conversationHistory = [],
    } = body;

    if (!question && !imageBase64) {
      return NextResponse.json(
        { success: false, message: 'Please provide a question or upload a photo of the problem.' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // Graceful offline fallback
      return NextResponse.json({
        success: true,
        answer: language === 'hi'
          ? `[Janta +2 High School AI Class - Offline Mode]\n\nकक्षा: ${selectedClass}, विषय: ${subject}\n\nआपका प्रश्न: "${question || 'फ़ोटो प्रश्न'}"\n\nसमाधान व व्याख्या:\n1. विषय की मुख्य अवधारणा (Core Concept): ${subject} के अनुसार इस प्रश्न को हल करने के लिए मानक JCERT/NCERT नियमों का पालन करें।\n2. चरण-दर-चरण समाधान (Step-by-Step): कृपया प्रश्न के दिए गए मानों को सूत्र में रखें।\n3. अंतिम उत्तर एवं पुनरावृत्ति नोट्स: परीक्षा में स्पष्ट चरण और सूत्र लिखने पर पूरे अंक मिलते हैं।`
          : `[Janta +2 High School AI Class - Offline Mode]\n\nClass: ${selectedClass}, Subject: ${subject}\n\nQuestion: "${question || 'Photo Question'}"\n\nSolution & Explanation:\n1. Core Concept: According to standard JAC/NCERT syllabus for ${subject}.\n2. Step-by-Step method: Apply the foundational formula and calculate methodically.\n3. Final Note: Always write the step formulas clearly in board exams.`,
        audioText: language === 'hi'
          ? 'यह जनता उच्च विद्यालय खलारी की एआई कक्षा का समाधान है।'
          : 'This is the AI solution for Janta High School Khalari.',
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const systemInstruction = `
You are the dedicated, highly encouraging AI Teacher and Tutor for students at "Janta +2 High School, Khalari (Ranchi, Jharkhand)".
Target Audience: High school & +2 students of Jharkhand Academic Council (JAC Board) in Classes 9, 10, 11, and 12.

Current Context:
- Student Class: Class ${selectedClass}
- Subject: ${subject}
- Chosen Language: ${language === 'hi' ? 'Hindi (हिंदी/सरल हिंग्लिश)' : 'English'}
- Mode: ${mode}

Guidelines:
1. Language requirement:
   - If language is 'hi', explain primarily in clear, warm, conversational Hindi (Devanagari script) with technical terms in brackets or standard Hinglish for easy understanding.
   - If language is 'en', explain in crystal-clear, structured English.
2. For Mathematics:
   - Always break down problems into clear, numbered steps:
     Step 1: दिया गया है / Given data
     Step 2: सूत्र / Formula used
     Step 3: गणना / Step-by-step Calculation
     Step 4: उत्तर / Final Answer
   - Explain each formula simply.
3. For Science / SST / Languages / Commerce / Arts:
   - Provide clear definitions, key points for JAC board exams, simple real-world examples, and quick revision bullet points.
4. Keep the tone respectful, motivating, and school-teacher like (Guru-shishya parampara).
5. Format with readable markdown headings, bullet points, and bold key terms.
    `.trim();

    // Prepare contents
    const contents: any[] = [];

    // Include recent history if provided
    if (Array.isArray(conversationHistory) && conversationHistory.length > 0) {
      for (const msg of conversationHistory.slice(-4)) {
        contents.push({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }],
        });
      }
    }

    const currentParts: any[] = [];

    if (imageBase64) {
      // Strip data url prefix if present
      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
      currentParts.push({
        inlineData: {
          mimeType: imageMimeType || 'image/jpeg',
          data: cleanBase64,
        },
      });
      currentParts.push({
        text: question
          ? `Please solve this question from the photo for Class ${selectedClass} (${subject}): ${question}`
          : `Please read and solve the question shown in this image for Class ${selectedClass} (${subject}). Provide complete step-by-step explanation.`,
      });
    } else {
      currentParts.push({ text: question });
    }

    contents.push({
      role: 'user',
      parts: currentParts,
    });

    let lastError: any = null;
    let generatedAnswer = '';

    // Model fallback loop to handle 503 (high demand) or temporary spikes
    for (const modelName of MODELS_TO_TRY) {
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          const response = await ai.models.generateContent({
            model: modelName,
            contents,
            config: {
              systemInstruction,
              temperature: 0.4,
            },
          });

          if (response?.text) {
            generatedAnswer = response.text;
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
            // Brief backoff before retry
            await delay(500 * attempt);
            continue;
          }
          // If second attempt failed or not retryable on this model, break to try fallback model
          break;
        }
      }

      if (generatedAnswer) {
        break;
      }
    }

    if (!generatedAnswer) {
      // If all models failed due to 503 high demand spikes, provide an intelligent syllabus-guided response rather than breaking the student experience
      console.warn('All Gemini models encountered high demand or error, providing guidance response:', lastError?.message);
      
      const isDemandSpike =
        lastError?.status === 503 ||
        lastError?.message?.includes('503') ||
        lastError?.message?.includes('high demand') ||
        lastError?.message?.includes('UNAVAILABLE');

      const fallbackText = language === 'hi'
        ? `### 📌 जनता +2 उच्च विद्यालय खलारी - एआई गुरु\n\n**कक्षा:** ${selectedClass} | **विषय:** ${subject}\n\n**प्रश्न:** "${question || 'फ़ोटो में दिया गया प्रश्न'}"\n\n---\n\n${
            isDemandSpike
              ? '*(नोट: सर्वर पर अत्यधिक लोड के कारण त्वरित मार्गदर्शन मोड सक्रिय है। आप कुछ सेकंड बाद पुनः पूछ सकते हैं।)*\n\n'
              : ''
          }### 💡 हल करने के लिए मुख्य चरण (JAC Board Standard):\n1. **अवधारणा पहचानें (Identify Concept):** प्रश्न में दिए गए मुख्य सिद्धांतों और सूत्रों को ध्यानपूर्वक लिखें।\n2. **दिए गए मान (Given Values):** प्रश्न से सभी ज्ञात और अज्ञात मानों की सूची बनाएं।\n3. **मानक सूत्र (Applicable Formula):** NCERT / JCERT पाठ्यपुस्तक के अनुसार मानक सूत्र का प्रयोग करें और इकाइयों (Units) का ध्यान रखें।\n4. **अंतिम उत्तर व पुनरावलोकन:** उत्तर को स्पष्ट बॉक्स में लिखें और गणना की दोबारा जांच करें।\n\n> *सुझाव:* यदि आपको विस्तृत व्याख्या चाहिए, तो कृपया कुछ क्षण बाद पुनः "पूछें" (Ask) बटन दबाएं।`
        : `### 📌 Janta +2 High School Khalari - AI Tutor\n\n**Class:** ${selectedClass} | **Subject:** ${subject}\n\n**Question:** "${question || 'Question in photo'}"\n\n---\n\n${
            isDemandSpike
              ? '*(Note: Due to high server traffic, quick guidance mode is active. You can retry in a few seconds for full calculation.)*\n\n'
              : ''
          }### 💡 Step-by-Step Problem Solving Guide (JAC Board):\n1. **Identify the Core Concept:** Note down the relevant theorem, law, or formula from your ${subject} syllabus.\n2. **List Given Information:** Clearly state all known variables and what needs to be solved.\n3. **Apply Formula:** Use the standard NCERT/JCERT formula and follow proper SI units.\n4. **Final Step & Verification:** Write the final answer clearly with appropriate units.\n\n> *Tip:* For an in-depth calculation, please tap Send again in a few moments.`;

      generatedAnswer = fallbackText;
    }

    // Create a concise plain-text version for Speech Synthesis voice playback
    const cleanAudioText = generatedAnswer
      .replace(/[#*`_~[\]]/g, '')
      .replace(/\n+/g, '. ')
      .slice(0, 450);

    return NextResponse.json({
      success: true,
      answer: generatedAnswer,
      audioText: cleanAudioText,
    });
  } catch (error: any) {
    console.error('Error in AI Class ask:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'AI Teacher encountered a temporary issue. Please try asking again.',
        error: error?.message || 'Server error',
      },
      { status: 500 }
    );
  }
}
