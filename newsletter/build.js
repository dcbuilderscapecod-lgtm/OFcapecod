#!/usr/bin/env node
/*
 * DC Builders newsletter builder.
 *
 *   node build.js                     -> render all src/issue-*.json to issue-NN.html
 *                                        (web views), rebuild manifest.json + index.html
 *   node build.js email NN [notes]    -> print the EMAIL variant of issue NN to stdout:
 *                                        includes the Resend unsubscribe token, and if
 *                                        [notes] is a path to an HTML fragment, injects
 *                                        it as the "This Week at DC Builders" box.
 *
 * Issues live in src/issue-NN.json:
 *   { issue, slug, sendDate, subject, preheader, title, introHtml, articleHtml,
 *     tips: [a, b, c], ctaLine }
 */
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const SRC = path.join(ROOT, 'src');
const TEMPLATE = fs.readFileSync(path.join(ROOT, 'template.html'), 'utf8');
const SITE = 'https://www.dcbuildersofcapecod.com';

const TAG_STYLES = {
  h2: 'margin:26px 0 10px;font-size:20px;line-height:26px;color:#2a2220;font-weight:700;',
  h3: 'margin:20px 0 8px;font-size:17px;line-height:24px;color:#2a2220;font-weight:700;',
  p: 'margin:12px 0;font-size:16px;line-height:26px;color:#3c3431;',
  ul: 'margin:12px 0;padding-left:22px;',
  li: 'margin:6px 0;font-size:16px;line-height:25px;color:#3c3431;',
  a: 'color:#463939;font-weight:bold;',
  strong: 'color:#2a2220;',
};

function inlineStyles(html) {
  return html.replace(/<(h2|h3|p|ul|li|a|strong)(\s+[^>]*)?>/g, (m, tag, attrs) => {
    attrs = attrs || '';
    if (/style=/.test(attrs)) return m;
    return '<' + tag + attrs + ' style="' + TAG_STYLES[tag] + '">';
  });
}

function thisWeekBlock(innerHtml) {
  if (!innerHtml || !innerHtml.trim()) return '';
  return '<tr><td class="dcb-pad" style="padding:20px 40px 0;background-color:#ffffff;">' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#fdf6ec;border-left:4px solid #b98354;border-radius:6px;">' +
    '<tr><td style="padding:18px 22px;">' +
    '<div style="font-size:12px;font-weight:bold;letter-spacing:2px;color:#8a6b45;text-transform:uppercase;padding-bottom:8px;">This Week at DC Builders</div>' +
    '<div style="font-size:15px;line-height:24px;color:#3c3431;">' + inlineStyles(innerHtml) + '</div>' +
    '</td></tr></table></td></tr>';
}

function render(issue, opts) {
  opts = opts || {};
  const nn = String(issue.issue).padStart(2, '0');
  const webUrl = SITE + '/newsletter/issue-' + nn;
  let html = TEMPLATE;
  const fill = {
    '{{SUBJECT}}': issue.subject,
    '{{PREHEADER}}': issue.preheader,
    '{{DATE}}': issue.sendDate,
    '{{TITLE}}': issue.title,
    '{{THIS_WEEK}}': thisWeekBlock(opts.thisWeekHtml),
    '{{INTRO}}': inlineStyles(issue.introHtml),
    '{{ARTICLE}}': inlineStyles(issue.articleHtml),
    '{{TIP_1}}': issue.tips[0] || '',
    '{{TIP_2}}': issue.tips[1] || '',
    '{{TIP_3}}': issue.tips[2] || '',
    '{{CTA_LINE}}': issue.ctaLine,
    '{{WEB_URL}}': webUrl,
    '{{UNSUBSCRIBE_BLOCK}}': opts.email
      ? '<a href="{{{RESEND_UNSUBSCRIBE_URL}}}" style="color:#a8988f;text-decoration:underline;">Unsubscribe</a> &nbsp;&middot;&nbsp; '
      : '',
  };
  for (const [k, v] of Object.entries(fill)) html = html.split(k).join(v);
  return html;
}

function loadIssues() {
  return fs.readdirSync(SRC)
    .filter(f => /^issue-\d\d\.json$/.test(f))
    .sort()
    .map(f => JSON.parse(fs.readFileSync(path.join(SRC, f), 'utf8')));
}

function toISO(usDate) {
  const d = new Date(usDate + ' 12:00:00');
  return d.toISOString().slice(0, 10);
}

const mode = process.argv[2];

if (mode === 'email') {
  const nn = String(parseInt(process.argv[3], 10)).padStart(2, '0');
  const issue = JSON.parse(fs.readFileSync(path.join(SRC, 'issue-' + nn + '.json'), 'utf8'));
  const notesPath = process.argv[4];
  const thisWeekHtml = notesPath && fs.existsSync(notesPath) ? fs.readFileSync(notesPath, 'utf8') : '';
  process.stdout.write(render(issue, { email: true, thisWeekHtml }));
} else {
  const issues = loadIssues();
  const manifest = [];
  for (const issue of issues) {
    const nn = String(issue.issue).padStart(2, '0');
    fs.writeFileSync(path.join(ROOT, 'issue-' + nn + '.html'), render(issue, {}));
    manifest.push({
      issue: issue.issue,
      slug: issue.slug,
      sendDate: toISO(issue.sendDate),
      subject: issue.subject,
      preheader: issue.preheader,
      web: SITE + '/newsletter/issue-' + nn,
      status: 'queued',
    });
  }
  // preserve sent-state from an existing manifest
  const mPath = path.join(ROOT, 'manifest.json');
  if (fs.existsSync(mPath)) {
    const old = JSON.parse(fs.readFileSync(mPath, 'utf8'));
    for (const m of manifest) {
      const prev = old.find(o => o.issue === m.issue);
      if (prev && prev.status !== 'queued') { m.status = prev.status; m.sentAt = prev.sentAt; }
    }
  }
  fs.writeFileSync(mPath, JSON.stringify(manifest, null, 2));

  const rows = manifest.map(m =>
    '<tr><td style="padding:10px 14px;border-bottom:1px solid #e5ddd6;font-variant-numeric:tabular-nums">#' + m.issue +
    '</td><td style="padding:10px 14px;border-bottom:1px solid #e5ddd6;white-space:nowrap">' + m.sendDate +
    '</td><td style="padding:10px 14px;border-bottom:1px solid #e5ddd6"><a href="/newsletter/issue-' + String(m.issue).padStart(2, '0') + '" style="color:#463939;font-weight:bold">' + m.subject + '</a></td></tr>'
  ).join('\n');
  fs.writeFileSync(path.join(ROOT, 'index.html'),
    '<!doctype html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><meta name="robots" content="noindex"/><title>DC Builders Newsletter Archive</title></head>' +
    '<body style="margin:0;background:#f4f1ee;font-family:Segoe UI,Roboto,Arial,sans-serif;color:#2a2220">' +
    '<div style="max-width:760px;margin:0 auto;padding:40px 16px">' +
    '<img src="/assets/dc-builders-logo-email.jpg" width="220" alt="DC Builders" style="display:block;margin:0 auto 8px"/>' +
    '<h1 style="text-align:center;font-size:26px;margin:8px 0 24px">Newsletter Archive</h1>' +
    '<table style="width:100%;border-collapse:collapse;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 2px 10px rgba(42,34,32,.1)">' + rows + '</table>' +
    '</div></body></html>');
  console.log('built ' + issues.length + ' issues, manifest + index updated');
}
