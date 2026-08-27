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

export async function GET(req: Request, context: any) {
  try {
    await connectDB();
    const params = await context.params;
    const job = await Job.findById(params.id);
    if (!job) return NextResponse.json({ success: false, error: 'Job not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: job });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request, context: any) {
  try {
    await connectDB();
    const params = await context.params;
    const body = await req.json();
    const updatedJob = await Job.findByIdAndUpdate(params.id, body, { new: true });
    return NextResponse.json({ success: true, data: updatedJob });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, context: any) {
  try {
    await connectDB();
    const params = await context.params;
    await Job.findByIdAndDelete(params.id);
    return NextResponse.json({ success: true, message: 'Job deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
