import { summarizerAgent } from '@/src/mastra/agents/summarizer';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { input } = await request.json();

    if (!input || typeof input !== 'string') {
      return NextResponse.json(
        { error: 'Input is required', success: false },
        { status: 400 }
      );
    }

    const result = await summarizerAgent.generate(input, {
      maxSteps: 5,
    });

    return NextResponse.json({
      text: result.text,
      success: true,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed',
        success: false,
      },
      { status: 500 }
    );
  }
}