import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Path to the outreach dashboard templates JSON
    const templatesPath = path.join(process.cwd(), 'tools', 'outreach-dashboard', 'data', 'templates.json');

    // Read the templates file
    const templatesData = await fs.readFile(templatesPath, 'utf-8');

    // Parse JSON
    const templates = JSON.parse(templatesData);

    // Return the templates
    return NextResponse.json(templates);
  } catch (error) {
    console.error('Failed to load outreach templates:', error);

    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      {
        code: 'TEMPLATES_LOAD_ERROR',
        message: `Failed to load outreach templates: ${message}`
      },
      { status: 500 }
    );
  }
}
