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
    // @ts-ignore
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
    // @ts-ignore
    const job = await Job.create(body);
    return NextResponse.json({ success: true, data: job }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    await connectDB();
    const url = new URL(req.url);
    let id = url.searchParams.get('id');

    // Agar URL query mein ID nahi hai, toh body se lene ki koshish karo
    if (!id) {
      try {
        const body = await req.json();
        id = body.id;
      } catch (e) {
        // Body parse na ho toh ignore karo
      }
    }

    if (!id) {
      return NextResponse.json({ success: false, error: 'Job ID is missing for deletion' }, { status: 400 });
    }

    // @ts-ignore
    const deletedJob = await Job.findByIdAndDelete(id);
    if (!deletedJob) {
      return NextResponse.json({ success: false, error: 'Job not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Job deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
