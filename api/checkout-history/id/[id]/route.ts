import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import CheckoutDraft from '@/plugin/checkout-history/models/CheckoutDraft';

export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await connectDB();
        const draft = await CheckoutDraft.findById(id).lean();
        if (!draft) {
            return NextResponse.json({ error: 'Draft not found' }, { status: 404 });
        }
        return NextResponse.json({ draft });
    } catch (error) {
        console.error('Checkout draft detail error:', error);
        return NextResponse.json({ error: 'Failed to load draft' }, { status: 500 });
    }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await connectDB();
        await CheckoutDraft.findByIdAndDelete(id);
        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error('Checkout draft delete error:', error);
        return NextResponse.json({ error: 'Failed to delete draft' }, { status: 500 });
    }
}
