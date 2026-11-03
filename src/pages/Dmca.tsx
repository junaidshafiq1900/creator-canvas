const Dmca = () => (
  <div className="min-h-screen pt-24 pb-16">
    <div className="container mx-auto px-4 max-w-3xl">
      <h1 className="text-3xl font-bold text-foreground mb-2">DMCA Copyright Policy</h1>
      <p className="text-sm text-muted-foreground mb-8">Last updated: October 2026</p>

      <div className="space-y-6 text-sm text-foreground/80 leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">Reporting Copyright Infringement</h2>
          <p>Joulecorp respects the intellectual property rights of others and responds to valid notices of claimed infringement under the Digital Millennium Copyright Act (DMCA) or equivalent local law.</p>
          <p className="mt-2">If you believe material on the Platform infringes your copyright, submit a notice that includes:</p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>A physical or electronic signature of the copyright owner or a person authorized to act on their behalf.</li>
            <li>Identification of the copyrighted work claimed to have been infringed.</li>
            <li>The exact URL (or other location) of the infringing material on the Platform.</li>
            <li>Your contact information: name, mailing address, telephone number, and email address.</li>
            <li>A statement that you have a good-faith belief the use is not authorized by the copyright owner, its agent, or the law.</li>
            <li>A statement, under penalty of perjury, that the information in your notice is accurate and that you are the copyright owner or authorized to act on their behalf.</li>
          </ul>
          <p className="mt-2">Notices can be submitted using the in-app <strong>Report</strong> feature on any video (choose "Copyright / DMCA") or sent to the platform's designated copyright contact. The designated contact address is published by the platform operator — if no dedicated address is listed yet, use the in-app Report flow, which routes directly to the moderation team.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">What Happens Next</h2>
          <p>Valid notices result in prompt removal or disabling of the allegedly infringing material, and we notify the uploader. Repeat infringers may have their access terminated.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">Counter-Notification</h2>
          <p>If your content was removed and you believe it was misidentified, you may submit a counter-notification containing your signature, identification of the removed material and its prior location, a statement under penalty of perjury that the removal resulted from mistake or misidentification, and your contact information consenting to the jurisdiction of the appropriate court. Valid counter-notices are forwarded to the original reporter, and material may be restored within 10–14 business days unless the reporter files a court action.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">Abuse Warning</h2>
          <p>Knowingly submitting false infringement claims or counter-notifications may expose you to liability for damages, including costs and legal fees, under applicable law.</p>
        </section>
      </div>
    </div>
  </div>
);

export default Dmca;
