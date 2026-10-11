import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICheckoutDraft extends Document {
    ip: string;
    name: string;
    phone: string;
    email: string;
    address: string;
    state: string;
    city: string;
    zipCode: string;
    shippingMethod: string;
    paymentMethod: string;
    notes: string;
    lastUpdated: Date;
    createdAt: Date;
}

const CheckoutDraftSchema = new Schema<ICheckoutDraft>({
    ip:            { type: String, required: true },
    name:          { type: String, default: '' },
    phone:         { type: String, default: '' },
    email:         { type: String, default: '' },
    address:       { type: String, default: '' },
    state:         { type: String, default: '' },
    city:          { type: String, default: '' },
    zipCode:       { type: String, default: '' },
    shippingMethod:{ type: String, default: 'inside' },
    paymentMethod: { type: String, default: '' },
    notes:         { type: String, default: '' },
    lastUpdated:   { type: Date, default: Date.now },
}, { timestamps: true });

CheckoutDraftSchema.index({ ip: 1 }, { unique: true });
CheckoutDraftSchema.index({ lastUpdated: 1 }, { expireAfterSeconds: 86400 * 7 });

const CheckoutDraft: Model<ICheckoutDraft> =
    mongoose.models.CheckoutDraft || mongoose.model<ICheckoutDraft>('CheckoutDraft', CheckoutDraftSchema);

export default CheckoutDraft;
