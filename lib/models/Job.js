import mongoose from 'mongoose';

const JobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String },
  qualification: { type: String },
  location: { type: String },
  lastDate: { type: String },
  applyUrl: { type: String },
  notificationPdf: { type: String },
  description: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Job || mongoose.model('Job', JobSchema);
