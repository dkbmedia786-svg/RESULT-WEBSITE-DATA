import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import NewsTicker from './components/NewsTicker';
import Homepage from './components/Homepage';
import ResultPortal from './components/ResultPortal';
import PrincipalDashboard from './components/PrincipalDashboard';
import AdmissionForm from './components/AdmissionForm';
import DuaPortal from './components/DuaPortal';
import {
  Student, Result, Teacher, AdmissionApplication, GalleryItem, NewsItem, SchoolConfig, ClassName, Dua
} from './types';
import {
  INITIAL_CONFIG, INITIAL_STUDENTS, INITIAL_RESULTS, INITIAL_TEACHERS,
  INITIAL_ADMISSIONS, INITIAL_GALLERY, INITIAL_NEWS, INITIAL_DUAS, getStoredData, setStoredData, getSchoolClasses
} from './data';
import { ArrowUp, MessageSquare, ShieldCheck, HelpCircle } from 'lucide-react';
import { useFirebaseSync, useFirebaseSyncConfig } from './useFirebaseSync';
import { getCachedAccessToken, uploadToGoogleSheet, fetchFromGoogleSheet } from './googleSheetsSync';
import InteractiveFeedback from './components/InteractiveFeedback';

function normalizeClassName(rawClass: any): any {
  if (!rawClass) return "EDADIA";
  const str = String(rawClass).trim().toUpperCase();
  if (str === "L.K.G" || str === "LKG" || str === "L. K. G.") return "L.K.G";
  if (str === "U.K.G" || str === "UKG" || str === "U. K. G.") return "U.K.G";
  if (str === "1ST A" || str === "1 A" || str === "1A" || str === "CLASS 1 A" || str.includes("1ST A") || str.includes("1 A")) return "1ST A";
  if (str === "1ST B" || str === "1 B" || str === "1B" || str === "CLASS 1 B" || str.includes("1ST B") || str.includes("1 B")) return "1ST B";
  if (str === "2ND A" || str === "2 A" || str === "2A" || str === "CLASS 2 A" || str.includes("2ND A") || str.includes("2 A")) return "2ND A";
  if (str === "2ND B" || str === "2 B" || str === "2B" || str === "CLASS 2 B" || str.includes("2ND B") || str.includes("2 B")) return "2ND B";
  if (str === "3RD A" || str === "3 A" || str === "3A" || str === "CLASS 3 A" || str.includes("3RD A") || str.includes("3 A")) return "3RD A";
  if (str === "3RD B" || str === "3 B" || str === "3B" || str === "CLASS 3 B" || str.includes("3RD B") || str.includes("3 B")) return "3RD B";
  if (str === "4TH A" || str === "4 A" || str === "4A" || str === "CLASS 4 A" || str.includes("4TH A") || str.includes("4 A")) return "4TH A";
  if (str === "4TH B" || str === "4 B" || str === "4B" || str === "CLASS 4 B" || str.includes("4TH B") || str.includes("4 B")) return "4TH B";
  if (str === "5TH A" || str === "5 A" || str === "5A" || str === "CLASS 5 A" || str.includes("5TH A") || str.includes("5 A")) return "5TH A";
  if (str === "5TH B" || str === "5 B" || str === "5B" || str === "CLASS 5 B" || str.includes("5TH B") || str.includes("5 B")) return "5TH B";

  if (str === "1" || str === "1ST" || str === "FIRST" || str === "I" || str === "CLASS 1" || str === "CLASS 1ST") return "1ST A";
  if (str === "2" || str === "2ND" || str === "SECOND" || str === "II" || str === "CLASS 2" || str === "CLASS 2ND") return "2ND A";
  if (str === "3" || str === "3RD" || str === "THIRD" || str === "III" || str === "CLASS 3" || str === "CLASS 3RD") return "3RD A";
  if (str === "4" || str === "4TH" || str === "FOURTH" || str === "IV" || str === "CLASS 4" || str === "CLASS 4TH") return "4TH A";
  if (str === "5" || str === "5TH" || str === "FIFTH" || str === "V" || str === "CLASS 5" || str === "CLASS 5TH") return "5TH A";
  if (str === "EDADIA" || str === "IDADIA" || str === "IDADYAH" || str === "EDADYAH" || str === "IDAADIYA" || str === "IDADIYA" || str === "I'DADIYAH" || str === "I'DADIYA") return "EDADIA";
  if (str === "FARSI") return "FARSI";
  if (str === "ARBI" || str === "ARABIC") return "ARBI";
  
  const valid = [
    ...getSchoolClasses(),
    '1ST', '2ND', '3RD', '4TH', '5TH'
  ];
  if (valid.includes(str)) return str;
  const found = valid.find(c => str.includes(c) || c.includes(str));
  if (found) return found;
  return "EDADIA";
}

export default function App() {
  // Loading Splash Screen state
  const [loading, setLoading] = useState(true);

  // Visual/Environment parameters
  const [currentTab, setCurrentTab] = useState('home');
  const [darkMode, setDarkMode] = useState(() => getStoredData('nu_darkmode', false));
  const [isLoggedIn, setIsLoggedIn] = useState(() => getStoredData('nu_islogged', false));
  const [visitorCount, setVisitorCount] = useState(() => getStoredData('nu_visitors', 384));
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Central Database States backed up to Firestore
  const [students, setStudents, studentsLoaded] = useFirebaseSync<Student>('students', getStoredData('nu_students', INITIAL_STUDENTS));
  
  const initialResults = () => {
    let loaded: Result[] = [];
    const primary = getStoredData<Result[]>('nu_results', []);
    if (primary && primary.length > 0) {
      loaded = primary;
    } else {
      const fallback = getStoredData<Result[]>('madarsa_records', []);
      if (fallback && fallback.length > 0) {
        loaded = fallback;
      } else {
        loaded = INITIAL_RESULTS;
      }
    }
    return loaded.map(r => ({
      ...r,
      className: normalizeClassName(r.className) as ClassName
    }));
  };
  const [results, setResults, resultsLoaded] = useFirebaseSync<Result>('results', initialResults());
  const [teachers, setTeachers, teachersLoaded] = useFirebaseSync<Teacher>('teachers', getStoredData('nu_teachers', INITIAL_TEACHERS));
  const [admissions, setAdmissions, admissionsLoaded] = useFirebaseSync<AdmissionApplication>('admissions', getStoredData('nu_admissions', INITIAL_ADMISSIONS), isLoggedIn);
  const [gallery, setGallery, galleryLoaded] = useFirebaseSync<GalleryItem>('gallery', getStoredData('nu_gallery', INITIAL_GALLERY));
  const [news, setNews, newsLoaded] = useFirebaseSync<NewsItem>('news', getStoredData('nu_news', INITIAL_NEWS));
  const [schoolConfig, setSchoolConfig, configLoaded] = useFirebaseSyncConfig<SchoolConfig>('config', getStoredData('nu_config', INITIAL_CONFIG));
  const [duas, setDuas, duasLoaded] = useFirebaseSync<Dua>('duas', getStoredData('nu_duas', INITIAL_DUAS));

  const [notification, setNotification] = useState<{
    title: string;
    message: string;
    type: 'success' | 'info' | 'warning' | 'error' | 'congrats';
    isOpen: boolean;
  } | null>(null);

  const triggerNotification = (
    title: string,
    message: string,
    type: 'success' | 'info' | 'warning' | 'error' | 'congrats' = 'success'
  ) => {
    setNotification({
      title,
      message,
      type,
      isOpen: true
    });
  };

  useEffect(() => {
    if (studentsLoaded && resultsLoaded && teachersLoaded && admissionsLoaded && galleryLoaded && newsLoaded && configLoaded && duasLoaded) {
      setLoading(false);
    }
  }, [studentsLoaded, resultsLoaded, teachersLoaded, admissionsLoaded, galleryLoaded, newsLoaded, configLoaded, duasLoaded]);

  // Initial loader and migration effect
  useEffect(() => {
    // Migrate old default address/phone if present in stored local storage config to ensure user immediately sees the new address
    const stored = localStorage.getItem('nu_config');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed && (parsed.address?.includes("Lucknow") || parsed.contactPhone === "+91 98765 43210")) {
          parsed.address = "Noorul Uloom Campus Karma Khan District Sant Kabir Nagar Uttar Pradesh -272126";
          parsed.contactPhone = "+91 9193984452";
          parsed.whatsappNumber = "+919193984452";
          localStorage.setItem('nu_config', JSON.stringify(parsed));
          setSchoolConfig(parsed);
        }
      } catch (e) {
        console.error("Migration error: ", e);
      }
    }
  }, []);

  // Keep local preferences
  useEffect(() => { setStoredData('nu_darkmode', darkMode); }, [darkMode]);
  useEffect(() => { setStoredData('nu_islogged', isLoggedIn); }, [isLoggedIn]);

  // Handle Dark mode DOM tags update
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Visitor increment on mount
  useEffect(() => {
    const freshVal = visitorCount + 1;
    setVisitorCount(freshVal);
    setStoredData('nu_visitors', freshVal);
  }, []);

  // Reusable function to fetch and sync from Google Sheets
  const syncFromSheet = (quiet = true) => {
    const spreadsheetId = schoolConfig.googleSpreadsheetId;
    if (!spreadsheetId) return;

    fetchFromGoogleSheet(spreadsheetId)
      .then(({ students: sheetStudents, results: sheetResults, teachers: sheetTeachers, gallery: sheetGallery, news: sheetNews, schoolConfig: sheetSchoolConfig, admissions: sheetAdmissions }) => {
        let updatedTabs: string[] = [];

        if (sheetStudents && sheetStudents.length > 0) {
          setStudents(prev => {
            const keysPrev = prev.map(p => `${p.rollNo}_${p.name}_${p.session}`).sort().join('|');
            const keysNew = sheetStudents.map(p => `${p.rollNo}_${p.name}_${p.session}`).sort().join('|');
            if (keysPrev !== keysNew) {
              updatedTabs.push('Students');
            }
            return sheetStudents.map(ss => {
              const existing = prev.find(p => p.id === ss.id || p.rollNo === ss.rollNo);
              if (existing && existing.photoUrl && existing.photoUrl.startsWith('data:image/')) {
                if (!ss.photoUrl || ss.photoUrl.startsWith('[BASE64_IMAGE:')) {
                  return { ...ss, photoUrl: existing.photoUrl };
                }
              }
              return ss;
            });
          });
        }
        if (sheetResults && sheetResults.length > 0) {
          setResults(prev => {
            const keysPrev = prev.map(p => `${p.rollNo}_${p.session}_${p.examType || 'Annual'}_${p.totalMarks}`).sort().join('|');
            const keysNew = sheetResults.map(p => `${p.rollNo}_${p.session}_${p.examType || 'Annual'}_${p.totalMarks}`).sort().join('|');
            if (keysPrev !== keysNew) {
              updatedTabs.push('Results');
            }
            return sheetResults.map(sr => {
              const existing = prev.find(p => p.id === sr.id || p.rollNo === sr.rollNo);
              if (existing && existing.photoUrl && existing.photoUrl.startsWith('data:image/')) {
                if (!sr.photoUrl || sr.photoUrl.startsWith('[BASE64_IMAGE:')) {
                  return { ...sr, photoUrl: existing.photoUrl };
                }
              }
              return sr;
            });
          });
        }
        if (sheetTeachers && sheetTeachers.length > 0) {
          setTeachers(prev => {
            const keysPrev = prev.map(p => `${p.id}_${p.name}`).sort().join('|');
            const keysNew = sheetTeachers.map(p => `${p.id}_${p.name}`).sort().join('|');
            if (keysPrev !== keysNew) {
              updatedTabs.push('Teachers');
            }
            return sheetTeachers.map(st => {
              const existing = prev.find(p => p.id === st.id);
              if (existing && existing.photoUrl && existing.photoUrl.startsWith('data:image/')) {
                if (!st.photoUrl || st.photoUrl.startsWith('[BASE64_IMAGE:')) {
                  return { ...st, photoUrl: existing.photoUrl };
                }
              }
              return st;
            });
          });
        }
        if (sheetGallery && sheetGallery.length > 0) {
          setGallery(prev => {
            const keysPrev = prev.map(p => `${p.id}`).sort().join('|');
            const keysNew = sheetGallery.map(p => `${p.id}`).sort().join('|');
            if (keysPrev !== keysNew) {
              updatedTabs.push('Gallery');
            }
            return sheetGallery.map(sg => {
              const existing = prev.find(p => p.id === sg.id);
              if (existing && existing.url && existing.url.startsWith('data:image/')) {
                if (!sg.url || sg.url.startsWith('[BASE64_IMAGE:')) {
                  return { ...sg, url: existing.url };
                }
              }
              return sg;
            });
          });
        }
        if (sheetNews && sheetNews.length > 0) {
          setNews(prev => {
            const keysPrev = prev.map(p => `${p.id}_${p.title}`).sort().join('|');
            const keysNew = sheetNews.map(p => `${p.id}_${p.title}`).sort().join('|');
            if (keysPrev !== keysNew) {
              updatedTabs.push('News Ticker');
            }
            return sheetNews;
          });
        }
        if (sheetSchoolConfig && Object.keys(sheetSchoolConfig).length > 0) {
          setSchoolConfig(prev => {
            const updatedConfig = { ...prev };
            let configChanged = false;
            Object.entries(sheetSchoolConfig).forEach(([key, val]) => {
              const existingVal = (prev as any)[key];
              if (existingVal && existingVal.startsWith('data:image/') && (!val || val.startsWith('[BASE64_IMAGE:'))) {
                return;
              }
              if (String(existingVal) !== String(val)) {
                configChanged = true;
              }
              (updatedConfig as any)[key] = val;
            });
            if (configChanged) {
              updatedTabs.push('School Information');
            }
            return updatedConfig;
          });
        }
        if (sheetAdmissions && sheetAdmissions.length > 0) {
          setAdmissions(prev => {
            const keysPrev = prev.map(p => `${p.id}_${p.status}`).sort().join('|');
            const keysNew = sheetAdmissions.map(p => `${p.id}_${p.status}`).sort().join('|');
            if (keysPrev !== keysNew) {
              updatedTabs.push('Admissions');
            }
            return sheetAdmissions.map(sa => {
              const existing = prev.find(p => p.id === sa.id);
              if (existing && existing.studentPhoto && existing.studentPhoto.startsWith('data:image/')) {
                if (!sa.studentPhoto || sa.studentPhoto.startsWith('[BASE64_IMAGE:')) {
                  return { ...sa, studentPhoto: existing.studentPhoto };
                }
              }
              return sa;
            });
          });
        }

        if (updatedTabs.length > 0) {
          console.log(`Detected changes and updated local state from Google Sheet: ${updatedTabs.join(', ')}`);
          if (!quiet) {
            triggerNotification(
              "GOOGLE SHEET LIVE UPDATE 🔄",
              `Aapki Google Sheet se badlaav automatically update ho chuke hain: ${updatedTabs.join(', ')}.`,
              "success"
            );
          }
        }
      })
      .catch(e => {
        console.error('Failed to sync live data from Google Sheet:', e);
      });
  };

  // 1. Initial Load Sync
  useEffect(() => {
    if (!loading) {
      syncFromSheet(true);
    }
  }, [schoolConfig.googleSpreadsheetId, loading]);

  // 2. Real-time Background Sync (Interval every 45 secs + Window Focus event)
  useEffect(() => {
    const spreadsheetId = schoolConfig.googleSpreadsheetId;
    if (!spreadsheetId || loading) return;

    // Periodic check handler
    const intervalId = setInterval(() => {
      syncFromSheet(true);
    }, 45000); // 45 seconds

    // Tab Focus handler (switch back to Madrasa website tab to sync instantly)
    const handleWindowFocus = () => {
      console.log('Window focused! Syncing live data from Google Sheets...');
      syncFromSheet(false);
    };

    window.addEventListener('focus', handleWindowFocus);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [schoolConfig.googleSpreadsheetId, loading]);

  // 2. Upload to Google Sheets silently whenever any database parameters change AND we have access token cached
  useEffect(() => {
    const spreadsheetId = schoolConfig.googleSpreadsheetId;
    const token = getCachedAccessToken();
    if (spreadsheetId && token && !loading) {
      const delayDebounce = setTimeout(() => {
        uploadToGoogleSheet(token, spreadsheetId, students, results, teachers, gallery, news, schoolConfig, admissions)
          .then(() => console.log('Successfully auto-synced institutional database to Google Sheet.'))
          .catch(e => console.error('Failed to auto-sync to Google Sheet:', e));
      }, 2000); // 2 seconds debounce to prevent high rate-limit hits
      return () => clearTimeout(delayDebounce);
    }
  }, [students, results, teachers, gallery, news, schoolConfig, admissions, loading]);

  // Track window scroll coordinates for Scroll-to-top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Admission application submissions callback
  const handleAdmissionSubmit = (appData: Omit<AdmissionApplication, 'id' | 'applyDate' | 'status'> & { id?: string }) => {
    const yearPrefix = appData.academicYear ? appData.academicYear.split('-')[0] : new Date().getFullYear();
    const generatedId = appData.id || (`ADM-${yearPrefix}-` + Math.floor(1000 + Math.random() * 9000));
    const newApplication: AdmissionApplication = {
      ...appData,
      id: generatedId,
      applyDate: new Date().toISOString().split('T')[0],
      status: 'pending'
    };
    setAdmissions(prev => [...prev, newApplication]);
  };

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    /* Full-screen Islamic design inspired Loading Animation */
    return (
      <div className="fixed inset-0 bg-slate-900 flex flex-col justify-center items-center gap-6 z-50">
        <div className="relative flex justify-center items-center w-24 h-24">
          {/* Ornamental rotating circle */}
          <div className="absolute w-20 h-20 border-4 border-amber-400/40 rounded-full border-t-amber-400 animate-spin-slow"></div>
          {/* Inner pulse */}
          <span className="text-4xl animate-pulse">🕌</span>
        </div>
        <div className="text-center space-y-1.5">
          <h2 className="text-xl font-bold tracking-widest text-amber-400 font-serif uppercase">
            Noorul Uloom
          </h2>
          <p className="text-[10px] font-mono tracking-widest text-emerald-450 uppercase text-emerald-400 font-bold">
            Loading Institution Ledger...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors flex flex-col justify-between font-sans selection:bg-emerald-650 selection:text-white pb-0">
      
      {/* Upper Navigation section */}
      <div>
        <Header
          config={schoolConfig}
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          isLoggedIn={isLoggedIn}
          onLogout={() => setIsLoggedIn(false)}
          news={news}
          triggerNotification={triggerNotification}
        />

        {/* Bulletins notices scrolling bar */}
        <NewsTicker news={news} config={schoolConfig} />
      </div>

      {/* Main dynamic section content area */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 w-full flex-grow">
        {currentTab === 'home' && (
          <Homepage
            config={schoolConfig}
            teachers={teachers}
            gallery={gallery}
            setCurrentTab={setCurrentTab}
            onAdmissionFormSubmit={handleAdmissionSubmit}
            triggerNotification={triggerNotification}
          />
        )}

        {currentTab === 'results' && (
          <ResultPortal results={results} triggerNotification={triggerNotification} />
        )}

        {currentTab === 'admissions' && (
          <AdmissionForm onSubmit={handleAdmissionSubmit} admissions={admissions} gallery={gallery} triggerNotification={triggerNotification} />
        )}

        {currentTab === 'duas' && (
          <DuaPortal duas={duas} />
        )}

        {currentTab === 'dashboard' && (
          <PrincipalDashboard
            students={students}
            setStudents={setStudents}
            results={results}
            setResults={setResults}
            teachers={teachers}
            setTeachers={setTeachers}
            admissions={admissions}
            setAdmissions={setAdmissions}
            gallery={gallery}
            setGallery={setGallery}
            news={news}
            setNews={setNews}
            schoolConfig={schoolConfig}
            setSchoolConfig={setSchoolConfig}
            duas={duas}
            setDuas={setDuas}
            isLoggedIn={isLoggedIn}
            setIsLoggedIn={setIsLoggedIn}
            triggerNotification={triggerNotification}
          />
        )}
      </main>

      {/* Auxiliary Status Strip: Visitor Counter display */}
      <div className="bg-emerald-950 text-emerald-400 py-2.5 text-center text-xs font-mono border-t border-emerald-900 border-dashed">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center gap-2">
          <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-amber-500 animate-pulse" /> Security Protection: Enabled</span>
          <span className="px-3 py-0.5 bg-emerald-900 border border-emerald-800 rounded-md font-bold text-amber-400">
            Visitor Counter Ledger: {visitorCount}
          </span>
        </div>
      </div>

      {/* Footer Area with marquee */}
      <Footer config={schoolConfig} onAdminClick={() => setCurrentTab('dashboard')} />

      {/* FLOATING ACTION UTILITIES */}

      {/* WhatsApp Chat Trigger Bubble */}
      <a
        href={`https://wa.me/${schoolConfig.whatsappNumber.replace(/[^0-9]/g, '')}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 left-6 z-40 p-3.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-full shadow-2xl transition-all cursor-pointer flex items-center justify-center hover:-translate-y-1 hover:scale-105"
        title="Chat on WhatsApp"
      >
        <span className="relative flex h-3 w-3 absolute -top-1 -right-1">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
        </span>
        <MessageSquare className="w-6 h-6 animate-pulse" />
      </a>

      {/* Scroll to Top Arrow Button */}
      {showScrollTop && (
        <button
          onClick={handleScrollToTop}
          className="fixed bottom-6 right-6 z-40 p-3.5 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-amber-50 rounded-full shadow-2xl transition-all cursor-pointer hover:-translate-y-1 hover:scale-105"
          title="Scroll back to top"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}

      {/* Global Interactive Notification Component */}
      {notification && (
        <InteractiveFeedback
          isOpen={notification.isOpen}
          title={notification.title}
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

    </div>
  );
}
