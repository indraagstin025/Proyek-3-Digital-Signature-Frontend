import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { FaFileUpload, FaArrowLeft, FaFilePdf, FaTrashAlt, FaCheckCircle, FaDownload, FaRedo } from "react-icons/fa";
import { PDFDocument, degrees } from "pdf-lib";

import SignDocumentLayout from "../../layouts/SignDocumentLayout";

const DemoSignPage = ({ theme, toggleTheme }) => {
  const navigate = useNavigate();

  const [currentUser] = useState({
    id: "guest-demo-id",
    name: "Tamu Demo",
    email: "tamu@demo.com",
    role: "GUEST",
    userStatus: "FREE",
  });

  const [step, setStep] = useState("UPLOAD");

  const [pdfFile, setPdfFile] = useState(null);
  const [originalPdfBytes, setOriginalPdfBytes] = useState(null);
  const [finalPdfUrl, setFinalPdfUrl] = useState(null);
  const [fileName, setFileName] = useState("dokumen.pdf");

  const [signatures, setSignatures] = useState([]);
  const [savedSignatureUrl, setSavedSignatureUrl] = useState(null);
  const [includeQrCode, setIncludeQrCode] = useState(true);

  const [isSaving, setIsSaving] = useState(false);

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [isLandscape, setIsLandscape] = useState(window.innerWidth > window.innerHeight);
  const [isPortrait, setIsPortrait] = useState(window.innerHeight > window.innerWidth);

  const [loadingText, setLoadingText] = useState("Memproses dokumen...");

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Mohon unggah file PDF.");
      return;
    }

    try {
      const arrayBuffer = await file.arrayBuffer();
      const blobUrl = URL.createObjectURL(file);

      setOriginalPdfBytes(arrayBuffer);
      setPdfFile(blobUrl);
      setFileName(file.name);
      setStep("SIGNING");
      toast.success("Dokumen siap ditandatangani!");
    } catch (error) {
      console.error(error);
      toast.error("Gagal membaca file.");
    }
  };

  const handleReset = () => {
    if (pdfFile) URL.revokeObjectURL(pdfFile);
    if (finalPdfUrl) URL.revokeObjectURL(finalPdfUrl);

    setPdfFile(null);
    setOriginalPdfBytes(null);
    setFinalPdfUrl(null);
    setSignatures([]);
    setSavedSignatureUrl(null);
    setStep("UPLOAD");
  };

  const onSaveFromModal = useCallback((dataUrl) => {
    setSavedSignatureUrl(dataUrl);
    setIsSignatureModalOpen(false);
    setIsSidebarOpen(true);
    toast.success("Tanda tangan dibuat! Tarik ke dokumen.", { icon: "🎨" });
  }, []);

  const handleAddSignature = useCallback(
    (signatureData) => {
      const newSignature = {
        ...signatureData,
        id: `demo-sig-${Date.now()}`,
        userId: currentUser.id,
        signerName: currentUser.name,
        signatureImageUrl: savedSignatureUrl,
        isLocked: false,
        isTemp: true,
        status: "draft",
      };
      setSignatures((prev) => [...prev, newSignature]);
    },
    [currentUser, savedSignatureUrl]
  );

  const handleUpdateSignature = useCallback((updatedSig) => {
    setSignatures((prev) => prev.map((s) => (s.id === updatedSig.id ? updatedSig : s)));
  }, []);

  const handleDeleteSignature = useCallback((id) => {
    setSignatures((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const onCommitSave = async () => {
    if (signatures.length === 0) {
      toast.error("Silakan tempatkan tanda tangan dulu.");
      return;
    }

    setStep("PROCESSING");

    const texts = ["Membaca PDF...", "Normalisasi Halaman...", "Menempelkan Tanda Tangan...", "Selesai!"];
    for (let i = 0; i < texts.length; i++) {
      setLoadingText(texts[i]);
      await new Promise((r) => setTimeout(r, 800));
    }

    try {
      const pdfDoc = await PDFDocument.load(originalPdfBytes);
      const pages = pdfDoc.getPages();

      for (const sig of signatures) {
        if (!sig.signatureImageUrl) continue;

        const pngImage = await pdfDoc.embedPng(sig.signatureImageUrl);

        // 1. Ambil Halaman
        const pageIndex = (sig.pageNumber || 1) - 1;
        const page = pages[pageIndex];
        if (!page) continue;

        // 2. Ambil dimensi halaman PDF (CropBox lebih akurat dari MediaBox)
        const cropBox = page.getCropBox() || page.getMediaBox();
        const { x: pageX, y: pageY, width: pageWidth, height: pageHeight } = cropBox;
        const rotation = page.getRotation().angle;

        // 3. Tentukan dimensi visual berdasarkan rotasi
        // Jika rotasi 90 atau 270, swap width dan height
        const isRotated = rotation === 90 || rotation === 270;
        const visualWidth = isRotated ? pageHeight : pageWidth;
        const visualHeight = isRotated ? pageWidth : pageHeight;

        // 4. PERBAIKAN: Implementasi object-contain seperti CSS
        // Gambar di UI ditampilkan dengan object-contain, artinya:
        // - Jika rasio gambar > rasio kotak: gambar dibatasi oleh WIDTH
        // - Jika rasio gambar < rasio kotak: gambar dibatasi oleh HEIGHT

        // Hitung dimensi kotak berdasarkan persentase UI
        const boxWidth = sig.width * visualWidth;
        const boxHeight = sig.height * visualHeight;
        const boxRatio = boxWidth / boxHeight;

        // Rasio natural gambar PNG
        const pngRatio = pngImage.width / pngImage.height;

        let drawWidth, drawHeight;

        if (pngRatio > boxRatio) {
          // Gambar lebih lebar dari kotak - constrained by WIDTH
          drawWidth = boxWidth;
          drawHeight = boxWidth / pngRatio;
        } else {
          // Gambar lebih tinggi dari kotak - constrained by HEIGHT
          drawHeight = boxHeight;
          drawWidth = boxHeight * pngRatio;
        }

        // 5. Calculate position (mapping from visual coordinates to PDF)
        const visualX = sig.positionX * visualWidth;
        const visualY = sig.positionY * visualHeight;

        // 6. KOREKSI POSISI untuk object-contain centering
        // Karena gambar di-center di dalam kotak, kita perlu menyesuaikan posisi
        // berdasarkan perbedaan antara ukuran kotak dan ukuran gambar yang sebenarnya
        const widthDifference = boxWidth - drawWidth;
        const heightDifference = boxHeight - drawHeight;

        // Koreksi posisi (center offset)
        const correctedVisualX = visualX + (widthDifference / 2);
        const correctedVisualY = visualY + (heightDifference / 2);

        // 7. Transformasi koordinat berdasarkan rotasi halaman
        // PDF menggunakan koordinat bottom-left origin, UI menggunakan top-left
        let finalX, finalY;

        if (rotation === 0) {
          // Standard: X sama, Y di-flip (PDF origin di bawah)
          finalX = pageX + correctedVisualX;
          finalY = pageY + pageHeight - correctedVisualY - drawHeight;
        }
        else if (rotation === 90) {
          // Rotasi 90° CW
          finalX = pageX + pageWidth - correctedVisualY - drawHeight;
          finalY = pageY + correctedVisualX;
        }
        else if (rotation === 180) {
          // Rotasi 180°
          finalX = pageX + pageWidth - correctedVisualX - drawWidth;
          finalY = pageY + correctedVisualY;
        }
        else if (rotation === 270) {
          // Rotasi 270° CW (90° CCW)
          finalX = pageX + correctedVisualY;
          finalY = pageY + pageHeight - correctedVisualX - drawWidth;
        }
        else {
          // Fallback
          finalX = pageX + correctedVisualX;
          finalY = pageY + pageHeight - correctedVisualY - drawHeight;
        }

        // 7. Gambar tanda tangan ke PDF
        page.drawImage(pngImage, {
          x: finalX,
          y: finalY,
          width: drawWidth,
          height: drawHeight,
        });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      setFinalPdfUrl(url);
      setStep("SUCCESS");
    } catch (error) {
      console.error("Gagal save PDF:", error);
      toast.error("Gagal memproses PDF.");
      setStep("SIGNING");
    }
  };

  const handleDownload = () => {
    if (!finalPdfUrl) return;
    const link = document.createElement("a");
    link.href = finalPdfUrl;
    link.download = `SIGNED-${fileName}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Dokumen diunduh!");
  };

  if (step === "UPLOAD") {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center p-4 animate-fade-in">
        <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 text-center border border-slate-100 dark:border-slate-700">
          <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaFilePdf size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Demo Tanda Tangan</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm">Mode Privasi Aman: Dokumen diproses 100% di browser tanpa diunggah ke server.</p>
          <label className="block w-full cursor-pointer group">
            <div className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/30 transition-all transform group-hover:-translate-y-1 flex items-center justify-center gap-2">
              <FaFileUpload />
              <span>Pilih File PDF</span>
            </div>
            <input type="file" accept="application/pdf" className="hidden" onChange={handleFileUpload} />
          </label>
          <button onClick={() => navigate("/")} className="mt-6 text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center justify-center gap-2 w-full transition-colors">
            <FaArrowLeft size={12} /> Kembali ke Beranda
          </button>
        </div>
      </div>
    );
  }

  if (step === "PROCESSING") {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          {/* Animasi Pulse Lingkaran */}
          <div className="relative w-24 h-24 mx-auto mb-8">
            <div className="absolute inset-0 border-4 border-blue-200 dark:border-blue-900 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <FaFilePdf className="text-blue-600 text-2xl animate-pulse" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">{loadingText}</h3>
          <p className="text-slate-500 text-sm">Mohon tunggu sebentar...</p>
        </div>
      </div>
    );
  }

  if (step === "SUCCESS") {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center p-4 animate-fade-in-up">
        <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 text-center border border-slate-100 dark:border-slate-700 relative overflow-hidden">
          {/* Confetti Background Effect (CSS only) */}
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 via-blue-500 to-purple-600"></div>

          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaCheckCircle size={40} />
          </div>

          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">Dokumen Siap!</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm">Tanda tangan berhasil ditambahkan. File Anda siap diunduh.</p>

          <div className="space-y-3">
            <button
              onClick={handleDownload}
              className="w-full py-4 px-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 flex items-center justify-center gap-3"
            >
              <FaDownload className="animate-bounce" />
              <span>Unduh PDF Sekarang</span>
            </button>

            <button
              onClick={handleReset}
              className="w-full py-3 px-6 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-semibold hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors flex items-center justify-center gap-2"
            >
              <FaRedo size={14} />
              <span>Proses Dokumen Lain</span>
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700">
            <p className="text-xs text-slate-400">Ingin fitur lebih canggih seperti Audit Trail & E-Meterai?</p>
            <button onClick={() => navigate("/register")} className="text-xs font-bold text-blue-600 hover:underline mt-1">
              Daftar Akun Gratis
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <SignDocumentLayout
        currentUser={currentUser}
        documentTitle={`[DEMO] ${fileName}`}
        pdfFile={pdfFile}
        documentId="demo-local"
        signatures={signatures}
        savedSignatureUrl={savedSignatureUrl}
        isLoadingDoc={false}
        isSaving={isSaving}
        isAnalyzing={false}
        canSign={true}
        isSignedSuccess={false}
        theme={theme}
        toggleTheme={toggleTheme}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        isSignatureModalOpen={isSignatureModalOpen}
        setIsSignatureModalOpen={setIsSignatureModalOpen}
        isAiModalOpen={false}
        setIsAiModalOpen={() => { }}
        includeQrCode={includeQrCode}
        setIncludeQrCode={setIncludeQrCode}
        aiData={null}
        isLandscape={isLandscape}
        isPortrait={isPortrait}
        onAddDraft={handleAddSignature}
        onUpdateSignature={handleUpdateSignature}
        onDeleteSignature={handleDeleteSignature}
        onSaveFromModal={onSaveFromModal}
        onCommitSave={onCommitSave}
        handleAutoTag={() => toast("Fitur Auto Tagging perlu login.")}
        handleAnalyzeDocument={() => toast("Fitur AI perlu login.")}
        handleNavigateToView={() => { }}
      />

      {/* Floating Reset Button */}
      <div className="fixed bottom-6 left-6 z-[100]">
        <button onClick={handleReset} className="flex items-center gap-2 px-4 py-2 bg-red-600/90 text-white text-xs font-bold rounded-full shadow-lg hover:bg-red-700 backdrop-blur-sm transition-transform hover:scale-105">
          <FaTrashAlt /> Batal
        </button>
      </div>
    </>
  );
};

export default DemoSignPage;
