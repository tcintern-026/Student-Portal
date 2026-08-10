// app/contact/page.tsx

import PageHeader from "@/components/PageHeader";

export const metadata = {
  title: "Contact · Student Course Portal",
};

export default function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow="Get in touch"
        title="Contact us"
        description="Questions about a course or enrollment? Send a message — this form isn't wired to a backend yet."
      />
      <form className="mx-auto max-w-xl space-y-5 px-6 py-10">
        <div>
          <label htmlFor="name" className="font-body text-sm font-medium text-ink-950">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            className="mt-1 w-full rounded-md border border-ink-900/20 bg-white px-3 py-2 font-body text-sm text-ink-950 focus-visible:border-highlight-500"
            placeholder="Your full name"
          />
        </div>
        <div>
          <label htmlFor="email" className="font-body text-sm font-medium text-ink-950">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            className="mt-1 w-full rounded-md border border-ink-900/20 bg-white px-3 py-2 font-body text-sm text-ink-950 focus-visible:border-highlight-500"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label htmlFor="message" className="font-body text-sm font-medium text-ink-950">
            Message
          </label>
          <textarea
            id="message"
            name="message"
            rows={5}
            className="mt-1 w-full rounded-md border border-ink-900/20 bg-white px-3 py-2 font-body text-sm text-ink-950 focus-visible:border-highlight-500"
            placeholder="How can we help?"
          />
        </div>
        <button
          type="submit"
          className="rounded-md bg-ink-950 px-5 py-3 font-body text-sm font-medium text-paper transition hover:bg-ink-900"
        >
          Send message
        </button>
      </form>
    </>
  );
}
