const fs = require('fs');
let content = fs.readFileSync('app/wizard/page.tsx', 'utf8');
content = content.replace(/aria-label=\{`حذف \$\{d\}`\}\n\s*aria-label=\{`حذف \$\{m\}`\}/g, 'aria-label={`حذف ${d}`}');
content = content.replace(/aria-label=\{`حذف \$\{d\}`\}\n\s*aria-label=\{`حذف \$\{m\}`\}/g, 'aria-label={`حذف ${m}`}');
fs.writeFileSync('app/wizard/page.tsx', content);
