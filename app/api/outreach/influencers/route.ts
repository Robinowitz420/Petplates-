import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// Simple CSV parser that handles quoted fields
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Escaped quote
        current += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // Field separator
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  // Add the last field
  result.push(current);

  return result.map(field => field.trim());
}

export async function GET() {
  try {
    // For now, return mock data while we fix CSV parsing
    const mockInfluencers = [
      {
        id: 'instagram_sarahsdoglife_1',
        displayName: 'Sarah Johnson',
        platform: 'instagram',
        handle: 'sarahsdoglife',
        profileUrl: 'https://instagram.com/sarahsdoglife',
        email: 'sarah@example.com',
        tags: 'dog lover',
        personalizationNotes: 'pet parent|professional photographer|dog training enthusiast',
        recentContentHook: '',
        status: 'not_contacted',
        lastContactedAt: '',
        notes: 'New lead from dog community forum'
      },
      {
        id: 'tiktok_mikespets_2',
        displayName: 'Mike Chen',
        platform: 'tiktok',
        handle: 'mikespets',
        email: 'mikespets@example.com',
        tags: 'pet blogger',
        personalizationNotes: 'cat owner|tech enthusiast|pet product reviewer',
        recentContentHook: '',
        status: 'contacted',
        lastContactedAt: '2024-01-15T10:30:00Z',
        notes: 'Initial contact made via DM, waiting for response'
      },
      {
        id: 'youtube_vetemily_3',
        displayName: 'Dr. Emily Rodriguez',
        platform: 'youtube',
        handle: 'vetemily',
        profileUrl: 'https://youtube.com/@vetemily',
        email: 'emily.vet@example.com',
        tags: 'veterinarian',
        personalizationNotes: 'bird specialist|reptile expert|exotic pets',
        recentContentHook: '',
        status: 'replied',
        lastContactedAt: '2024-01-10T14:20:00Z',
        notes: 'Responded positively to initial outreach, interested in partnership'
      },
      {
        id: 'instagram_rodneyhabib_4',
        displayName: 'Rodney Habib',
        platform: 'instagram',
        handle: 'rodneyhabib',
        profileUrl: 'https://www.instagram.com/rodneyhabib/',
        tags: 'dog-nutrition,holistic,real-food',
        personalizationNotes: 'Forever Dog / Planet Paws; trusted voice on fresh feeding; strong education focus',
        recentContentHook: '',
        status: 'not_contacted',
        lastContactedAt: '',
        notes: ''
      }
    ];

    // Try to load real data, fall back to mock data
    try {
      const csvPath = path.join(process.cwd(), 'tools', 'outreach-dashboard', 'data', 'influencers.csv');
      const csvData = await fs.readFile(csvPath, 'utf-8');
      const lines = csvData.trim().split('\n');

      if (lines.length > 1) {
        const headers = parseCSVLine(lines[0]);
        const realInfluencers = lines.slice(1).map((line, index) => {
          try {
            const values = parseCSVLine(line);
            const influencer: any = {};

            headers.forEach((header, headerIndex) => {
              const value = values[headerIndex] || '';
              influencer[header] = value.replace(/^"|"$/g, '');
            });

            // Ensure unique IDs by combining platform and handle if needed
            if (!influencer.id || influencer.id === 'id') {
              // Skip header rows that got parsed as data
              return null;
            }

            // Make IDs unique by combining platform and handle to avoid conflicts
            const originalId = influencer.id;
            influencer.id = `${influencer.platform}_${influencer.handle}_${originalId}`.replace(/[^a-zA-Z0-9_]/g, '_');

            return influencer;
          } catch (error) {
            console.warn(`Skipping malformed line ${index + 2} in CSV`);
            return null;
          }
        }).filter(Boolean);

        if (realInfluencers.length > 0) {
          return NextResponse.json({ influencers: realInfluencers });
        }
      }
    } catch (csvError) {
      console.warn('Could not load CSV, using mock data:', csvError);
    }

    // Return mock data as fallback
    return NextResponse.json({ influencers: mockInfluencers });
  } catch (error) {
    console.error('Failed to load outreach influencers:', error);

    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      {
        code: 'INFLUENCERS_LOAD_ERROR',
        message: `Failed to load outreach influencers: ${message}`
      },
      { status: 500 }
    );
  }
}
