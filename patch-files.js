const fs = require('fs');

const files = [
  'src/app/dashboard/classroom-equipments/equipment-row.tsx',
  'src/app/dashboard/classroom-equipments/equipment-table.tsx',
  'src/app/dashboard/equipments/equipment-row.tsx',
  'src/app/dashboard/inventory/delete-button.tsx',
  'src/app/dashboard/maintenance/maintenance-actions.tsx',
  'src/app/dashboard/members/member-row.tsx',
  'src/app/dashboard/requests/delete-history-button.tsx',
  'src/app/dashboard/superadmin/accounts/account-row.tsx',
  'src/app/dashboard/superadmin/transfer-data/transfer-client.tsx',
  'src/app/dashboard/superadmin/units/units-client.tsx',
  'src/app/dashboard/system-logs/delete-system-logs-form.tsx'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  
  if (content.includes('useConfirm')) {
    continue;
  }
  
  // 1. Add import
  const importStatement = `import { useConfirm } from "@/components/ui/use-confirm"\n`;
  const lastImportIndex = content.lastIndexOf('import ');
  const endOfLastImport = content.indexOf('\n', lastImportIndex);
  content = content.substring(0, endOfLastImport + 1) + importStatement + content.substring(endOfLastImport + 1);
  
  // 2. Inject const { confirm } = useConfirm() into the component
  // Find "export default function" or "export function"
  let functionMatch = content.match(/export (?:default )?function \w+\(.*?\)\s*{/s);
  if (!functionMatch) {
    functionMatch = content.match(/const \w+ = \(.*?\) =>\s*{/s);
  }
  
  if (functionMatch) {
    const insertPos = functionMatch.index + functionMatch[0].length;
    content = content.substring(0, insertPos) + '\n  const { confirm } = useConfirm()' + content.substring(insertPos);
  } else {
    console.log("Could not find function body for", file);
  }
  
  // 3. Replace confirm( with await confirm(
  // Sometimes it's window.confirm
  content = content.replace(/(!)?window\.confirm\(/g, '$1await confirm(');
  // Be careful with !confirm( vs confirm(
  content = content.replace(/(!)?confirm\(/g, '$1await confirm(');
  
  fs.writeFileSync(file, content, 'utf8');
  console.log('Patched', file);
}
