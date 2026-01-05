import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Path to the outreach dashboard config
    const configPath = path.join(process.cwd(), 'tools', 'outreach-dashboard', 'data', 'config.json');

    // Read the config file
    const configData = await fs.readFile(configPath, 'utf-8');

    // Parse and validate JSON
    const config = JSON.parse(configData);

    // Return the config
    return NextResponse.json(config);
  } catch (error) {
    console.error('Failed to load outreach config:', error);

    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      {
        code: 'CONFIG_LOAD_ERROR',
        message: `Failed to load outreach config: ${message}`
      },
      { status: 500 }
    );
  }
}
