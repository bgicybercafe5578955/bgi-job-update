import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Job from '@/models/Job';

export async function GET(req: Request, context: any) {
  try {
    await connectToDatabase();
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
    await connectToDatabase();
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
    await connectToDatabase();
    const params = await context.params;
    await Job.findByIdAndDelete(params.id);
    return NextResponse.json({ success: true, message: 'Job deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
