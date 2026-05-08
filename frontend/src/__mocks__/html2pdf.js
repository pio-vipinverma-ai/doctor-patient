// Mock for html2pdf.js
const html2pdf = jest.fn(() => ({
  from: jest.fn().mockReturnThis(),
  save: jest.fn().mockReturnThis(),
  set: jest.fn().mockReturnThis(),
  get: jest.fn().mockResolvedValue({}),
  outputPdf: jest.fn().mockResolvedValue(new Blob())
}));

module.exports = html2pdf;
module.exports.default = html2pdf;
