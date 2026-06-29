import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import CheckoutDraft from '@/plugin/checkout-history/models/CheckoutDraft';
import { getSetting } from '@/lib/settings';

export const dynamic = 'force-dynamic';

function getClientIp(req: NextRequest): string {
    const xff = req.headers.get('x-forwarded-for');
    if (xff) {
        const first = xff.split(',')[0].trim();
        if (first) return first;
    }
    const realIp = req.headers.get('x-real-ip');
    if (realIp) return realIp.trim();
    return '127.0.0.1';
}

export async function GET(req: NextRequest) {
    try {
        const enabled = await getSetting('checkout_history_enabled');
        if (enabled === 'false' || enabled === false) {
            return NextResponse.json({ draft: null });
        }

        const ip = getClientIp(req);
        await connectDB();
        const draft = await CheckoutDraft.findOne({ ip }).lean();
        return NextResponse.json({ draft: draft || null });
    } catch (error) {
        console.error('Checkout history GET error:', error);
        return NextResponse.json({ draft: null });
    }
}

export async function POST(req: NextRequest) {
    try {
        const enabled = await getSetting('checkout_history_enabled');
        if (enabled === 'false' || enabled === false) {
            return NextResponse.json({ ok: true });
        }

        const ip = getClientIp(req);
        const body = await req.json();

        const { name, phone, email, address, state, city, zipCode, shippingMethod, paymentMethod, notes } = body;

        if (!name && !phone && !email) {
            return NextResponse.json({ ok: true });
        }

        await connectDB();
        await CheckoutDraft.findOneAndUpdate(
            { ip },
            {
                $set: {
                    name: name || '',
                    phone: phone || '',
                    email: email || '',
                    address: address || '',
                    state: state || '',
                    city: city || '',
                    zipCode: zipCode || '',
                    shippingMethod: shippingMethod || 'inside',
                    paymentMethod: paymentMethod || '',
                    notes: notes || '',
                    lastUpdated: new Date(),
                },
            },
            { upsert: true }
        );

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error('Checkout history POST error:', error);
        return NextResponse.json({ error: 'Failed to save draft' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const enabled = await getSetting('checkout_history_enabled');
        if (enabled === 'false' || enabled === false) {
            return NextResponse.json({ ok: true });
        }

        const ip = getClientIp(req);
        await connectDB();
        await CheckoutDraft.deleteOne({ ip });
        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error('Checkout history DELETE error:', error);
        return NextResponse.json({ error: 'Failed to delete draft' }, { status: 500 });
    }
}
