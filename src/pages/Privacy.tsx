const Privacy = () => (
  <div className="min-h-screen pt-24 pb-16">
    <div className="container mx-auto px-4 max-w-3xl">
      <h1 className="text-3xl font-bold text-foreground mb-2">Privacy Policy</h1>
      <p className="text-sm text-muted-foreground mb-8">Last updated: October 2026</p>

      <div className="space-y-6 text-sm text-foreground/80 leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">1. Data We Collect</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Account data:</strong> email address, password (stored only as a secure hash), display name, username, bio, and profile images you provide.</li>
            <li><strong>Content:</strong> videos, shorts, posts, comments, and playlists you create.</li>
            <li><strong>Usage data:</strong> watch history, likes and dislikes, subscriptions, comments, and view counts tied to your activity.</li>
            <li><strong>Technical data:</strong> IP address and device/browser information processed by our hosting and infrastructure providers.</li>
          </ul>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">2. How We Use Data</h2>
          <p>We use your data to operate the Platform (hosting and serving videos), personalize your experience (watch history, subscriptions, up-next suggestions), enable social features (comments, replies, notifications), keep the community safe (reports and moderation), and understand aggregate usage so we can improve.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">3. What Is Public</h2>
          <p>Your profile, public videos, shorts, posts, comments, likes, and public playlists are visible to other users. Private playlists are visible only to you. Watch history and dislikes are private to your account.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">4. Sharing &amp; Processors</h2>
          <p>We do not sell personal data. We process data through infrastructure providers (including Supabase for authentication, database, and storage, and our video hosting providers such as Vimeo) strictly to run the service. Advertising, when enabled, is served by Google AdSense and governed by Google's privacy policy.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">5. Your Choices &amp; Rights</h2>
          <p>You can edit or remove your profile information in Settings, clear your watch history, and delete your uploads. To request deletion of your account or a copy of your data, contact the platform team through the contact channel listed on this site. We retain data only as long as needed to provide the service or as required by law.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">6. Children</h2>
          <p>The Platform is not directed at children under 13 (or the applicable minimum age in your country), and we do not knowingly collect their data.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">7. Changes</h2>
          <p>We will post any changes to this policy on this page and update the date above.</p>
        </section>
      </div>
    </div>
  </div>
);

export default Privacy;
