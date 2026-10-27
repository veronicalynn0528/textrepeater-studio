## 2026-10-27 P16-175b 下线 STATUS.md 和 docs 内部文件已上线（3 条边缘缓存待 purge）

- 生产源码 `d8c7d7b`（= origin/main）；Pages 直传 deployment `9b853a68`（项目 `text-repeater-studio`，13 assets）。改法：新增 `scripts/build-public.sh` 白名单（7 页 + 404.html + site-consent.js/css + robots.txt + sitemap.xml + IndexNow key）→ 只部署 `dist-public/`，不再整目录直传；新增 `404.html` 让未匹配路径返回真 404（原来是 200 + 首页内容）；`.gitignore` 加 `dist-public/`。公开页与同意脚本逐字节未改。
- 线上复测：公开页/资源全 200；`/STATUS.md`、`/docs/PRD.md`、`/docs/上线.md`、`/docs/*`、`/docs/stitch_*/*`、`/docs/screen.png`、任意不存在路径全部 404（`output/p16-175b-20261027/live-recheck.txt`）。同意逻辑无头浏览器复测：DE 未选前 0 请求 0 Cookie、Accept 后加载、Reject 后刷新与内页 0 请求；本机 US 出口 granted + 面板隐藏。`site-consent.js` md5 `63695f8c4c781e695e7e7f93c6cdd5d9` 未变。
- 回滚点：上一版部署 `9dad5e11`（源码 `7a6f964`）。
- **待 Veronica（阻塞项）**：`/STATUS.md`、`/docs/PRD.md`、`/docs/上线.md` 这 3 条仍被 zone 级 `*.md` 缓存规则（s-maxage=604800 + X-Robots-Tag: noindex）返回部署前的旧副本（`age≈900`，带 `?v=1` 即 404）。需在 Cloudflare 后台 Purge 这 3 条 URL，并删掉那条 `*.md` 缓存规则，否则同类泄漏会再被粘 7 天。本机 CF token 无 purge 权限。
- 顺手修掉的旧待办：② 整目录直传泄漏已解决；任意路径软 404 已变成真 404。① GSC 只读 token 未变。

## 2026-10-27 P16-175 法务页去掉 noindex 已上线

- 生产源码 `045f09a`（main = origin/main，基于 `253f91d` 只删两行）；Cloudflare Pages 直传 deployment `9dad5e11`（项目 `text-repeater-studio`，37 个 asset 里只有 `privacy.html`、`terms.html`、`STATUS.md` 是新的，其余 33 个命中旧 hash）。
- 改动：`privacy.html`、`terms.html` 各删 1 行 `<meta name="robots" content="noindex"/>`。原因：`sitemap.xml` 把这两页列进去了，meta 却挡收录，GSC 报「被 noindex 标记排除」；车队另外几站法律页都可索引（sawadika 4 页全收录、raindance refund 可索引），判为笔误。canonical 仍自指，未改文案/价格/同意逻辑。
- 线上复测：`/privacy`、`/terms` 均 200，无 `meta robots`、无 `X-Robots-Tag`，自指 canonical 在，`/site-consent.js` 引用在；`site-consent.js` 线上 md5 仍为 `63695f8c`（= main），D16 未回滚（DE 同意前 0 请求 0 Cookie 且弹窗在；DE 点 Accept 后 gtag + `/g/collect` + `_ga`；US 不出弹窗直接加载）。其余 5 页 200、无 robots meta、consent 引用在。
- IndexNow：两条 URL 提交 `api.indexnow.org` 返回 200（key `2be1c1d3…` 线上 200）。
- 回滚点：上一版部署 `7c7d4690`（源码 `9abbae6`）；需要回退就 `git revert 045f09a` 后从 main 重新直传。
- 本单只读排查结论（10-27 03:10 那轮，证据 `output/p16-175-20261027/REPORT.md`）：7 条 sitemap URL + 站内链接 + 16 个月曝光 URL 全部 200、可索引，无重要页 404 / robots 屏蔽 / 跳转问题。
- 待办（低优，未做）：① 任意不存在路径返回 200 + 首页内容（Cloudflare catch-all 软 404），本单不授权处理；② 整目录直传把 `STATUS.md`、`docs/*`、`docs/stitch_text_repeater_studio/*.html`（和正式页同内容的副本）一并发布到线上，`/STATUS.md`、`/docs/PRD.md`、`/docs/上线.md` 都能直接访问到；是否收掉（只发布公开页 + `_headers` 加 noindex）要 PM/Veronica 定；③ GSC「网页索引」报告没有可用权限（只读 token、无登录态浏览器），所以没点「验证修复」，靠重抓 + IndexNow。

## 2026-10-23 P08-10c D16 撤回残留修复已上线

- 生产源码 `9abbae6`（main，基于生产谱系 0bf5d9a 合并 task/10c 修复）；Cloudflare Pages `wrangler pages deploy`，deployment `7c7d4690`。线上 `site-consent.js` md5 `63695f8c`（边缘缓存 max-age=14400，最长 4 小时内部分访客仍拿旧版，功能正常）。
- 问题（巡检 P1-1）：撤回时 GA4 scroll 命中以已同意状态补发 1 次。修法（与 gameuimaker 同源）：撤回点击内 ga-disable + consent denied + 删 Cookie + 不调 Clarity stop，并在 reload 前加装撤回专用传输阻断（sendBeacon/fetch/XHR 改道），再 location.reload。
- 测试：node --check 语法校验；线上 3 连测 0 残留请求、统计 Cookie 清空、确认重载。未改七页内容、价格。
- 证据：舰队 output/p08-10c-20261022/textrepeater-withdrawal-verify.json。

## 2026-10-20 私有源码备份

- 已将 `1a2ddd8d49bb2bbd9cfc3373a3ba7f79641299b0` 同步到 `origin/fix/batch28-consent-20261020`。仅源码与记录同步，无重复部署。

## 2026-10-20 批次28 D16 已发布验收

- 源码 `273c0dc`；Cloudflare Pages 生产部署 `9544b6a2`，项目 `text-repeater-studio`，仅一次发布。基于生产 `c00a957`，保留已上线 hello@ 联系邮箱。
- 七页移除直接 gtag，统一地区同意横幅与即时 Cookie 清理。DE/GB 同意前、Reject 后刷新及 /privacy 均 0 统计请求和 Cookie；Allow 后 gtag + g/collect；撤回即时清空第一方统计 Cookie；US 默认加载。页面运行错误 0。
- 原始请求/Cookie：舰队 `output/2026-10-20-batch28/textrepeater-production.json` 和 `textrepeater-production-gb.json`（英国首次 Google 响应晚于5秒，针对该证据缺口延长等待后通过；未重复发布）。静态校验、安全扫描通过。
- 未改付款/发信/生成/邮箱路由；无需用户操作。

## 2026-10-20 批次28 D16 候选

- 基于生产 c00a957；七页移除直接Google脚本，统一地区同意控制，原GA4 ID保留。隐私说明同步，hello@邮箱保持。
- 静态校验7页、JS语法、安全扫描通过；DE/GB同意前和Reject后刷新/内页均0请求/0Cookie，同意后加载，撤回立即清Cookie，US默认加载。原始证据：舰队 output/2026-10-20-batch28/textrepeater-pre.json。尚未部署。

## 2026-10-19 · 第 2 批联系邮箱统一（本地，未部署）

- 结果：`LOCAL_EMAIL_VERIFIED_NOT_DEPLOYED`；页面联系邮箱统一为 `hello@textrepeater.studio`。
- 范围：仅页面内容、页脚、联系/隐私/条款等现有页面及展示用模板占位。Resend/Cloudflare 实际发件配置、Stripe、结账、登录、同意逻辑、DNS 均未更改；未发测试邮件。
- 源码：基于 `e389afa4934255f9a9d29522257256f6c2ad27e8`，隔离分支 `fix/contact-email-20261019`；本节所在提交即本批候选，目录 `/Volumes/Veronica Lab/02_AI_Builds/01_AI_Sites/output/contact-email-batch2-2026-10-19/worktrees/textrepeater.studio`。原工作目录的未提交工作保持。
- 验证：源码扫描无本站旧联系邮箱/模板联系占位；本次差异 Gitleaks 通过；构建退出码 `0`。邮箱显示/链接本地验收通过；未部署。
- 邮件边界：公开 MX 存在（77 route3.mx.cloudflare.net., 51 route1.mx.cloudflare.net., 91 route2.mx.cloudflare.net.）；hello@路由、目标验证、真实收信本轮均为 UNKNOWN，不能由 MX 推断。
- 生产：deploy=0、push=0、发信=0；当前生产版本未变。bot 清单的部署建议不扩大本轮用户修复授权（D22）。
- 报告：[逐站记录](docs/handoffs/2026-10-19-contact-email.md)。舰队证据：`/Volumes/Veronica Lab/02_AI_Builds/01_AI_Sites/output/contact-email-batch2-2026-10-19`。
- 下一步：经确认后按本批候选逐站发布，发布前核对生产未漂移，再检查线上页面及JS包。

# Project status
