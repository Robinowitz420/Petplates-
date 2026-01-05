import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import sgMail from '@sendgrid/mail';

// Initialize SendGrid
const sendGridApiKey = process.env.SENDGRID_API_KEY;
if (sendGridApiKey) {
  sgMail.setApiKey(sendGridApiKey);
}

interface SendEmailRequest {
  to: string;
  subject: string;
  html: string;
  from?: string;
  influencerId?: string;
  platform?: string;
}

export async function POST(request: Request) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { code: 'UNAUTHORIZED', message: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if SendGrid is configured
    if (!sendGridApiKey) {
      return NextResponse.json(
        { code: 'CONFIG_ERROR', message: 'Email service not configured' },
        { status: 500 }
      );
    }

    const body: SendEmailRequest = await request.json();
    const { to, subject, html, from, influencerId, platform } = body;

    // Validate required fields
    if (!to || !subject || !html) {
      return NextResponse.json(
        { code: 'VALIDATION_ERROR', message: 'Missing required fields: to, subject, html' },
        { status: 400 }
      );
    }

    // Prepare email data
    const msg = {
      to: to,
      from: from || process.env.FROM_EMAIL || 'noreply@paws-and-plates.vercel.app',
      subject: subject,
      html: html,
      // Add tracking for outreach
      customArgs: {
        influencerId: influencerId || '',
        platform: platform || '',
        campaign: 'influencer_outreach'
      }
    };

    // Send email
    const result = await sgMail.send(msg);

    console.log(`[outreach] Email sent to ${to} for influencer ${influencerId}`);

    return NextResponse.json({
      success: true,
      messageId: result[0]?.headers?.['x-message-id'] || 'sent',
      to: to,
      influencerId: influencerId
    });

  } catch (error) {
    console.error('Failed to send email:', error);

    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      {
        code: 'SEND_ERROR',
        message: `Failed to send email: ${message}`
      },
      { status: 500 }
    );
  }
}
