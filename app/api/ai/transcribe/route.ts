import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(req: NextRequest) {
  try {
    let audioBase64 = '';
    let mimeType = 'audio/webm';
    let language = 'hi';

    // Support both multipart/form-data and application/json
    const contentType = req.headers.get('content-type') || '';
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('audio') as File | null;
      language = (formData.get('language') as string) || 'hi';

      if (!file) {
        return NextResponse.json(
          { success: false, message: 'No audio file provided' },
          { status: 400 }
        );
      }

      mimeType = file.type || 'audio/webm';
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      audioBase64 = buffer.toString('base64');
    } else {
      const body = await req.json();
      audioBase64 = body.audioBase64;
      mimeType = body.mimeType || 'audio/webm';
      language = body.language || 'hi';
    }

    if (!audioBase64) {
      return NextResponse.json(
        { success: false, message: 'Audio data is required' },
        { status: 400 }
      );
    }

    // Clean base64 string if it contains data URL scheme
    const cleanBase64 = audioBase64.replace(/^data:audio\/\w+;base64,/, '');

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          message: 'Gemini API key is not configured. Please configure it in Settings > Secrets.',
        },
        { status: 503 }
      );
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const promptText =
      language === 'hi'
        ? 'Accurately transcribe this audio into Hindi (Devanagari script) or English as spoken by the user. Transcribe only the exact spoken words with correct punctuation, and do not add any additional commentary or preamble.'
        : 'Accurately transcribe this audio into clear text. Transcribe only the exact spoken words with correct punctuation, and do not add any additional commentary or preamble.';

    // Model required: gemini-3.5-transcribe
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-transcribe',
      contents: [
        {
          inlineData: {
            mimeType: mimeType.split(';')[0], // Clean codecs from mimeType e.g. "audio/webm;codecs=opus" -> "audio/webm"
            data: cleanBase64,
          },
        },
        promptText,
      ],
    });

    const transcription = response.text ? response.text.trim() : '';

    if (!transcription) {
      return NextResponse.json(
        {
          success: false,
          message: 'Could not detect clear speech in the audio recording. Please speak clearly and try again.',
        },
        { status: 422 }
      );
    }

    return NextResponse.json({
      success: true,
      transcription,
    });
  } catch (error: any) {
    console.error('Error during audio transcription with gemini-3.5-transcribe:', error);
    return NextResponse.json(
      {
        success: false,
        message: error?.message || 'Failed to transcribe audio. Please try again.',
      },
      { status: 500 }
    );
  }
}
