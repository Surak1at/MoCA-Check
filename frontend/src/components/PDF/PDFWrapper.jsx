import React, { useState } from "react";
import html2canvas from "html2canvas";
import { PDFDocument } from "pdf-lib";

export default function PDFWrapper({ children }) {

  const [isLoading, setIsLoading] = useState(false)

  const handleDownloadPDF = async () => {
    try {
      setIsLoading(true)
      const input = document.getElementById("pdf-content");
      if (!input) return;
  
      const canvas = await html2canvas(input, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
  
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage();
      const { width: pageWidth, height: pageHeight } = page.getSize();
  
      const pngImage = await pdfDoc.embedPng(imgData);
  
    
      page.drawImage(pngImage, {
        x: 0,
        y: 0,
        width: pageWidth,
        height: pageHeight,
      });
  
      const pdfBytes = await pdfDoc.save();
  
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      
      link.download = `download_${Date.now()}.pdf`;
      link.click();
      setIsLoading(false)
    } catch (error) {
      console.log(error)
      setIsLoading(false)
    }
  };

  return (
    <div className="bg-white">
      <div className="flex justify-start p-4 cursor-pointer">
        <button
          disabled={isLoading}
          onClick={handleDownloadPDF}
          className={`${isLoading ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'} text-white px-4 py-2 rounded-lg cursor-pointer`}
        >
          {isLoading ? 'Please wait...' : 'Download PDF'}
        </button>
      </div>

      <div id="pdf-content" className="flex justify-start p-8 bg-white" >
        {children}
      </div>
    </div>
  );
}
