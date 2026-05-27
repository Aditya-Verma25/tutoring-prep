import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const POSTS_PATH = path.join(ROOT, "public", "blog-posts.json");
const BLOG_DIR = path.join(ROOT, "public", "blog");
const SITE_URL = "https://futurereadyprep.org";

function escapeHtml(value = "") {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function formatDate(dateStr) {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function baseStyles() {
  return `
    :root { color-scheme: light; }
    body { margin: 0; font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial; background:#f7fbff; color:#0f172a; }
    .wrap { max-width: 920px; margin: 0 auto; padding: 32px 24px; }
    .card { background: #fff; border: 1px solid #e2e8f0; border-radius: 22px; padding: 28px; box-shadow: 0 8px 24px rgba(15,23,42,.06); }
    .btn { display:inline-block; border-radius: 12px; padding: 10px 14px; font-weight:700; text-decoration:none; }
    .btn-primary { background:#1d4ed8; color:#fff; }
    .btn-secondary { background:#fff; color:#334155; border:1px solid #e2e8f0; }
    .meta { color:#64748b; font-size: 13px; }
    .grid { display:grid; gap:16px; grid-template-columns: repeat(auto-fit,minmax(280px,1fr)); }
    .post-card { border:1px solid #e2e8f0; border-radius:18px; overflow:hidden; background:#f8fafc; }
    .post-card img { width:100%; height:170px; object-fit:cover; display:block; }
    .post-card .content { padding:14px; }
    .tag { color:#1d4ed8; text-transform:uppercase; letter-spacing:.09em; font-weight:800; font-size:11px; }
    h1,h2 { margin:0; line-height:1.12; }
    h1 { font-size: clamp(1.9rem, 5vw, 2.7rem); }
    h2 { font-size: clamp(1.25rem, 4vw, 1.7rem); margin-top: 24px; }
    p,li { color:#334155; line-height:1.7; }
    ul { padding-left: 20px; }
    .hero { width:100%; height:320px; object-fit:cover; border-radius:14px; border:1px solid #e2e8f0; margin-top:16px; }
    .top-actions { display:flex; flex-wrap:wrap; gap:8px; margin-bottom:18px; }
    .share { display:flex; gap:8px; flex-wrap:wrap; margin-top:20px; }
  `;
}

function blogIndexHtml(posts) {
  const cards = posts
    .map((post) => {
      const url = `/blog/${post.slug}/`;
      const linkedIn = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
        `${SITE_URL}${url}`,
      )}`;
      const share = `https://twitter.com/intent/tweet?url=${encodeURIComponent(
        `${SITE_URL}${url}`,
      )}&text=${encodeURIComponent(post.title)}`;
      return `
        <article class="post-card">
          <img src="${escapeHtml(post.imageUrl)}" alt="${escapeHtml(post.title)}" loading="lazy" />
          <div class="content">
            <p class="tag">${escapeHtml(post.topic)}</p>
            <h2>${escapeHtml(post.title)}</h2>
            <p>${escapeHtml(post.excerpt)}</p>
            <p class="meta">${escapeHtml(formatDate(post.publishedAt))} • ${post.readTimeMinutes} min read</p>
            <div class="share">
              <a class="btn btn-primary" href="${url}">Read</a>
              <a class="btn btn-secondary" href="${linkedIn}" target="_blank" rel="noopener noreferrer">LinkedIn</a>
              <a class="btn btn-secondary" href="${share}" target="_blank" rel="noopener noreferrer">Share</a>
            </div>
          </div>
        </article>
      `;
    })
    .join("\n");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>FutureReady Blog | SAT & College Admissions Tips</title>
  <meta name="description" content="Useful SAT prep and college admissions articles for students and families." />
  <link rel="canonical" href="${SITE_URL}/blog/" />
  <meta property="og:title" content="FutureReady Blog | SAT & College Admissions Tips" />
  <meta property="og:description" content="Useful SAT prep and college admissions articles for students and families." />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${SITE_URL}/blog/" />
  <meta property="og:image" content="${posts[0] ? escapeHtml(posts[0].imageUrl) : `${SITE_URL}/logo.png`}" />
  <style>${baseStyles()}</style>
</head>
<body>
  <main class="wrap">
    <div class="top-actions">
      <a class="btn btn-secondary" href="/">← Back to Home</a>
    </div>
    <section class="card">
      <p class="tag">FutureReady Blog</p>
      <h1>SAT + College Admissions Insights</h1>
      <p>Practical, student-friendly strategies for SAT prep, essays, activities, and college planning.</p>
      <div class="grid">
        ${cards}
      </div>
    </section>
  </main>
</body>
</html>`;
}

function articleHtml(post) {
  const articlePath = `/blog/${post.slug}/`;
  const articleUrl = `${SITE_URL}${articlePath}`;
  const linkedIn = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(articleUrl)}`;
  const share = `https://twitter.com/intent/tweet?url=${encodeURIComponent(articleUrl)}&text=${encodeURIComponent(post.title)}`;

  const sections = post.sections
    .map(
      (section) => `
      <section>
        <h2>${escapeHtml(section.heading)}</h2>
        <ul>
          ${section.points.map((point) => `<li>${escapeHtml(point)}</li>`).join("")}
        </ul>
      </section>
    `,
    )
    .join("\n");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    image: [post.imageUrl],
    author: { "@type": "Person", name: "Aditya Verma" },
    publisher: {
      "@type": "Organization",
      name: "FutureReady Prep",
      logo: { "@type": "ImageObject", url: `${SITE_URL}/logo.png` },
    },
    mainEntityOfPage: articleUrl,
    description: post.excerpt,
  };

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(post.title)} | FutureReady Prep Blog</title>
  <meta name="description" content="${escapeHtml(post.excerpt)}" />
  <link rel="canonical" href="${articleUrl}" />
  <meta property="og:title" content="${escapeHtml(post.title)}" />
  <meta property="og:description" content="${escapeHtml(post.excerpt)}" />
  <meta property="og:type" content="article" />
  <meta property="og:url" content="${articleUrl}" />
  <meta property="og:image" content="${escapeHtml(post.imageUrl)}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(post.title)}" />
  <meta name="twitter:description" content="${escapeHtml(post.excerpt)}" />
  <meta name="twitter:image" content="${escapeHtml(post.imageUrl)}" />
  <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
  <style>${baseStyles()}</style>
</head>
<body>
  <main class="wrap">
    <div class="top-actions">
      <a class="btn btn-secondary" href="/">← Home</a>
      <a class="btn btn-secondary" href="/blog/">Back to Blog Hub</a>
    </div>
    <article class="card">
      <p class="tag">${escapeHtml(post.topic)}</p>
      <h1>${escapeHtml(post.title)}</h1>
      <p class="meta">${escapeHtml(formatDate(post.publishedAt))} • ${post.readTimeMinutes} min read</p>
      <img class="hero" src="${escapeHtml(post.imageUrl)}" alt="${escapeHtml(post.title)}" />
      ${post.imageAttribution ? `<p class="meta">${escapeHtml(post.imageAttribution)}</p>` : ""}
      <p>${escapeHtml(post.excerpt)}</p>
      ${sections}
      ${post.cta ? `<section><h2>Key Takeaway</h2><p>${escapeHtml(post.cta)}</p></section>` : ""}
      <div class="share">
        <a class="btn btn-primary" href="${linkedIn}" target="_blank" rel="noopener noreferrer">Share on LinkedIn</a>
        <a class="btn btn-secondary" href="${share}" target="_blank" rel="noopener noreferrer">Share Link</a>
      </div>
    </article>
  </main>
</body>
</html>`;
}

function writeSitemap(posts) {
  const urls = [
    { loc: `${SITE_URL}/`, priority: "1.0" },
    { loc: `${SITE_URL}/blog/`, priority: "0.9" },
    ...posts.map((post) => ({
      loc: `${SITE_URL}/blog/${post.slug}/`,
      priority: "0.8",
      lastmod: post.publishedAt,
    })),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
${u.lastmod ? `    <lastmod>${u.lastmod}</lastmod>` : ""}    <priority>${u.priority}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>
`;

  fs.writeFileSync(path.join(ROOT, "public", "sitemap.xml"), xml, "utf-8");
}

function main() {
  if (!fs.existsSync(POSTS_PATH)) {
    console.error("public/blog-posts.json not found");
    process.exit(1);
  }

  const posts = JSON.parse(fs.readFileSync(POSTS_PATH, "utf-8"));
  ensureDir(BLOG_DIR);

  fs.writeFileSync(path.join(BLOG_DIR, "index.html"), blogIndexHtml(posts), "utf-8");

  for (const post of posts) {
    const postDir = path.join(BLOG_DIR, post.slug);
    ensureDir(postDir);
    fs.writeFileSync(path.join(postDir, "index.html"), articleHtml(post), "utf-8");
  }

  writeSitemap(posts);
  console.log(`Generated ${posts.length} static blog pages + sitemap`);
}

main();
