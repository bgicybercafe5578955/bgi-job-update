"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import mongoose from "mongoose";
import { createSession, destroySession, verifyCredentials } from "./auth";
import type {
  Category,
  Gender,
  JobPosting,
  JobStatus,
  JobType,
  Qualification,
  VacancyRow,
} from "./types";

const MONGODB_URI = process.env.MONGODB_URI;

async function connectDB() {
  if (mongoose.connection.readyState >= 1) return;
  if (!MONGODB_URI) throw new Error("Please define the MONGODB_URI environment variable");
  await mongoose.connect(MONGODB_URI);
}

const JobSchema = new mongoose.Schema({
  title: String,
  organization: String,
  department: String,
  advertisementNumber: String,
  logoUrl: String,
  slug: { type: String, unique: true, sparse: true },
  totalVacancies: Number,
  vacancyBreakdown: Array,
  location: Object,
  eligibility: Object,
  jobType: String,
  salary: String,
  applicationFee: String,
  dates: Object,
  links: Object,
  content: Object,
  seo: Object,
  featured: Boolean,
  status: String,
  publishAt: String,
  views: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Job = mongoose.models.Job || mongoose.model("Job", JobSchema);

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "") + "-" + Math.floor(1000 + Math.random() * 9000);
}

export async function loginAction(formData: FormData) {
  const username = String(formData.get("username") || "");
  const password = String(formData.get("password") || "");
  const next = String(formData.get("next") || "/admin/dashboard");

  const ok = await verifyCredentials(username, password);
  if (!ok) {
    redirect(`/admin/login?error=1&next=${encodeURIComponent(next)}`);
  }
  await createSession(username);
  redirect(next.startsWith("/admin") ? next : "/admin/dashboard");
}

export async function logoutAction() {
  destroySession();
  redirect("/admin/login");
}

function parseCheckboxList<T extends string>(formData: FormData, name: string): T[] {
  return formData.getAll(name).map((v) => String(v)) as T[];
}

function parseVacancyRows(formData: FormData): VacancyRow[] {
  const posts = formData.getAll("vacancy_post").map(String);
  const cats = formData.getAll("vacancy_category").map(String);
  const counts = formData.getAll("vacancy_count").map(String);
  const rows: VacancyRow[] = [];
  for (let i = 0; i < posts.length; i++) {
    if (!posts[i]?.trim()) continue;
    rows.push({
      post: posts[i],
      category: cats[i] || "",
      count: Number(counts[i]) || 0,
    });
  }
  return rows;
}

function buildJobFromForm(formData: FormData) {
  const genders = parseCheckboxList<Gender>(formData, "gender");
  const categories = parseCheckboxList<Category>(formData, "category");
  const qualifications = parseCheckboxList<Qualification>(formData, "qualification");
  const vacancyBreakdown = parseVacancyRows(formData);
  const totalVacancies =
    Number(formData.get("totalVacancies")) ||
    vacancyBreakdown.reduce((s, r) => s + r.count, 0);

  const publishMode = String(formData.get("publishMode") || "publish");
  let status: JobStatus = "published";
  if (publishMode === "draft") status = "draft";
  else if (publishMode === "schedule") status = "scheduled";

  const title = String(formData.get("title") || "");

  return {
    title,
    organization: String(formData.get("organization") || ""),
    department: String(formData.get("department") || ""),
    advertisementNumber: String(formData.get("advertisementNumber") || ""),
    logoUrl: String(formData.get("logoUrl") || ""),
    totalVacancies,
    vacancyBreakdown,
    location: {
      state: String(formData.get("state") || "Maharashtra"),
      district: String(formData.get("district") || "") || undefined,
      allIndia: formData.get("allIndia") === "on",
    },
    eligibility: {
      genders: genders.length ? genders : ["male", "female"],
      categories,
      qualifications,
      minAge: formData.get("minAge") ? Number(formData.get("minAge")) : undefined,
      maxAge: formData.get("maxAge") ? Number(formData.get("maxAge")) : undefined,
      ageRelaxation: String(formData.get("ageRelaxation") || "") || undefined,
    },
    jobType: (String(formData.get("jobType") || "government") as JobType),
    salary: String(formData.get("salary") || "") || undefined,
    applicationFee: String(formData.get("applicationFee") || "") || undefined,
    dates: {
      startDate: String(formData.get("startDate") || "") || undefined,
      lastDate: String(formData.get("lastDate") || new Date().toISOString().slice(0, 10)),
      examDate: String(formData.get("examDate") || "") || undefined,
    },
    links: {
      applyOnline: String(formData.get("applyOnline") || "") || undefined,
      officialNotification: String(formData.get("officialNotification") || "") || undefined,
      officialWebsite: String(formData.get("officialWebsite") || "") || undefined,
    },
    content: {
      eligibility: String(formData.get("content_eligibility") || "") || undefined,
      vacancyDetails: String(formData.get("content_vacancyDetails") || "") || undefined,
      selectionProcess: String(formData.get("content_selectionProcess") || "") || undefined,
      howToApply: String(formData.get("content_howToApply") || "") || undefined,
      importantInstructions: String(formData.get("content_importantInstructions") || "") || undefined,
    },
    seo: {
      title: String(formData.get("seoTitle") || "") || undefined,
      metaDescription: String(formData.get("seoDescription") || "") || undefined,
    },
    featured: formData.get("featured") === "on",
    status,
    publishAt:
      publishMode === "schedule" && formData.get("publishAt")
        ? new Date(String(formData.get("publishAt"))).toISOString()
        : undefined,
  };
}

export async function createJobAction(formData: FormData) {
  await connectDB();
  const jobData = buildJobFromForm(formData);
  const slug = generateSlug(jobData.title);
  // @ts-ignore
  const created = await Job.create({ ...jobData, slug, views: 0, createdAt: new Date() });
  
  revalidatePath("/admin/jobs");
  revalidatePath("/jobs");
  revalidatePath("/");
  redirect(`/admin/jobs?created=${slug}`);
}

export async function updateJobAction(id: string, formData: FormData) {
  await connectDB();
  const jobData = buildJobFromForm(formData);
  // @ts-ignore
  await Job.findByIdAndUpdate(id, { ...jobData, updatedAt: new Date() });

  revalidatePath("/admin/jobs");
  revalidatePath("/jobs");
  revalidatePath("/");
  redirect(`/admin/jobs?updated=${id}`);
}

export async function deleteJobAction(formData: FormData) {
  await connectDB();
  const id = String(formData.get("id") || "");
  if (id) {
    // @ts-ignore
    await Job.findByIdAndDelete(id);
  }
  revalidatePath("/admin/jobs");
  revalidatePath("/jobs");
  revalidatePath("/");
}

export async function toggleFeaturedAction(formData: FormData) {
  await connectDB();
  const id = String(formData.get("id") || "");
  // @ts-ignore
  const job = await Job.findById(id);
  if (job) {
    // @ts-ignore
    await Job.findByIdAndUpdate(id, { featured: !job.featured });
  }
  revalidatePath("/admin/jobs");
  revalidatePath("/");
}

export async function toggleExpiredAction(formData: FormData) {
  await connectDB();
  const id = String(formData.get("id") || "");
  // @ts-ignore
  const job = await Job.findById(id);
  if (job) {
    const newStatus = job.status === "expired" ? "published" : "expired";
    // @ts-ignore
    await Job.findByIdAndUpdate(id, { status: newStatus });
  }
  revalidatePath("/admin/jobs");
  revalidatePath("/jobs");
}
