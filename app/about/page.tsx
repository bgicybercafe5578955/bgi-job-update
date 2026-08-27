import type { Metadata } from "next";

export const metadata: Metadata = { title: "About Us" };

export default function AboutPage() {
  return (
    <div className="container-page py-10 max-w-3xl prose-sm">
      <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink-900 mb-4">About BGI Job Update</h1>
      <div className="space-y-4 text-sm leading-relaxed text-ink-800">
        <p>
          BGI Job Update is an independent job information portal that helps
          candidates across India discover government and private job
          vacancies they are actually eligible for — filtered by gender,
          category, qualification, location and more.
        </p>
        <p>
          We aggregate publicly available recruitment notifications and
          present them in a clean, mobile-friendly format so job seekers
          spend less time searching and more time preparing.
        </p>
        <p>
          BGI Job Update is not affiliated with any government department,
          recruitment board, or private employer. Always verify details on
          the official notification before applying or making any payment.
        </p>
      </div>
    </div>
  );
}
