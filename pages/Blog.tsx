import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

type BlogPost = {
  id: string; // anchor id
  title: string;
  date: string; // ISO date
  theme?: string; // category/tag
  excerpt: string;
  content: string; // plain text paragraphs separated by \n\n
};

const pageSize = 5;

const Blog: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [params, setParams] = useSearchParams();

  useEffect(() => {
    const prev = document.title;
    document.title = 'Tutlabs Blog — Community Updates & Announcements';
    return () => { document.title = prev; };
  }, []);

  useEffect(() => {
    // Load posts dynamically from public/blog.json
    fetch('/blog.json', { headers: { 'Accept': 'application/json' }})
      .then((r) => r.json())
      .then((data: BlogPost[]) => {
        const sorted = [...data].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setPosts(sorted);
        // Auto-expand anchor target
        const anchor = window.location.hash?.replace('#', '');
        if (anchor) setExpanded((e) => ({ ...e, [anchor]: true }));
      })
      .catch(() => setPosts([]));
  }, []);

  const currentPage = Math.max(1, parseInt(params.get('page') || '1', 10));
  const totalPages = Math.max(1, Math.ceil(posts.length / pageSize));
  const pagePosts = useMemo(() => posts.slice((currentPage - 1) * pageSize, currentPage * pageSize), [posts, currentPage]);

  const goPage = (p: number) => {
    const page = Math.min(Math.max(1, p), totalPages);
    setParams((prev) => { prev.set('page', String(page)); return prev; });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggle = (id: string) => setExpanded((e) => ({ ...e, [id]: !e[id] }));

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      <header className="space-y-4">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white drop-shadow-[0_2px_10px_rgba(59,130,246,0.35)]">tutlabs blog</h1>
        <p className="text-white/90">News, community stories, and platform updates.</p>
      </header>

      {/* Table of Contents */}
      <aside className="bg-white/80 dark:bg-gray-900/70 backdrop-blur rounded-xl border border-white/20 dark:border-white/10 p-4 md:sticky md:top-24">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-3">Recent posts</h2>
        <ul className="space-y-2">
          {posts.slice(0, 10).map((p) => (
            <li key={p.id}>
              <a href={`#${p.id}`} className="text-blue-700 dark:text-blue-300 hover:underline">
                {p.title} <span className="text-xs text-gray-500 ml-1">{new Date(p.date).toLocaleDateString()}</span>
              </a>
            </li>
          ))}
        </ul>
      </aside>

      {/* Posts list */}
      <div className="space-y-12">
        {pagePosts.map((p, idx) => {
          const isOpen = !!expanded[p.id];
          const hasImage = (p as any).image;
          const invert = idx % 2 === 1;
          return (
            <article
              key={p.id}
              id={p.id}
              className="grid gap-6 md:grid-cols-2 items-center group opacity-0 translate-y-6 transition-all duration-700"
              ref={(el) => {
                if (!el) return;
                const obs = new IntersectionObserver((entries) => {
                  entries.forEach((e) => {
                    if (e.isIntersecting) {
                      el.classList.remove('opacity-0', 'translate-y-6');
                      el.classList.add('opacity-100', 'translate-y-0');
                      obs.disconnect();
                    }
                  });
                }, { threshold: 0.2 });
                obs.observe(el);
              }}
            >
              {hasImage && (
                <div className={invert ? 'md:order-2' : ''}>
                  <img
                    src={(p as any).image}
                    alt={(p as any).imageAlt || p.title}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-56 md:h-full max-h-80 object-cover rounded-2xl shadow-xl border border-white/20 dark:border-white/10"
                  />
                </div>
              )}

              <div className={`bg-white/80 dark:bg-gray-900/70 backdrop-blur rounded-2xl shadow border border-white/20 dark:border-white/10 p-6 ${invert && hasImage ? 'md:order-1' : ''}`}>
                <header className="mb-3">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{p.title}</h2>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 flex items-center gap-2">
                    <span>{new Date(p.date).toLocaleDateString()}</span>
                    {p.theme && <span className="px-2 py-0.5 rounded-full bg-gray-200/70 dark:bg-gray-800/70 text-gray-800 dark:text-gray-200">{p.theme}</span>}
                  </p>
                </header>
                <div className="text-gray-800 dark:text-gray-200 text-sm leading-7">
                  {!isOpen ? (
                    <p>{p.excerpt}</p>
                  ) : (
                    p.content.split('\n\n').map((para, i) => (
                      <p key={i} className={i ? 'mt-3' : ''}>{para}</p>
                    ))
                  )}
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <a href={`#${p.id}`} onClick={(e) => { e.preventDefault(); toggle(p.id); }} className="text-sm font-semibold text-blue-700 dark:text-blue-300 hover:underline">
                    {isOpen ? 'Collapse' : 'Read More'}
                  </a>
                  <a href={`#${p.id}`} className="text-sm text-gray-600 dark:text-gray-400 hover:underline">Share link</a>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <nav className="flex items-center justify-between bg-white/70 dark:bg-gray-900/60 backdrop-blur rounded-xl border border-white/20 dark:border-white/10 p-3">
          <button onClick={() => goPage(currentPage - 1)} disabled={currentPage === 1} className="px-4 py-2 rounded-md text-sm bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 disabled:opacity-50">Previous</button>
          <span className="text-sm text-gray-700 dark:text-gray-300">Page {currentPage} of {totalPages}</span>
          <button onClick={() => goPage(currentPage + 1)} disabled={currentPage === totalPages} className="px-4 py-2 rounded-md text-sm bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 disabled:opacity-50">Next</button>
        </nav>
      )}
    </div>
  );
};

export default Blog;
