import React, { useEffect } from 'react';

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="space-y-4">
    <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white">{title}</h2>
    <div className="prose prose-slate dark:prose-invert max-w-none">
      {children}
    </div>
  </section>
);

const Blog: React.FC = () => {
  useEffect(() => {
    const prev = document.title;
    document.title = 'Introducing Tutlabs — India’s Free Community Tutoring Platform';
    return () => { document.title = prev; };
  }, []);

  return (
    <div className="max-w-3xl mx-auto space-y-10">
      <header className="text-center space-y-4">
        <p className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold bg-white/60 dark:bg-gray-900/60 text-gray-700 dark:text-gray-200 border border-white/20 dark:border-white/10">Announcements</p>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white drop-shadow-[0_2px_10px_rgba(59,130,246,0.35)]">
          Introducing Tutlabs: India’s Free Community Tutoring Platform
        </h1>
        <p className="text-white/90 text-lg">Built by the community, for the community.</p>
      </header>

      <article className="bg-white/80 dark:bg-gray-900/70 backdrop-blur rounded-2xl shadow p-6 md:p-10 border border-white/20 dark:border-white/10 space-y-10">
        <Section title="Why Tutlabs?">
          <p>
            Are you a parent looking for trustworthy, affordable tutors for your child? Are you an educator seeking genuine opportunities to teach and grow?
            Tutlabs is here to transform how India learns—starting with community, trust, and accessibility for all.
          </p>
          <p>
            Quality education should be open to everyone, not just a privileged few. Traditional tutoring platforms often complicate things with fees, commissions, and barriers.
            At Tutlabs, our mission is clear: empower parents and tutors through a free, open source platform built by the community, for the community.
          </p>
        </Section>

        <Section title="What Makes Us Different?">
          <ul>
            <li><strong>Truly Free</strong>: There are no charges—now or at launch—for parents or tutors. Explore, connect, and start your learning journey without paying any fees.</li>
            <li><strong>Verified & Trusted</strong>: Every tutor’s profile is checked to ensure safety and quality. Parents can make informed decisions based on ratings and community feedback.</li>
            <li><strong>Simple Connections</strong>: Search for tutors by subject, location, or learning style—whether you want home visits or interactive online classes.</li>
            <li><strong>Community Focus</strong>: A transparent, referral-driven network where local knowledge and school/community ties matter.</li>
          </ul>
        </Section>

        <Section title="Upcoming Features">
          <ul>
            <li><strong>Advanced Tutor Discovery</strong>: Personalized recommendations; filter by experience, specialization, and background.</li>
            <li><strong>Seamless Messaging & Booking</strong>: Chat securely, book slots, manage schedules—all inside the platform.</li>
            <li><strong>Learning Progress Tools</strong>: Track sessions, receive feedback, and monitor progress with simple dashboards.</li>
            <li><strong>Interactive Online Learning</strong>: Virtual whiteboards, resource sharing, and group sessions.</li>
            <li><strong>Community Spaces</strong>: Parent forums, tutor groups, and school partnerships for deeper collaboration.</li>
            <li><strong>Verified Badges & Recognition</strong>: Tutors earn badges for excellence, dedication, and parent reviews.</li>
          </ul>
        </Section>

        <Section title="Our Growth Plan">
          <ul>
            <li><strong>Local Community Outreach</strong>: Partnering with schools, neighborhood groups, and educational initiatives.</li>
            <li><strong>Mobile Apps</strong>: Android and iOS apps for convenient access.</li>
            <li><strong>Content Hub</strong>: Expert articles, parent guides, and tutor checklists—helping everyone learn smarter.</li>
          </ul>
        </Section>

        <Section title="Join Us at the Beginning">
          <p>
            Your feedback, ideas, and support shape the Tutlabs experience. We invite you to register, explore, and become a founding member of our growing learning community.
          </p>
          <p className="mt-4">
            Ready to begin? <a href="/#/signup" className="text-blue-600 dark:text-blue-300 underline underline-offset-4">Register today</a> or <a href="/#/connect" className="text-blue-600 dark:text-blue-300 underline underline-offset-4">learn more about us</a>.
          </p>
          <p className="mt-4">Questions or suggestions? Reach out at <a href="mailto:support@tutlabs.in" className="text-blue-600 dark:text-blue-300 underline">support@tutlabs.in</a> or connect on Instagram.</p>
        </Section>
      </article>
    </div>
  );
};

export default Blog;
