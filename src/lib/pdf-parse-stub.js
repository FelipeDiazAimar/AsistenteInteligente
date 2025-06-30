// Stub for pdf-parse to prevent client-side loading
// This file is used by Turbopack when pdf-parse is requested on the client side
export default function pdfParseStub() {
  throw new Error('pdf-parse is only available on the server side');
}
