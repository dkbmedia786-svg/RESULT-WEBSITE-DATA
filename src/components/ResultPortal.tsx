import React, { useState, useEffect } from 'react';
import { Search, Printer, RefreshCw, Award } from 'lucide-react';
import { Result, ClassName } from '../types';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { getClassSubjects, getSchoolClasses, getSchoolSessions } from '../data';

interface ResultPortalProps {
  results: Result[];
  triggerNotification?: (title: string, message: string, type?: 'success' | 'info' | 'warning' | 'error' | 'congrats') => void;
}

const SUBJECTS = [
  "Quran",
  "Hifz",
  "Deeniyat",
  "Urdu",
  "English",
  "Hindi",
  "Science",
  "Social Science",
  "Math",
  "Dua & Kalma"
];

const SUBJECT_COLORS = [
  "#fce4ec", // Pinkish
  "#e8f5e9", // Greenish
  "#e3f2fd", // Blueish
  "#fff3e0", // Orangeish
  "#f3e5f5", // Purplish
  "#f1f8e9", // Light Lime
  "#e0f2f1", // Tealish
  "#fffde7", // Yellowish
  "#efebe9", // Brownish Grey
  "#e1f5fe"  // Light Blue
];

export function getCurrentSession(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0 is January, 11 is December
  // Academic session shifts from April (month 3) or later
  if (month >= 3) {
    return `${year}-${year + 1}`;
  } else {
    return `${year - 1}-${year}`;
  }
}

export function normalizeSession(session: string): string {
  if (!session) return getCurrentSession();
  const trimmed = String(session).trim();
  const match = trimmed.match(/^(\d{4})-(\d{2})$/);
  if (match) {
    const firstYear = match[1];
    const secondYear = match[2];
    return `${firstYear}-20${secondYear}`;
  }
  return trimmed;
}

export function formatClassName(className: string | undefined): string {
  if (!className) return "";
  return String(className).replace(/(\d+)(ST|ND|RD|TH)/gi, (match, num, suffix) => {
    return num + suffix.toLowerCase();
  });
}

export default function ResultPortal({ results, triggerNotification }: ResultPortalProps) {
  const [rollNo, setRollNo] = useState('');
  const [selectedClass, setSelectedClass] = useState<ClassName>('EDADIA');
  const [selectedExamType, setSelectedExamType] = useState<string>('Annual');
  const [selectedSession, setSelectedSession] = useState<string>(getCurrentSession());
  const [passingYear, setPassingYear] = useState('2526'); // Matches Urdu numerals 2026 / 1447 AH
  const [searchTriggered, setSearchTriggered] = useState(false);
  const [foundResult, setFoundResult] = useState<Result | null>(null);
  const [showPrintIframeModal, setShowPrintIframeModal] = useState(false);

  // User-configurable download alignment adjustment offsets for text vs. shapes
  const [shapeOffset, setShapeOffset] = useState<number>(() => {
    const saved = localStorage.getItem('download_shape_offset');
    return saved ? parseFloat(saved) : 2; // Default 2px
  });
  const [extraShapeOffset, setExtraShapeOffset] = useState<number>(() => {
    const saved = localStorage.getItem('download_extra_shape_offset');
    return saved ? parseFloat(saved) : 4; // Default 4px (Annual Examination header + PASS/FAIL indicators)
  });

  // Dynamically extract exam variations or provide robust default ones based on configured sessions
  const availableSessions = React.useMemo(() => {
    const list = new Set<string>(getSchoolSessions());
    results.forEach(res => {
      if (res.session) list.add(normalizeSession(res.session));
    });
    return Array.from(list).sort().reverse();
  }, [results]);

  const examSessions: any[] = [];
  const b_examSessions = React.useMemo(() => {
    const list: { examType: string; session: string; label: string }[] = [];
    
    // Add defaults first
    const activeSessions = getSchoolSessions();
    const defaults = activeSessions.flatMap(sess => [
      { examType: "Annual", session: sess, label: `Annual Examination - ${sess} (सालाना / सालانہ)` },
      { examType: "Half-Yearly", session: sess, label: `Half-Yearly Examination - ${sess} (छमाही / शश ماہی)` },
      { examType: "Quarterly", session: sess, label: `Quarterly Examination - ${sess} (तिमाही / سہ ماہی)` },
    ]);
    /*
      { examType: "Annual", session: current, label: `Annual Examination - ${current} (सालाना / सालانہ)` },
      { examType: "Half-Yearly", session: current, label: `Half-Yearly Examination - ${current} (छमाही / شश ماہی)` },
      { examType: "Quarterly", session: current, label: `Quarterly Examination - ${current} (तिमाही / سہ ماہی)` },
      { examType: "Annual", session: "2025-2026", label: "Annual Examination - 2025-2026 (सालाना / سالانہ)" },
      { examType: "Half-Yearly", session: "2025-2026", label: "Half-Yearly Examination - 2025-2026 (छमाही / شش ماہی)" },
      { examType: "Quarterly", session: "2025-2026", label: "Quarterly Examination - 2025-2026 (तिमाही / سہ ماہی)" },
      { examType: "Annual", session: "2024-2025", label: "Annual Examination - 2024-2025 (सालाना / سالانہ)" },
      { examType: "Half-Yearly", session: "2024-2025", label: "Half-Yearly Examination - 2024-2025 (छमाही / شش ماہی)" },
      { examType: "Quarterly", session: "2024-2025", label: "Quarterly Examination - 2024-2025 (तिमाही / سہ ماہی)" },
    */
    
    // Scan real database results for any custom added variants
    results.forEach(res => {
      const type = res.examType || "Annual";
      const sess = normalizeSession(res.session);
      
      const exists = defaults.some(d => d.examType.toLowerCase() === type.toLowerCase() && d.session === sess);
      const listExists = list.some(l => l.examType.toLowerCase() === type.toLowerCase() && l.session === sess);
      
      if (!exists && !listExists) {
        list.push({
          examType: type,
          session: sess,
          label: `${type} Examination - ${sess}`
        });
      }
    });

    const combined = [...defaults, ...list];
    const uniques: typeof defaults = [];
    combined.forEach(p => {
      if (!uniques.some(u => u.examType.toLowerCase() === p.examType.toLowerCase() && u.session === p.session)) {
        uniques.push(p);
      }
    });
    return uniques;
  }, [results]);

  // Custom persistent logos from principal control panel uploads
  const [schoolLogo, setSchoolLogo] = useState<string>('');
  const [urduLogo, setUrduLogo] = useState<string>('');
  
  // Local printing rendering support
  const [printImage, setPrintImage] = useState<string>('');
  const [isGeneratingPrint, setIsGeneratingPrint] = useState(false);

  useEffect(() => {
    // Load custom logos uploaded in panel
    const logo = localStorage.getItem("m_logo");
    if (logo) setSchoolLogo(logo);
    const uLogo = localStorage.getItem("m_urdu_logo");
    if (uLogo) setUrduLogo(uLogo);
  }, [searchTriggered]);

  const classes = getSchoolClasses() as ClassName[];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rollNo.trim()) {
      if (triggerNotification) {
        triggerNotification("ROLL NUMBER REQUIRED ⚠️", "Kripya check karne ke liye Roll Number darj karein.", "warning");
      } else {
        alert("Please enter Roll Number to search!");
      }
      return;
    }

    setSearchTriggered(true);
    // 1. Try to find the exact result matching Roll Number, Class Name, Exam Type and Session/Year
    let match = results.find(
      (r) =>
        r.rollNo.toString().trim() === rollNo.trim() &&
        r.className === selectedClass &&
        (r.examType || 'Annual').toLowerCase() === selectedExamType.toLowerCase() &&
        normalizeSession(r.session).toLowerCase() === normalizeSession(selectedSession).toLowerCase()
    );

    // 2. Fallback: Search by Roll Number and Class Name (allowing graceful corrections for Exam Type/Session)
    if (!match) {
      const fallbackMatch = results.find(
        (r) =>
          r.rollNo.toString().trim() === rollNo.trim() &&
          r.className === selectedClass
      );
      if (fallbackMatch) {
         match = fallbackMatch;
         // Auto-update selection options to match the actual student's session and exam type criteria
         if (fallbackMatch.examType) {
           setSelectedExamType(fallbackMatch.examType);
         }
         if (fallbackMatch.session) {
           setSelectedSession(normalizeSession(fallbackMatch.session));
         }
      }
    }

    const resultObj = match || null;
    setFoundResult(resultObj);

    if (triggerNotification) {
      if (resultObj) {
        // Calculate dynamic pass or fail
        const subjects = getClassSubjects(resultObj.className);
        const avgMark = subjects.length > 0 
          ? (subjects.reduce((sum, sub, i) => sum + getSubjectMark(resultObj, sub, i), 0) / subjects.length)
          : 0;
        const passedExam = subjects.length > 0 && avgMark >= 23;

        if (passedExam) {
          triggerNotification(
            "CONGRATULATIONS! 🎉 مبارکباد!",
            `Masha Allah! ${resultObj.studentName.toUpperCase()} has passed the exam successfully! Rank: ${getAutocalculatedRank(resultObj)}, Division: ${resultObj.division || 'I'}. Mubarak ho!`,
            "congrats"
          );
        } else {
          triggerNotification(
            "RESULTS RETRIEVED SUCCESSFULLY 📝",
            `Result found for student ${resultObj.studentName.toUpperCase()}. Hard work is the key to double your success in future! Dil mat haariye, mehnat karte rahein!`,
            "info"
          );
        }
      } else {
        triggerNotification(
          "ROLL NUMBER NOT FOUND 🔍",
          `Roll number ${rollNo} aur class/session ke criteria me koi records nahi mil sake. Kripya control panel ya sahi credentials check karein!`,
          "error"
        );
      }
    }
  };

  const handleReset = () => {
    setRollNo('');
    setSearchTriggered(false);
    setFoundResult(null);
    setPrintImage('');
    if (triggerNotification) {
      triggerNotification("SEARCH CLOSED 🔄", "Aap ab kisi naye student ka roll number search kar sakte hain.", "info");
    }
  };

  // Maps stored marks to the 10 standard subjects gracefully
  const getSubjectMark = (res: Result, subject: string, index: number): number => {
    if (res.marks[subject] !== undefined) {
      return Number(res.marks[subject]) || 0;
    }
    const keys = Object.keys(res.marks);
    const values = Object.values(res.marks);

    // Substring search (e.g. "Quranic Tajweed" -> "Quran")
    const matchKey = keys.find(k => k.toLowerCase().includes(subject.toLowerCase()) || subject.toLowerCase().includes(k.toLowerCase()));
    if (matchKey !== undefined) {
      return Number(res.marks[matchKey]) || 0;
    }

    // Fallback to absolute index mapping
    if (index < values.length) {
      return Number(values[index]) || 0;
    }

    return 75; // Default pleasing starter mark if unconfigured
  };

  const handleLaptopPrint = () => {
    setIsGeneratingPrint(true);
    if (triggerNotification) {
      triggerNotification(
        "PREPARING PRINT FRAMEWORK 🖨️",
        "A4 Layout adjustment settings align ho rahi hain. Kripya print window me size parameters set karein.",
        "success"
      );
    }
    
    // Delay print capture slightly to let the React state render dynamic top positioning adjustments
    setTimeout(() => {
      const printEl = document.getElementById('card-printed-view');
      if (!printEl) {
        alert("माफ कीजिये, मार्कशीट नहीं मिल सकी! (Error: Marksheet element not found!)");
        setIsGeneratingPrint(false);
        return;
      }

      const isInsideIframe = typeof window !== 'undefined' && window.self !== window.top;
      if (isInsideIframe) {
        setShowPrintIframeModal(true);
        setIsGeneratingPrint(false);
        return;
      }

      try {
        window.focus();
        window.print();
      } catch (e) {
        console.error("Direct printing error:", e);
        setShowPrintIframeModal(true);
      } finally {
        setIsGeneratingPrint(false);
      }
    }, 150);
  };

  const handleDownloadPDF = () => {
    setIsGeneratingPrint(true);
    if (triggerNotification) {
      triggerNotification(
        "COMPILING A4 PDF ARCHIVE 📄",
        "Marksheet background layers and high-contrast color scheme construct ho rahe hain. Downloader trigger ho chuka hai.",
        "success"
      );
    }
    
    // Delay capture slightly to let the React state update flush and render shifted text positions
    setTimeout(() => {
      const card = document.getElementById('card-printed-view');
      if (!card) {
        alert("Error: Marksheet element not found!");
        setIsGeneratingPrint(false);
        return;
      }
      
      html2canvas(card, {
        scale: 2, // High DPI target print quality
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff', // Ensures white backgrounds
        logging: false,
        onclone: (clonedDoc) => {
          // Fix Tailwind v4 color issues in html2canvas (unsupported colors in style parsed list)
          try {
            // 1. Process inline styles of cloned style elements
            const styleEls = clonedDoc.querySelectorAll('style');
            styleEls.forEach((styleEl: any) => {
              if (styleEl.textContent) {
                styleEl.textContent = styleEl.textContent
                  .replace(/oklch\([^)]+\)/g, '#1e5631')
                  .replace(/oklab\([^)]+\)/g, '#1e5631');
              }
            });
          } catch (e) {
            console.warn("Could not replace text in style tags:", e);
          }

          try {
            // 2. Remove rules containing oklch / oklab in all parsed stylesheets
            for (let i = 0; i < clonedDoc.styleSheets.length; i++) {
              const sheet = clonedDoc.styleSheets[i];
              try {
                if (sheet.cssRules) {
                  for (let j = sheet.cssRules.length - 1; j >= 0; j--) {
                    const rule = sheet.cssRules[j];
                    if (rule.cssText && (rule.cssText.includes('oklch') || rule.cssText.includes('oklab'))) {
                      sheet.deleteRule(j);
                    }
                  }
                }
              } catch (sheetError) {
                // Ignore cross-origin stylesheet reading restrictions
              }
            }
          } catch (e) {
            console.warn("Could not filter rules in stylesheets:", e);
          }

          try {
            // 3. Purge element inline style values that contain oklch/oklab
            const elements = clonedDoc.querySelectorAll('*');
            elements.forEach((el: any) => {
              if (el.style) {
                if (el.style.color && (el.style.color.includes('oklch') || el.style.color.includes('oklab'))) {
                  el.style.color = '#1e5631';
                }
                if (el.style.backgroundColor && (el.style.backgroundColor.includes('oklch') || el.style.backgroundColor.includes('oklab'))) {
                  el.style.backgroundColor = '#ffffff';
                }
                if (el.style.borderColor && (el.style.borderColor.includes('oklch') || el.style.borderColor.includes('oklab'))) {
                  el.style.borderColor = '#1e5631';
                }
              }
            });
          } catch (e) {
            console.warn("Could not purge element styles:", e);
          }

          try {
            // 4. Shift custom shape outlines (boxes) down specifically during export using dynamic offsets
            const shapes = clonedDoc.querySelectorAll('.download-shape');
            shapes.forEach((shape: any) => {
              shape.style.position = 'relative';
              if (shape.classList.contains('download-shape-extra')) {
                shape.style.top = `${extraShapeOffset}px`;
              } else {
                shape.style.top = `${shapeOffset}px`;
              }
            });
          } catch (e) {
            console.warn("Could not shift download shapes:", e);
          }
        }
      }).then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgWidth = 210;
        const pageHeight = 297;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        // Margins/centering check: Since our aspect ratio fits standard A4 very well,
        // let's place it nicely on the A4 canvas
        const yPosition = imgHeight < pageHeight ? (pageHeight - imgHeight) / 2 : 0;
        pdf.addImage(imgData, 'PNG', 0, yPosition, imgWidth, Math.min(imgHeight, pageHeight));
        pdf.save(`Noorul_Uloom_Marksheet_${foundResult?.rollNo || 'Result'}.pdf`);
        setIsGeneratingPrint(false);
      }).catch(err => {
        console.error("PDF export error:", err);
        setIsGeneratingPrint(false);
        alert("Download failed. Please print directly using 'Print Marksheet A4' or open in a new tab.");
      });
    }, 150);
  };

  const handleDownloadJPG = () => {
    setIsGeneratingPrint(true);
    if (triggerNotification) {
      triggerNotification(
        "GENERATING MARK LIST IMAGE 🖼️",
        "High resolution JPEG format prepare ho raha hai. Aap is image ko WhatsApp pe aasani se share kar sakte hain.",
        "success"
      );
    }
    
    // Delay capture slightly to let any state changes flush
    setTimeout(() => {
      const card = document.getElementById('card-printed-view');
      if (!card) {
        alert("Error: Marksheet element not found!");
        setIsGeneratingPrint(false);
        return;
      }
      
      html2canvas(card, {
        scale: 2, // High DPI target quality
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff', // Ensures beautiful white backgrounds
        logging: false,
        onclone: (clonedDoc) => {
          // Fix Tailwind v4 color issues in html2canvas (unsupported colors in style parsed list)
          try {
            const styleEls = clonedDoc.querySelectorAll('style');
            styleEls.forEach((styleEl: any) => {
              if (styleEl.textContent) {
                styleEl.textContent = styleEl.textContent
                  .replace(/oklch\([^)]+\)/g, '#1e5631')
                  .replace(/oklab\([^)]+\)/g, '#1e5631');
              }
            });
          } catch (e) {
            console.warn("Could not replace text in style tags:", e);
          }

          try {
            for (let i = 0; i < clonedDoc.styleSheets.length; i++) {
              const sheet = clonedDoc.styleSheets[i];
              try {
                if (sheet.cssRules) {
                  for (let j = sheet.cssRules.length - 1; j >= 0; j--) {
                    const rule = sheet.cssRules[j];
                    if (rule.cssText && (rule.cssText.includes('oklch') || rule.cssText.includes('oklab'))) {
                      sheet.deleteRule(j);
                    }
                  }
                }
              } catch (sheetError) {
                // Ignore cross-origin stylesheet limits
              }
            }
          } catch (e) {
            console.warn("Could not filter rules in stylesheets:", e);
          }

          try {
            const elements = clonedDoc.querySelectorAll('*');
            elements.forEach((el: any) => {
              if (el.style) {
                if (el.style.color && (el.style.color.includes('oklch') || el.style.color.includes('oklab'))) {
                  el.style.color = '#1e5631';
                }
                if (el.style.backgroundColor && (el.style.backgroundColor.includes('oklch') || el.style.backgroundColor.includes('oklab'))) {
                  el.style.backgroundColor = '#ffffff';
                }
                if (el.style.borderColor && (el.style.borderColor.includes('oklch') || el.style.borderColor.includes('oklab'))) {
                  el.style.borderColor = '#1e5631';
                }
              }
            });
          } catch (e) {
            console.warn("Could not purge element styles:", e);
          }

          try {
            // Shift custom shape outlines (boxes) down specifically during export using dynamic offsets
            const shapes = clonedDoc.querySelectorAll('.download-shape');
            shapes.forEach((shape: any) => {
              shape.style.position = 'relative';
              if (shape.classList.contains('download-shape-extra')) {
                shape.style.top = `${extraShapeOffset}px`;
              } else {
                shape.style.top = `${shapeOffset}px`;
              }
            });
          } catch (e) {
            console.warn("Could not shift download shapes:", e);
          }
        }
      }).then((canvas) => {
        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        const link = document.createElement('a');
        link.download = `Noorul_Uloom_Marksheet_${foundResult?.rollNo || 'Result'}.jpg`;
        link.href = imgData;
        link.click();
        setIsGeneratingPrint(false);
      }).catch(err => {
        console.error("JPG export error:", err);
        setIsGeneratingPrint(false);
        alert("Download failed. Please try again or take a screenshot.");
      });
    }, 150);
  };

  // Determine current student's autocalculated rank relative to others
  const getAutocalculatedRank = (res: Result): string => {
    if (!res) return "-";
    const filteredByClass = results.filter(r => r.className === res.className);
    if (filteredByClass.length === 0) return "1";
    
    // Sort all by accumulated total
    const sorted = [...filteredByClass].sort((a,b) => {
      const totalA = Object.values(a.marks).reduce((sum, v) => sum + (Number(v)||0), 0);
      const totalB = Object.values(b.marks).reduce((sum, v) => sum + (Number(v)||0), 0);
      return totalB - totalA;
    });

    const rankIdx = sorted.findIndex(r => r.rollNo === res.rollNo);
    return rankIdx !== -1 ? String(rankIdx + 1) : "1";
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      {/* Dynamic Overwrite Styles for perfect print formatting (Hiding standard page menus on print) */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          /* Force Light Color Scheme during printing */
          :root {
            color-scheme: light !important;
          }
          body {
            background: white !important;
            background-color: white !important;
            color: black !important;
            padding: 0 !important;
            margin: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          /* Reset parent layout structural wrappers to prevent blank spaces and shifts */
          #root, #root > div, main, .max-w-4xl, .overflow-x-auto, .max-w-7xl, .space-y-6, .py-8 {
            position: static !important;
            overflow: visible !important;
            width: auto !important;
            max-width: none !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            background: transparent !important;
          }
          /* Counteract dark mode classes during print to prevent black sections */
          .dark, .dark * {
            background-color: transparent !important;
            color: black !important;
            border-color: #1e5631 !important;
          }
          /* Hide all general webpage elements on print */
          header, footer, .no-print, button, Arial, form, .controls, #savedListSection, .nav-ticker, .ticker-wrap, .news-ticker-container, .whatsapp-bubble, .scroll-to-top {
            display: none !important;
          }
          /* Let's make sure the card's outer wrappers don't block the visual printout */
          body * {
            visibility: hidden;
          }
          #card-printed-view, #card-printed-view * {
            visibility: visible !important;
          }
          #card-printed-view {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 906px !important;
            max-width: 906px !important;
            height: 1313px !important;
            min-height: 1313px !important;
            border: 5px solid #1e5631 !important;
            box-shadow: none !important;
            margin: 0 !important;
            padding: 20px !important;
            background: white !important;
            background-color: white !important;
            color: black !important;
            box-sizing: border-box !important;
            display: flex !important;
            flex-direction: column !important;
            zoom: 0.8 !important;
          }
          #topSpace {
            background: linear-gradient(90deg, #fdfbf7, #fffdd0, #fdfbf7) !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          #logoContainer, #logoContainer * , #logoContainer img, #urduLogoImg, .logo-container, .logo-container img {
            background-color: transparent !important;
            background: transparent !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          input, textarea, select {
            border: 1.5px solid #1e5631 !important;
            background-color: #f9fff9 !important;
            color: black !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          @page {
            size: A4 portrait;
            margin: 10mm;
          }
        }
      `}} />

      {/* Search Filter Headings */}
      <div className="text-center mb-8 space-y-2 no-print">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#1e5631]/10 text-[#1e5631] dark:text-[#a4be7b] rounded-full text-xs font-bold uppercase tracking-widest">
          <Award className="w-3.5 h-3.5" /> Examination Results Portal
        </div>
        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">
          Annual Examination Mark List
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
          Enter student credentials to generate and print beautiful color-patterned dynamic certificates.
        </p>
      </div>

      {!searchTriggered ? (
        <div className="max-w-md mx-auto p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl rounded-2xl space-y-6 no-print">
          <div className="pb-3 border-b border-slate-100 dark:border-slate-700/50 flex items-center gap-2">
            <span className="text-xl">🕌</span>
            <h3 className="font-bold text-slate-800 dark:text-white text-base">
              Search Result Card
            </h3>
          </div>

          <form onSubmit={handleSearch} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block">Class / Stream</label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value as ClassName)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-white font-semibold focus:ring-1 focus:ring-emerald-500"
              >
                {classes.map((c) => (
                  <option key={c} value={c}>{formatClassName(c)}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block">Exam Type</label>
                <select
                  value={selectedExamType}
                  onChange={(e) => setSelectedExamType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-white font-semibold focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="Annual">Annual Examination</option>
                  <option value="Half-Yearly">Half-Yearly Examination</option>
                  <option value="Quarterly">Quarterly Examination</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block">Academic Year</label>
                <select
                  value={selectedSession}
                  onChange={(e) => setSelectedSession(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-white font-semibold focus:ring-1 focus:ring-emerald-500"
                >
                  {availableSessions.map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block">Student Roll Number</label>
              <input
                type="text"
                required
                placeholder="e.g. 2026101"
                value={rollNo}
                onChange={(e) => setRollNo(e.target.value.replace(/\D/g, ''))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-white font-mono font-bold"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                <strong>💡 Quick Tip:</strong> Enter Roll: <code className="font-bold text-emerald-600">2026101</code> or <code className="font-bold text-emerald-600">2026102</code> to test!
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#1e5631] hover:bg-[#1a4929] text-white text-xs font-bold tracking-wider uppercase rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              Verify & Get Result Card
            </button>
          </form>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="flex justify-center items-center bg-white dark:bg-slate-850 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm no-print">
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-800 dark:text-white text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer border border-slate-200 dark:border-slate-700 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Search Another
            </button>
          </div>

          {foundResult ? (
            <>
              {/* EXACT HTML RENDERING WRAPPER WITH DIRECT SCALE SUPPORT FOR FULL COMPATIBILITY WITH IMAGE EXPORT */}
              <div className="overflow-x-auto py-4">
              <div
                id="card-printed-view"
                className="bg-white text-black font-sans font-bold shadow-2xl relative select-none rounded-[16px]"
                style={{
                  width: '906px',
                  margin: 'auto',
                  background: '#ffffff',
                  border: '5px solid #1e5631',
                  padding: '20px',
                  minHeight: '1313px',
                  display: 'flex',
                  flexDirection: 'column',
                  boxSizing: 'border-box'
                }}
              >
                {/* Header Curved Ribbon */}
                <div
                  id="topSpace"
                  style={{
                    position: 'relative',
                    height: '280px',
                    marginBottom: '30px',
                    background: 'linear-gradient(90deg, #fdfbf7, #fffdd0, #fdfbf7)',
                    margin: '-20px -20px 30px -20px',
                    padding: '15px',
                    borderRadius: '12px 12px 0 0',
                    clipPath: 'ellipse(110% 100% at 50% 0%)',
                    borderBottom: '2px solid #a5d6a7'
                  }}
                >
                  {/* Left Reg No */}
                  <div 
                    style={{
                      position: 'absolute',
                      top: '10px',
                      left: '22px',
                      fontSize: '14px',
                      color: '#2e7d32',
                      fontWeight: 800,
                      zIndex: 15,
                      display: 'flex',
                      gap: '4px',
                      alignItems: 'center'
                    }}
                  >
                    Reg. No: 
                    <span 
                      style={{
                        border: 'none', 
                        background: 'transparent', 
                        paddingLeft: '4px',
                        color: '#000000',
                        fontWeight: 900
                      }} 
                    >
                      {foundResult.regNo || "G- 59313"}
                    </span>
                  </div>

                  {/* Right Rukniyat No (Positioned on the right side directly above student photo) */}
                  <div 
                    style={{
                      position: 'absolute',
                      top: '10px',
                      right: '22px',
                      fontSize: '14px',
                      color: '#1b5e20',
                      fontWeight: 800,
                      zIndex: 15,
                      display: 'flex',
                      gap: '4px',
                      alignItems: 'center',
                      direction: 'rtl',
                      fontFamily: '"Urdu Typesetting", "Sakkal Majalla", serif'
                    }}
                  >
                    رکنیت نمبر: 
                    <span 
                      style={{
                        border: 'none', 
                        background: 'transparent', 
                        paddingRight: '4px',
                        color: '#000000',
                        fontWeight: 900,
                        fontFamily: 'sans-serif'
                      }} 
                    >
                      {foundResult.udise || "4053"}
                    </span>
                  </div>

                  {/* Left Stamp/Logo circle */}
                  <div 
                    id="logoContainer" 
                    style={{
                      position: 'absolute',
                      left: '10px',
                      top: '50px',
                      width: '170px',
                      height: '170px',
                      zIndex: '10',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {schoolLogo ? (
                      <img src={schoolLogo} alt="School Logo" style={{ width: '100%', height: '100%', objectFit: 'contain', backgroundColor: 'transparent' }} />
                    ) : (
                      <div className="w-[150px] h-[150px] rounded-full border-4 border-[#1e5631] border-dashed flex flex-col items-center justify-center p-2 bg-[#fffdd0]/40 text-center">
                        <span className="text-[34px]">🕌</span>
                        <span className="text-[11px] font-black leading-tight text-[#1e5631]">NOORUL ULOOM</span>
                        <span className="text-[9px] font-bold text-[#1e5631]">KARMALHAN</span>
                      </div>
                    )}
                  </div>

                  {/* Draggable Header with text titles */}
                  <div 
                    id="headerDraggable" 
                    style={{
                      position: 'absolute',
                      left: '180px',
                      right: '150px',
                      textAlign: 'center',
                      zIndex: '5',
                      top: '10px'
                    }}
                  >
                    <div>
                      {urduLogo ? (
                        <img 
                          id="urduLogoImg" 
                          src={urduLogo} 
                          alt="Urdu Name calligraphy" 
                          style={{ maxWidth: '800px', height: '130px', objectFit: 'contain', margin: 'auto', backgroundColor: 'transparent' }} 
                        />
                      ) : (
                        <div style={{ height: '110px', textAlign: 'center', lineHeight: '110px' }}>
                          <span style={{ fontSize: '32px', color: '#1b5e20', fontFamily: 'Georgia, serif', display: 'inline-block', lineHeight: '1' }}>مَدْرَسَة عَرَبِيَّة نُورُ الْعُلُومِ كَارْمَاخَانْ</span>
                        </div>
                      )}
                    </div>
                    <div style={{ fontSize: '30px', fontWeight: 900, color: '#0000FF', marginTop: '-5px' }}>
                      MADARSA ARABIA NOORUL ULOOM
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: 800, color: '#0000FF' }}>
                      Karma Khan, Distt: Sant Kabir Nagar (U.P.)
                    </div>
                    <div 
                      className="download-shape download-shape-extra"
                      style={{
                        fontSize: '22px', 
                        marginTop: '5px', 
                        background: '#FFFDD0', 
                        color: '#000000', 
                        display: 'inline-block', 
                        padding: '6px 25px 8px 25px', 
                        borderRadius: '18px', 
                        border: '1px solid #1e5631',
                        fontWeight: 900,
                        lineHeight: '1.2',
                        textAlign: 'center'
                      }}
                    >
                      {foundResult.examType 
                        ? (foundResult.examType.toLowerCase() === 'annual' 
                          ? 'Annual Examination' 
                          : foundResult.examType.toLowerCase() === 'half-yearly' 
                            ? 'Half-Yearly Examination' 
                            : foundResult.examType.toLowerCase() === 'quarterly'
                              ? 'Quarterly Examination'
                              : foundResult.examType)
                        : 'Annual Examination'
                      } - {normalizeSession(foundResult.session)}
                    </div>
                  </div>

                  {/* Right Student picture Frame */}
                  <div 
                    id="photoBox" 
                    style={{
                      position: 'absolute',
                      top: '60px',
                      right: '15px',
                      width: '130px',
                      height: '150px',
                      border: '2px solid #2e7d32',
                      background: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: '10',
                      overflow: 'hidden'
                    }}
                  >
                    {foundResult.photoUrl ? (
                      <img 
                        src={foundResult.photoUrl} 
                        alt="Candidate Portrait" 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <span id="photoText" style={{ color: '#2e7d32', fontSize: '13px', fontWeight: 'bold' }}>Photo</span>
                    )}
                  </div>
                </div>

                {/* Student Details Fields - Beautifully Aligned Rows */}
                {/* Row 1 */}
                <div style={{ display: 'flex', gap: '16px', marginBottom: '12px', alignItems: 'center', color: '#1e5631', width: '100%' }}>
                  <div style={{ width: '425px', display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}>
                    <span style={{ fontSize: '17px', fontWeight: 800, width: '130px', display: 'inline-block' }}>Student Name:</span> 
                    <div 
                      className="download-shape"
                      style={{ 
                        fontSize: '17px', 
                        fontWeight: 900, 
                        border: '1.5px solid #1e5631', 
                        borderRadius: '4px', 
                        background: '#f9fff9', 
                        width: '287px', 
                        boxSizing: 'border-box', 
                        height: '38px', 
                        lineHeight: '35px', 
                        color: '#000000',
                        display: 'block',
                        padding: '0px 10px',
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                        textOverflow: 'ellipsis',
                        textAlign: 'left'
                      }}
                    >
                      {foundResult.studentName.toUpperCase()}
                    </div>
                  </div>
                  <div style={{ width: '425px', display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}>
                    <span style={{ fontSize: '17px', fontWeight: 800, width: '130px', display: 'inline-block' }}>Father Name:</span> 
                    <div 
                      className="download-shape"
                      style={{ 
                        fontSize: '17px', 
                        fontWeight: 900, 
                        border: '1.5px solid #1e5631', 
                        borderRadius: '4px', 
                        background: '#f9fff9', 
                        width: '287px', 
                        boxSizing: 'border-box', 
                        height: '38px', 
                        lineHeight: '35px', 
                        color: '#000000',
                        display: 'block',
                        padding: '0px 10px',
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                        textOverflow: 'ellipsis',
                        textAlign: 'left'
                      }}
                    >
                      {foundResult.fatherName.toUpperCase()}
                    </div>
                  </div>
                </div>

                {/* Row 2 */}
                <div style={{ display: 'flex', gap: '15px', marginBottom: '12px', alignItems: 'center', color: '#1e5631', width: '100%' }}>
                  <div style={{ width: '357px', display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}>
                    <span style={{ fontSize: '17px', fontWeight: 800, width: '130px', display: 'inline-block' }}>Mother Name:</span> 
                    <div 
                      className="download-shape"
                      style={{ 
                        fontSize: '17px', 
                        fontWeight: 900, 
                        border: '1.5px solid #1e5631', 
                        borderRadius: '4px', 
                        background: '#f9fff9', 
                        width: '219px', 
                        boxSizing: 'border-box', 
                        height: '38px', 
                        lineHeight: '35px', 
                        color: '#000000',
                        display: 'block',
                        padding: '0px 10px',
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                        textOverflow: 'ellipsis',
                        textAlign: 'left'
                      }}
                    >
                      {(foundResult.motherName || "ZAREENA KHATOON").toUpperCase()}
                    </div>
                  </div>
                  <div style={{ width: '177px', display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap', flexShrink: 0 }}>
                    <span style={{ fontSize: '16px', fontWeight: 800, width: '55px', display: 'inline-block' }}>D.O.B:</span> 
                    <div 
                      className="download-shape"
                      style={{ 
                        fontSize: '16px', 
                        fontWeight: 900, 
                        border: '1.5px solid #1e5631', 
                        borderRadius: '4px', 
                        background: '#f9fff9', 
                        width: '114px', 
                        boxSizing: 'border-box', 
                        height: '38px', 
                        lineHeight: '35px', 
                        color: '#000000',
                        display: 'block',
                        padding: '0px 8px',
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                        textOverflow: 'ellipsis',
                        textAlign: 'center'
                      }}
                    >
                      {foundResult.dateOfBirth || "12-04-2011"}
                    </div>
                  </div>
                  <div style={{ width: '157px', display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap', flexShrink: 0 }}>
                     <span style={{ fontSize: '16px', fontWeight: 800, width: '50px', display: 'inline-block' }}>Class:</span> 
                     <div 
                       className="download-shape"
                       style={{ 
                         fontSize: '16px', 
                         fontWeight: 900, 
                         border: '1.5px solid #1e5631', 
                         borderRadius: '4px', 
                         background: '#f9fff9', 
                         width: '99px', 
                         boxSizing: 'border-box', 
                         height: '38px', 
                         lineHeight: '35px', 
                         color: '#000000',
                         display: 'block',
                         padding: '0px 8px',
                         overflow: 'hidden',
                         whiteSpace: 'nowrap',
                         textOverflow: 'ellipsis',
                         textAlign: 'center'
                       }}
                     >
                       {formatClassName(foundResult.className)}
                     </div>
                  </div>
                  <div style={{ width: '127px', display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap', flexShrink: 0 }}>
                     <span style={{ fontSize: '16px', fontWeight: 800, width: '52px', display: 'inline-block' }}>Roll No:</span> 
                     <div 
                       className="download-shape"
                       style={{ 
                         fontSize: '16px', 
                         fontWeight: 900, 
                         border: '1.5px solid #1e5631', 
                         borderRadius: '4px', 
                         background: '#f9fff9', 
                         width: '67px', 
                         boxSizing: 'border-box', 
                         height: '38px', 
                         lineHeight: '35px', 
                         color: '#000000',
                         display: 'block',
                         padding: '0px 8px',
                         overflow: 'hidden',
                         whiteSpace: 'nowrap',
                         textOverflow: 'ellipsis',
                         textAlign: 'center'
                       }}
                     >
                       {foundResult.rollNo}
                     </div>
                  </div>
                </div>

                {/* Address full width block underneath */}
                <div style={{ display: 'flex', gap: '15px', marginBottom: '14px', alignItems: 'center', color: '#1e5631', width: '100%' }}>
                  <div style={{ width: '866px', display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}>
                    <span style={{ fontSize: '17px', fontWeight: 800, width: '130px', display: 'inline-block' }}>Address:</span> 
                    <div 
                      className="download-shape"
                      style={{ 
                        fontSize: '16px', 
                        fontWeight: 900, 
                        border: '1.5px solid #1e5631', 
                        borderRadius: '4px', 
                        background: '#f9fff9', 
                        width: '728px', 
                        boxSizing: 'border-box', 
                        height: '38px', 
                        lineHeight: '35px', 
                        color: '#000000',
                        display: 'block',
                        padding: '0px 10px',
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                        textOverflow: 'ellipsis',
                        textAlign: 'left'
                      }}
                    >
                      {foundResult.address || "VILLAGE & POST KARMA KHAN, DISTRICT SANT KABIR NAGAR, UTTAR PRADESH"}
                    </div>
                  </div>
                </div>

                {/* Rainbow Table of Subject Marks */}
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px', background: 'white', border: '2px solid #1e5631' }}>
                  <thead>
                    <tr>
                      <th style={{ border: '1.5px solid #1e5631', padding: '6px', textAlign: 'center', fontSize: '17px', background: '#FFFDD0', color: '#000000', fontWeight: 900, width: '60px' }}>S.R.</th>
                      <th style={{ border: '1.5px solid #1e5631', padding: '6px', textAlign: 'center', fontSize: '17px', background: '#FFFDD0', color: '#000000', fontWeight: 900 }}>Subject</th>
                      <th style={{ border: '1.5px solid #1e5631', padding: '6px', textAlign: 'center', fontSize: '17px', background: '#FFFDD0', color: '#000000', fontWeight: 900, width: '100px' }}>Max</th>
                      <th style={{ border: '1.5px solid #1e5631', padding: '6px', textAlign: 'center', fontSize: '17px', background: '#FFFDD0', color: '#000000', fontWeight: 900, width: '160px' }}>Marks Obtained</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getClassSubjects(foundResult.className).map((sub, idx) => {
                      const mark = getSubjectMark(foundResult, sub, idx);
                      const color = SUBJECT_COLORS[idx % SUBJECT_COLORS.length];

                      return (
                        <tr key={sub} style={{ backgroundColor: color }}>
                          <td style={{ border: '1.5px solid #1e5631', padding: '6px', textAlign: 'center', fontSize: '17px', fontWeight: 900, color: '#000000', fontFamily: 'sans-serif' }}>{idx + 1}</td>
                          <td className="subject-name" style={{ border: '1.5px solid #1e5631', padding: '6px', textAlign: 'center', fontSize: '17px', fontWeight: 950, fontStyle: 'italic', fontFamily: 'Georgia, serif', color: '#000000' }}>{sub}</td>
                          <td style={{ border: '1.5px solid #1e5631', padding: '6px', textAlign: 'center', fontSize: '17px', color: '#000000', fontWeight: 900 }}>100</td>
                          <td style={{ border: '1.5px solid #1e5631', padding: '6px', textAlign: 'center', fontSize: '17px', fontWeight: 900, color: '#000000' }}>{mark}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    {/* Autocalculated Row Total */}
                    <tr style={{ background: '#f9fff9' }}>
                      <th colSpan={2} style={{ border: '1.5px solid #1e5631', padding: '6px', textAlign: 'center', fontSize: '17px', color: '#000000', fontWeight: 900 }}>Total</th>
                      <th style={{ border: '1.5px solid #1e5631', padding: '6px', textAlign: 'center', fontSize: '17px', color: '#000000', fontWeight: 900 }}>{getClassSubjects(foundResult.className).length * 100}</th>
                      <th id="total" style={{ border: '1.5px solid #1e5631', padding: '6px', textAlign: 'center', fontSize: '17px', fontWeight: 900, color: '#000000' }}>
                        {getClassSubjects(foundResult.className).reduce((sum, sub, i) => sum + getSubjectMark(foundResult, sub, i), 0)}
                      </th>
                    </tr>
                    
                    {/* Autocalculated Percentage */}
                    <tr style={{ background: '#f9fff9' }}>
                      <th colSpan={2} style={{ border: '1.5px solid #1e5631', padding: '6px', textAlign: 'center', fontSize: '17px', color: '#000000', fontWeight: 900 }}>Percentage</th>
                      <th colSpan={2} id="percent" style={{ border: '1.5px solid #1e5631', padding: '6px', textAlign: 'center', fontSize: '17px', fontWeight: 900, color: '#000000' }}>
                        {getClassSubjects(foundResult.className).length > 0 ? (
                          (getClassSubjects(foundResult.className).reduce((sum, sub, i) => sum + getSubjectMark(foundResult, sub, i), 0) / getClassSubjects(foundResult.className).length).toFixed(2)
                        ) : '0.00'}%
                      </th>
                    </tr>

                    {/* Student Rank relative to active database */}
                    <tr style={{ backgroundColor: '#fffdd0' }}>
                      <th colSpan={2} style={{ border: '1.5px solid #1e5631', padding: '6px', textAlign: 'center', fontSize: '17px', color: '#000000', fontWeight: 900 }}>Rank</th>
                      <th colSpan={2} id="rank" style={{ border: '1.5px solid #1e5631', padding: '6px', textAlign: 'center', fontSize: '18px', fontWeight: 900, color: '#000000' }}>
                        {getAutocalculatedRank(foundResult)}
                      </th>
                    </tr>

                    {/* Calculated Division Row */}
                    <tr style={{ backgroundColor: '#fffdd0' }}>
                      <th colSpan={2} style={{ border: '1.5px solid #1e5631', padding: '6px', textAlign: 'center', fontSize: '17px', color: '#000000', fontWeight: 900 }}>Division</th>
                      <th colSpan={2} style={{ border: '1.5px solid #1e5631', padding: '6px', textAlign: 'center', fontSize: '18px', fontWeight: 900, color: '#000000', fontStyle: 'italic' }}>
                        {foundResult.division || ""}
                      </th>
                    </tr>
                  </tfoot>
                </table>

                {/* PASS / FAIL STATUS INDICATORS IN DECORATIVE PILLS FRAME */}
                <div 
                  id="resultBox"
                  className="download-shape download-shape-extra"
                  style={{
                    margin: '15px auto', 
                    width: '600px', 
                    height: '56px',
                    lineHeight: '52px',
                    padding: '0 20px', 
                    textAlign: 'center', 
                    fontSize: '22px', 
                    fontWeight: 900, 
                    background: '#fdfbf7', 
                    border: '2px solid #1b5e20', 
                    borderRadius: '10px', 
                    display: 'block', 
                    color: '#1b5e20',
                    boxSizing: 'border-box'
                  }}
                >
                  <span style={{ display: 'inline-block', marginRight: '40px', verticalAlign: 'middle' }}>RESULT:</span>
                  
                   {/* PASS✓ Label Block */}
                  <span 
                    className={`status-label ${
                      (getClassSubjects(foundResult.className).length > 0 &&
                       (getClassSubjects(foundResult.className).reduce((sum, sub, i) => sum + getSubjectMark(foundResult, sub, i), 0) / getClassSubjects(foundResult.className).length) >= 23) 
                        ? 'opacity-100 bg-white font-black' 
                        : 'opacity-25 line-through font-normal'
                    }`}
                    style={{
                      padding: '2px 20px',
                      borderRadius: '5px',
                      border: (getClassSubjects(foundResult.className).length > 0 &&
                              (getClassSubjects(foundResult.className).reduce((sum, sub, i) => sum + getSubjectMark(foundResult, sub, i), 0) / getClassSubjects(foundResult.className).length) >= 23) ? '2.5px solid #1b5e20' : '1px solid currentColor',
                      color: (getClassSubjects(foundResult.className).length > 0 &&
                              (getClassSubjects(foundResult.className).reduce((sum, sub, i) => sum + getSubjectMark(foundResult, sub, i), 0) / getClassSubjects(foundResult.className).length) >= 23) ? '#1b5e20' : '#888',
                      display: 'inline-block',
                      marginRight: '40px',
                      height: '36px',
                      lineHeight: '30px',
                      verticalAlign: 'middle'
                    }}
                  >
                    PASS ✓
                  </span>

                  {/* FAIL✗ Label Block */}
                  <span 
                    className={`status-label ${
                      (getClassSubjects(foundResult.className).length === 0 ||
                       (getClassSubjects(foundResult.className).reduce((sum, sub, i) => sum + getSubjectMark(foundResult, sub, i), 0) / getClassSubjects(foundResult.className).length) < 23) 
                        ? 'opacity-100 bg-white font-black' 
                        : 'opacity-25 line-through font-normal'
                    }`}
                    style={{
                      padding: '2px 20px',
                      borderRadius: '5px',
                      border: (getClassSubjects(foundResult.className).length === 0 ||
                              (getClassSubjects(foundResult.className).reduce((sum, sub, i) => sum + getSubjectMark(foundResult, sub, i), 0) / getClassSubjects(foundResult.className).length) < 23) ? '2.5px solid #d32f2f' : '1px solid currentColor',
                      color: (getClassSubjects(foundResult.className).length === 0 ||
                              (getClassSubjects(foundResult.className).reduce((sum, sub, i) => sum + getSubjectMark(foundResult, sub, i), 0) / getClassSubjects(foundResult.className).length) < 23) ? '#d32f2f' : '#888',
                      display: 'inline-block',
                      height: '36px',
                      lineHeight: '30px',
                      verticalAlign: 'middle'
                    }}
                  >
                    FAIL ✗
                  </span>
                </div>

                {/* Footer Signatures Area */}
                <div 
                  className="footer-sign"
                  style={{
                    marginTop: 'auto',
                    padding: '0 40px',
                    paddingBottom: '30px',
                    color: '#1e5631',
                    fontSize: '16px',
                    width: '866px',
                    boxSizing: 'border-box'
                  }}
                >
                  <div style={{ width: '393px', display: 'inline-block', textAlign: 'left' }}>Principal Signature: ___________________________</div>
                  <div style={{ width: '393px', display: 'inline-block', textAlign: 'right' }}>Stamp:____________________________________</div>
                </div>
              </div>
            </div>



            {/* Direct Print Action Button Component */}
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-6 mb-4 no-print">
              <button
                id="directPrintBtn"
                onClick={handleLaptopPrint}
                disabled={isGeneratingPrint}
                className={`px-8 py-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-extrabold text-sm rounded-xl flex items-center gap-2 shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] cursor-pointer ${
                  isGeneratingPrint ? 'opacity-75 cursor-not-allowed' : ''
                }`}
              >
                <Printer className="w-5 h-5 animate-pulse" />
                <span>🖨️ {isGeneratingPrint ? "Preparing..." : "Print Marksheet A4 (मार्कशीट प्रिंट करें)"}</span>
              </button>
            </div>
          </>
          ) : (
            <div className="p-8 bg-red-50 dark:bg-slate-800/50 border border-red-200 dark:border-red-950/50 rounded-2xl text-center space-y-4 no-print">
              <span className="text-4xl block">⚠️</span>
              <h4 className="font-extrabold text-[#1e5631] dark:text-[#a4be7b] text-lg">Results Transcript Not Found</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-normal">
                No matching results on record for Class <strong>{selectedClass}</strong> with Roll Number <strong>"{rollNo}"</strong>. Please verify details with the administration.
              </p>
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-[#1e5631] text-white font-bold text-xs rounded-lg cursor-pointer"
              >
                Go Back & Retry
              </button>
            </div>
          )}
        </div>
      )}

      {/* Beautiful Iframe Print Dialogue Warning Modal */}
      {showPrintIframeModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 no-print">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-200 text-slate-800 dark:text-white">
            
            {/* Close Button */}
            <button 
              onClick={() => setShowPrintIframeModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer transition-colors"
              title="Close"
            >
              ✕
            </button>

            {/* Warning Header Accent */}
            <div className="text-center space-y-3">
              <div className="mx-auto w-16 h-16 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center text-3xl animate-bounce">
                ⚠️
              </div>
              <h3 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                Print Blocked by Browser Preview
              </h3>
              <p className="text-sm font-bold text-amber-600 dark:text-amber-400">
                प्रिंट डायलॉग ब्लॉक हो गया है (सुरक्षा नियम)
              </p>
            </div>

            {/* Explanatory Texts */}
            <div className="mt-4 space-y-3 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              <p className="border-l-4 border-amber-500 pl-3 bg-amber-50/50 dark:bg-amber-950/20 py-2 rounded-r-lg">
                <strong>English:</strong> You are currently using this app inside the secure editor preview (iframe) where browsers strictly block direct page printing functions.
              </p>
              <p className="border-l-4 border-emerald-500 pl-3 bg-emerald-50/50 dark:bg-emerald-950/20 py-2 rounded-r-lg">
                <strong>हिंदी:</strong> आप अभी AI Studio एडिटर के सुरक्षित प्रीव्यू (इमबेडेड फ्रेम) में हैं। इंटरनेट ब्राउज़र सुरक्षा कारणों से इस फ्रेम के अंदर डायरेक्ट प्रिंट डायलॉग खोलने से रोकते हैं।
              </p>

              {/* Steps */}
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2 mt-4">
                <h4 className="font-extrabold text-slate-800 dark:text-slate-200 text-xs">
                  How to print? (प्रिंट कैसे करें? आसान तरीका):
                </h4>
                <ol className="list-decimal list-inside space-y-1.5 font-medium text-slate-700 dark:text-slate-300">
                  <li>नीचे दिए गए <strong>"Open in New Tab"</strong> बटन पर क्लिक करें।</li>
                  <li>नए टैब में रोल नंबर सर्च करें।</li>
                  <li>अब प्रिंट बटन दबाएं—प्रिंट डायलॉग तुरंत खुल जाएगा!</li>
                </ol>
              </div>
            </div>

            {/* CTA Option Grid */}
            <div className="mt-6 space-y-2">
              <a 
                href={typeof window !== 'undefined' ? window.location.href : '#'}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setShowPrintIframeModal(false)}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:scale-[0.98] text-white font-extrabold text-sm rounded-2xl flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all transform cursor-pointer decoration-none"
              >
                <span>↗️ Open in New Tab & Print (नए टैब में खोलें)</span>
              </a>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowPrintIframeModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition duration-150 cursor-pointer"
                >
                  Close (बंद करें)
                </button>
                <button
                  onClick={() => {
                    setShowPrintIframeModal(false);
                    // trigger JPG download as alternative
                    handleDownloadJPG();
                  }}
                  className="flex-1 py-2.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold text-xs rounded-xl border border-amber-300/30 transition duration-150 cursor-pointer"
                >
                  Download JPG (फोटो डाउनलोड करें)
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
