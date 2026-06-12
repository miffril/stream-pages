const fs = require("node:fs");
const path = require("node:path");

const projectRoot = path.resolve(__dirname, "../..");
const dataPath = path.resolve(projectRoot, "src/data/commands.json");
const cssPath = path.resolve(projectRoot, "src/styles/main.css");
const faviconPath = path.resolve(projectRoot, "src/favicon.svg");
const distDir = path.resolve(projectRoot, "dist");
const distStylesDir = path.resolve(distDir, "styles");

function readJson(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  return JSON.parse(raw);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatCommandCount(count) {
  const mod10 = count % 10;
  const mod100 = count % 100;

  if (mod10 === 1 && mod100 !== 11) {
    return `${count} команда`;
  }

  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return `${count} команды`;
  }

  return `${count} команд`;
}

function renderCommand(command) {
  const chips = command.triggers
    .map(
      (trigger) =>
        `<button class=\"chip\" type=\"button\" data-copy=\"${escapeHtml(trigger)}\" aria-label=\"Скопировать команду ${escapeHtml(trigger)}\">${escapeHtml(trigger)}</button>`
    )
    .join("\n");

  return `
    <article class="command">
      <p class="command-triggers">${chips}</p>
      <p class="command-description">${escapeHtml(command.description)}</p>
    </article>
  `;
}

function renderCategory(category) {
  const commands = category.commands.map(renderCommand).join("\n");

  return `
    <section class="category">
      <div class="category-header">
        <h2 class="category-title">${escapeHtml(category.name)}</h2>
        <span class="category-count">${formatCommandCount(category.commands.length)}</span>
      </div>
      <div class="command-list">
        ${commands}
      </div>
    </section>
  `;
}

function renderPage(data) {
  const categories = data.categories.map(renderCategory).join("\n");
  const generatedAt = new Date().toISOString().slice(0, 10);

  return `<!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="dark">
  <meta name="theme-color" content="#0a0f16">
  <meta name="description" content="${escapeHtml(data.description || "Команды Twitch-чата")}">
  <title>${escapeHtml(data.title)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Space+Grotesk:wght@400;500;700&display=swap" rel="stylesheet">
  <link rel="icon" href="favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="styles/main.css">
</head>
<body>
  <main class="page">
    <header class="hero">
      <h1 class="title">${escapeHtml(data.title)}</h1>
      <p class="subtitle">${escapeHtml(data.description || "Команды и их описания")}</p>
      <p class="meta">Обновлено: ${escapeHtml(data.lastUpdated || generatedAt)}</p>
      <p class="hint">Нажмите на команду, чтобы скопировать её в буфер.</p>
    </header>

    <section class="categories">
      ${categories}
    </section>

  </main>

  <div class="toast" role="status" aria-live="polite" aria-atomic="true"></div>

  <script>
    (() => {
      const toast = document.querySelector('.toast');

      const showToast = (message, chipEl) => {
        const rect = chipEl.getBoundingClientRect();
        toast.textContent = message;
        toast.style.left = (rect.left + rect.width / 2 + window.scrollX) + 'px';
        toast.style.top = (rect.top + window.scrollY - 6) + 'px';
        toast.classList.add('toast-visible');

        window.clearTimeout(showToast.timerId);
        showToast.timerId = window.setTimeout(() => {
          toast.classList.remove('toast-visible');
        }, 1100);
      };

      document.addEventListener('click', async (event) => {
        const chip = event.target.closest('[data-copy]');
        if (!chip) {
          return;
        }

        const value = chip.getAttribute('data-copy');
        if (!value) {
          return;
        }

        try {
          await navigator.clipboard.writeText(value);
          chip.classList.add('chip-copied');
          window.setTimeout(() => chip.classList.remove('chip-copied'), 420);
          showToast('Скопировано!', chip);
        } catch {
          showToast('Ошибка', chip);
        }
      });
    })();
  </script>
</body>
</html>
`;
}

function run() {
  const data = readJson(dataPath);
  const html = renderPage(data);

  fs.mkdirSync(distDir, { recursive: true });
  fs.mkdirSync(distStylesDir, { recursive: true });

  fs.copyFileSync(cssPath, path.join(distStylesDir, "main.css"));
  fs.copyFileSync(faviconPath, path.join(distDir, "favicon.svg"));
  fs.writeFileSync(path.join(distDir, "index.html"), html, "utf8");

  console.log("Build complete: dist/index.html");
}

run();
