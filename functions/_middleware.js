// P16-175c: 建站过程文件（STATUS.md、docs/ 等）永久下线，返回 410 Gone。
// 只有内部文件受影响，公开页和资源照常走 context.next()。

const GONE_BODY = '410 Gone — this file was intentionally removed from the public site.\n';

function isInternalPath(pathname) {
  const p = pathname.toLowerCase();
  if (p === '/docs' || p.startsWith('/docs/')) return true;
  if (p.endsWith('.md')) return true;              // STATUS.md/README.md/AGENTS.md/LOCK.md 等仓库文件
  if (p.startsWith('/scripts/')) return true;
  if (p === '/.gitignore' || p === '/.gitattributes') return true;
  return false;
}

export async function onRequest(context) {
  const { pathname } = new URL(context.request.url);

  if (isInternalPath(pathname)) {
    return new Response(GONE_BODY, {
      status: 410,
      headers: {
        'content-type': 'text/plain; charset=utf-8',
        'cache-control': 'no-store',
        'x-robots-tag': 'noindex',
      },
    });
  }

  return context.next();
}
