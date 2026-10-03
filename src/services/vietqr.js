// Tạo mã VietQR (chuẩn EMVCo / NAPAS 247) cho chuyển khoản: có sẵn số tiền và nội dung.
// Mã QR được dựng ngay trên server thành SVG, không gọi dịch vụ bên ngoài.
const QRCode = require('qrcode');

// Mã BIN ngân hàng theo NAPAS.
const BANKS = [
  { bin: '970436', name: 'Vietcombank' },
  { bin: '970415', name: 'VietinBank' },
  { bin: '970418', name: 'BIDV' },
  { bin: '970405', name: 'Agribank' },
  { bin: '970407', name: 'Techcombank' },
  { bin: '970422', name: 'MB Bank' },
  { bin: '970416', name: 'ACB' },
  { bin: '970432', name: 'VPBank' },
  { bin: '970423', name: 'TPBank' },
  { bin: '970403', name: 'Sacombank' },
  { bin: '970441', name: 'VIB' },
  { bin: '970443', name: 'SHB' },
  { bin: '970437', name: 'HDBank' },
  { bin: '970448', name: 'OCB' },
  { bin: '970426', name: 'MSB' },
  { bin: '970440', name: 'SeABank' },
  { bin: '970431', name: 'Eximbank' },
  { bin: '970449', name: 'LPBank' },
  { bin: '970428', name: 'Nam A Bank' },
  { bin: '970409', name: 'Bac A Bank' },
  { bin: '970425', name: 'ABBANK' },
  { bin: '970454', name: 'BVBank (Bản Việt)' },
  { bin: '970412', name: 'PVcomBank' },
  { bin: '970452', name: 'KienlongBank' },
  { bin: '970419', name: 'NCB' },
];

function bankName(bin) {
  const b = BANKS.find(x => x.bin === bin);
  return b ? b.name : '';
}

function tlv(id, value) {
  const v = String(value);
  return id + String(v.length).padStart(2, '0') + v;
}

// CRC-16/CCITT-FALSE (đa thức 0x1021, khởi tạo 0xFFFF) theo chuẩn EMVCo.
function crc16(str) {
  let crc = 0xffff;
  for (const byte of Buffer.from(str, 'utf8')) {
    crc ^= byte << 8;
    for (let i = 0; i < 8; i++) crc = (crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1) & 0xffff;
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

function payload({ bin, account, amount, content }) {
  const beneficiary = tlv('00', bin) + tlv('01', account);
  const merchant = tlv('00', 'A000000727') + tlv('01', beneficiary) + tlv('02', 'QRIBFTTA');
  let p = tlv('00', '01')
    + tlv('01', amount ? '12' : '11')
    + tlv('38', merchant)
    + tlv('53', '704')
    + (amount ? tlv('54', String(Math.round(amount))) : '')
    + tlv('58', 'VN')
    + (content ? tlv('62', tlv('08', content)) : '')
    + '6304';
  return p + crc16(p);
}

// Trả về SVG mã QR, hoặc null nếu chưa cấu hình tài khoản nhận tiền.
async function qrSvg({ bin, account, amount, content }) {
  if (!bin || !account) return null;
  return QRCode.toString(payload({ bin, account, amount, content }), {
    type: 'svg', margin: 2, errorCorrectionLevel: 'M', color: { dark: '#000000', light: '#ffffff' },
  });
}

module.exports = { BANKS, bankName, payload, qrSvg };
