const XLSX = require('xlsx');

const records = [
  {
    quantity: 1,
    status: 'PRESENT',
    createdAt: new Date(),
    classroomEq: {
      name: 'Classroom PC',
      quantity: 5,
      room: { name: 'Room 1' },
      area: { name: 'Area A' }
    },
    classroomEqId: 'c1'
  },
  {
    quantity: 2,
    status: 'DAMAGED',
    createdAt: new Date(),
    equipment: {
      name: 'General PC',
      totalQty: 10,
      category: { name: 'IT', manager: { name: 'Manager 1' } }
    },
    equipmentId: 'e1'
  }
];

const byRoom = {};
for (const rec of records) {
  const q = rec.quantity || 1;
  const isClassroom = !!rec.classroomEq;
  const dbQ = isClassroom ? (rec.classroomEq?.quantity || 0) : (rec.equipment?.totalQty || 0);
  const id = isClassroom ? rec.classroomEqId : rec.equipmentId;
  const roomKey = isClassroom
    ? `${rec.classroomEq?.room?.name || '?'} (${rec.classroomEq?.area?.name || '?'})`
    : `Kho chung (${rec.equipment?.category?.name || '?'})`;
  
  if (!byRoom[roomKey]) byRoom[roomKey] = { total: 0, present: 0, damaged: 0, missing: 0, dbQty: 0, seenIds: new Set() };
  byRoom[roomKey].total += q;
  if (rec.status === 'PRESENT') byRoom[roomKey].present += q;
  else if (rec.status === 'DAMAGED') byRoom[roomKey].damaged += q;
  else byRoom[roomKey].missing += q;
  
  if (id && !byRoom[roomKey].seenIds.has(id)) {
    byRoom[roomKey].dbQty += dbQ;
    byRoom[roomKey].seenIds.add(id);
  }
}
const byRoomData = Object.entries(byRoom).map(([room, stats], i) => ({
  'STT': i + 1,
  'Phòng / Khu vực': room,
  'Số lượng tồn (CSDL)': stats.dbQty,
  'Số lượng thực tế (Quét)': stats.total,
  'Chênh lệch': stats.total - stats.dbQty,
  'Bình thường': stats.present,
  'Hư hỏng': stats.damaged,
  'Không tìm thấy': stats.missing
}));

console.log(byRoomData);

const ws = XLSX.utils.json_to_sheet(byRoomData);
console.log(ws);
