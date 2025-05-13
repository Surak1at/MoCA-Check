// components/Html2Pdf.jsx
import React, { useEffect, useRef } from "react";
import html2pdf from "html2pdf.js";
import PDFReport from "./PDFReport";

export default function Html2Pdf() {
  const hiddenRef = useRef();
  const iframeRef = useRef();

  useEffect(() => {
    const generatePdfPreview = async () => {
      const opt = {
        margin:       0,
        filename:     "report.pdf",
        image:        { type: "jpeg", quality: 0.98 },
        html2canvas:  { scale: 2 },
        jsPDF:        { unit: "mm", format: "a4", orientation: "portrait" }
      };

      const worker = html2pdf()
        .set(opt)
        .from(hiddenRef.current)
        .toPdf();

      const pdfString = await worker.output("datauristring");
      if (iframeRef.current) {
        iframeRef.current.src = pdfString;
      }
    };

    generatePdfPreview();
  }, []);

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">แสดงตัวอย่าง PDF</h2>

      {/* ▶️ PDF แสดงใน iframe */}
      <iframe
        ref={iframeRef}
        title="PDF Preview"
        width="100%"
        height="900px"
        className="border border-gray-400 rounded"
      />

      {/* 🔒 ซ่อนเนื้อหาไว้สำหรับ html2pdf.js ดึงไปแปลง */}
      <div style={{ display: "none" }}>
        <div ref={hiddenRef}>
          <PDFReport />
        </div>
      </div>
    </div>
  );
}
