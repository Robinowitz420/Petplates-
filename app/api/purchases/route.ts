import { NextRequest, NextResponse } from 'next/server';

/**
 * GET: Returns current purchase count and village level
 * POST: Manually confirm a purchase (for testing/fallback)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // In a real implementation, this would query a database
    // For now, return a placeholder response
    // The actual data is stored in localStorage on the client side
    return NextResponse.json({
      message: 'Purchase data is stored client-side in localStorage',
      userId,
      note: 'Use getPurchaseStats() from lib/utils/purchaseTracking.ts on the client side'
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch purchase data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, ingredientId, ingredientName, amazonOrderId } = body;

    if (!userId || !ingredientId || !ingredientName) {
      return NextResponse.json(
        { error: 'userId, ingredientId, and ingredientName are required' },
        { status: 400 }
      );
    }

    // In a real implementation, this would update a database
    // For now, return a success response
    // The actual confirmation is handled client-side via confirmPurchase()
    return NextResponse.json({
      success: true,
      message: 'Purchase confirmed',
      userId,
      ingredientId,
      ingredientName,
      amazonOrderId,
      note: 'Purchase confirmation is handled client-side via confirmPurchase() from lib/utils/purchaseTracking.ts'
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to confirm purchase' },
      { status: 500 }
    );
  }
}

