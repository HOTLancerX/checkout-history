import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import CheckoutDraft from '@/plugin/checkout-history/models/CheckoutDraft';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const url = new URL(req.url);
        const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
        const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '20')));
        const search = url.searchParams.get('search') || '';

        await connectDB();

        const filter: Record<string, any> = {};
        if (search) {
            filter.$or = [
                { name:  { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { ip:    { $regex: search, $options: 'i' } },
            ];
        }

        const total = await CheckoutDraft.countDocuments(filter);
        const pages = Math.ceil(total / limit);
        const skip = (page - 1) * limit;

        const drafts = await CheckoutDraft.find(filter)
            .sort({ lastUpdated: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        return NextResponse.json({ drafts, total, page, pages });
    } catch (error) {
        console.error('Checkout drafts list error:', error);
        return NextResponse.json({ drafts: [], total: 0, page: 1, pages: 0 });
    }
}
