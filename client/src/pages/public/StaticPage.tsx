interface StaticPageProps {
  title: string;
}

/**
 * CMS-driven pages (About, FAQ, Legal, etc.) will be sourced from the CMS module in a later
 * phase. This renders a real page shell now so routes/links/SEO structure are stable.
 */
export default function StaticPage({ title }: StaticPageProps) {
  return (
    <div className="container-page py-16">
      <div className="mx-auto max-w-3xl">
        <h1 className="font-display text-3xl font-bold text-ink-900 sm:text-4xl">{title}</h1>
        <div className="mt-6 space-y-4 text-ink-600">
          <p>
            This content is managed through the platform's CMS so the team can update it without a
            code deployment. Content for this page will appear here once published.
          </p>
        </div>
      </div>
    </div>
  );
}
