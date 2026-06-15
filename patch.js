const fs = require('fs');

const path = 'src/app/dashboard/layout.tsx';
let content = fs.readFileSync(path, 'utf8');

// Insert import
if (!content.includes('import { ConfirmProvider }')) {
  content = content.replace('import TenantSwitcher from "./tenant-switcher"', 'import TenantSwitcher from "./tenant-switcher"\nimport { ConfirmProvider } from "@/components/ui/use-confirm"');
}

// Wrap return
if (!content.includes('<ConfirmProvider>')) {
  content = content.replace('return (\n    <div className="flex h-screen bg-gray-100 relative">', 'return (\n    <ConfirmProvider>\n    <div className="flex h-screen bg-gray-100 relative">');
  
  content = content.replace('      </main>\n    </div>\n  )\n}', '      </main>\n    </div>\n    </ConfirmProvider>\n  )\n}');
}

fs.writeFileSync(path, content, 'utf8');
console.log('Layout patched');
