import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

async function connectDB() {
  if (mongoose.connection.readyState >= 1) return;
  if (!MONGODB_URI) throw new Error('Please define the MONGODB_URI environment variable');
  await mongoose.connect(MONGODB_URI);
}

const JobSchema = new mongoose.Schema({
  title: String,
  description: String,
  category: String,
  createdAt: { type: Date, default: Date.now }
});

const Job = mongoose.models.Job || mongoose.model('Job', JobSchema);

export async function GET() {
  try {
    await connectDB();
    const jobs = await Job.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: jobs });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const job = await Job.create(body);
    return NextResponse.json({ success: true, data: job }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
