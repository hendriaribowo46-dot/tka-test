import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  query, 
  writeBatch,
  setDoc
} from 'firebase/firestore';
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged,
  signInWithCustomToken
} from 'firebase/auth'; 

// --- DEFINISI IKON LOKAL ---
const IconWrapper = ({ children, size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>{children}</svg>
);

const ChevronLeft = (p) => <IconWrapper {...p}><path d="m15 18-6-6 6-6"/></IconWrapper>;
const ChevronRight = (p) => <IconWrapper {...p}><path d="m9 18 6-6-6-6"/></IconWrapper>;
const Clock = (p) => <IconWrapper {...p}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></IconWrapper>;
const CheckCircle = (p) => <IconWrapper {...p}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></IconWrapper>;
const AlertCircle = (p) => <IconWrapper {...p}><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></IconWrapper>;
const FileText = (p) => <IconWrapper {...p}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><line x1="10" x2="8" y1="9" y2="9"/></IconWrapper>;
const Menu = (p) => <IconWrapper {...p}><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></IconWrapper>;
const X = (p) => <IconWrapper {...p}><path d="M18 6 6 18"/><path d="m6 6 12 12"/></IconWrapper>;
const Users = (p) => <IconWrapper {...p}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></IconWrapper>;
const Settings = (p) => <IconWrapper {...p}><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></IconWrapper>;
const Plus = (p) => <IconWrapper {...p}><path d="M5 12h14"/><path d="M12 5v14"/></IconWrapper>;
const Trash2 = (p) => <IconWrapper {...p}><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></IconWrapper>;
const Edit = (p) => <IconWrapper {...p}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></IconWrapper>;
const Save = (p) => <IconWrapper {...p}><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></IconWrapper>;
const LogOut = (p) => <IconWrapper {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></IconWrapper>;
const ArrowLeft = (p) => <IconWrapper {...p}><line x1="19" x2="5" y1="12" y2="12"/><polyline points="12 19 5 12 12 5"/></IconWrapper>;
const Sigma = (p) => <IconWrapper {...p}><path d="M18 7V4H6l7 8-7 8h12v-3"/></IconWrapper>;
const List = (p) => <IconWrapper {...p}><line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/></IconWrapper>;
const Calendar = (p) => <IconWrapper {...p}><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></IconWrapper>;
const PlayCircle = (p) => <IconWrapper {...p}><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></IconWrapper>;
const StopCircle = (p) => <IconWrapper {...p}><circle cx="12" cy="12" r="10"/><rect width="6" height="6" x="9" y="9"/></IconWrapper>;
const User = (p) => <IconWrapper {...p}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></IconWrapper>;
const Key = (p) => <IconWrapper {...p}><circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6"/><path d="m15.5 7.5 3 3L22 7l-3-3"/></IconWrapper>;
const Upload = (p) => <IconWrapper {...p}><path d="M21 15v4a2 2 0 0 1-2-2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></IconWrapper>;
const Activity = (p) => <IconWrapper {...p}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></IconWrapper>;
const Printer = (p) => <IconWrapper {...p}><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></IconWrapper>;
const Database = (p) => <IconWrapper {...p}><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></IconWrapper>;
const UserPlus = (p) => <IconWrapper {...p}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/></IconWrapper>;
const Maximize = (p) => <IconWrapper {...p}><path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/></IconWrapper>;
const Filter = (p) => <IconWrapper {...p}><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></IconWrapper>;
const ClipboardList = (p) => <IconWrapper {...p}><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M9 12h6"/><path d="M9 16h6"/></IconWrapper>;
const PenTool = (p) => <IconWrapper {...p}><path d="m12 19 7-7 3 3-7 7-3-3z"/><path d="m18 13-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="m2 2 7.586 7.586"/><circle cx="11" cy="11" r="2"/></IconWrapper>;
const UsersCog = (p) => <IconWrapper {...p}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><circle cx="19" cy="11" r="2"/><path d="M19 8v1"/><path d="M19 13v1"/></IconWrapper>;
const ArrowUpDown = (p) => <IconWrapper {...p}><path d="m7 15 5 5 5-5"/><path d="m7 9 5-5 5 5"/></IconWrapper>;
const School = (p) => <IconWrapper {...p}><path d="m4 6 8-4 8 4"/><path d="m18 10 4 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-8l4-2"/><path d="M14 22v-4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v4"/><path d="M18 5v17"/><path d="M6 5v17"/></IconWrapper>;
const Clock3 = (p) => <IconWrapper {...p}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 4.5 9"/></IconWrapper>;
const StopHand = (p) => <IconWrapper {...p}><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/></IconWrapper>;
const Building = (p) => <IconWrapper {...p}><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></IconWrapper>;
const Tag = (p) => <IconWrapper {...p}><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" x2="7.01" y1="7" y2="7"/></IconWrapper>;
const Book = (p) => <IconWrapper {...p}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></IconWrapper>;

// --- KONFIGURASI FIREBASE ---
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {
  apiKey: "AIzaSyBSffScL6JuDPtrJJ7aKrUxdOCRoyX7aBg",
  authDomain: "si-mase.firebaseapp.com",
  projectId: "si-mase",
  storageBucket: "si-mase.firebasestorage.app",
  messagingSenderId: "620270328510",
  appId: "1:620270328510:web:f0e18b1ad1817a1eaa1cef",
  measurementId: "G-KVC45P33S5"
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app); 

const APP_ID = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

const getCollectionRef = (name) => {
  return collection(db, 'artifacts', APP_ID, 'public', 'data', name);
};

const getDocRef = (colName, docId) => {
  return doc(db, 'artifacts', APP_ID, 'public', 'data', colName, docId);
};

// --- STYLES CETAK ---
const PrintStyles = () => (
  <style>{`
    @media print {
      @page { margin: 2cm; size: A4; }
      body { background: white !important; color: black !important; }
      .no-print, nav, header, footer, button { display: none !important; }
      .print-container { width: 100% !important; max-width: none !important; padding: 0 !important; margin: 0 !important; box-shadow: none !important; border: none !important; }
      .print-card { box-shadow: none !important; border: 1px solid #ccc !important; break-inside: avoid; }
      table { width: 100% !important; border-collapse: collapse !important; font-size: 12px; }
      th, td { border: 1px solid #000 !important; padding: 8px !important; color: black !important; }
      thead { background-color: #f0f0f0 !important; -webkit-print-color-adjust: exact; }
      .text-2xl { font-size: 18px !important; }
      .print-header { display: block !important; text-align: center; margin-bottom: 20px; border-bottom: 2px solid black; padding-bottom: 10px; }
      .print-header h1 { font-size: 24px; font-weight: bold; margin: 0; }
      .print-header p { margin: 5px 0 0; font-size: 14px; }
      .print-footer { display: block !important; margin-top: 40px; page-break-inside: avoid; }
    }
    .print-header { display: none; }
    .print-footer { display: none; }
  `}</style>
);

// --- UTILS: FULL SCREEN HELPER ---
const toggleFullScreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(err => {
      console.log(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
    });
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }
};

// --- UTILS: GOOGLE DRIVE IMAGE FIXER ---
const getOptimizedImageUrl = (url) => {
  if (!url) return '';
  try {
    if (url.indexOf('drive.google.com') !== -1) {
      let match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
      if (!match) match = url.match(/id=([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        return `https://drive.google.com/uc?export=view&id=${match[1]}`;
      }
    }
  } catch (e) {
    console.error("Error parsing image URL:", e);
  }
  return url;
};

// --- UTILS: AUTO INJECT TAILWIND CSS ---
const useTailwind = () => {
  useEffect(() => {
    if (document.getElementById('tailwind-cdn')) return;
    const script = document.createElement('script');
    script.id = 'tailwind-cdn';
    script.src = "https://cdn.tailwindcss.com";
    script.async = true;
    document.head.appendChild(script);
    const link = document.createElement('link');
    link.href = "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    document.body.style.fontFamily = "'Inter', sans-serif";
    document.body.style.touchAction = "manipulation"; 
  }, []);
};

// --- UTILS: KATEX & FORMATTER ---
const useKatex = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => {
    if (window.katex) { setIsLoaded(true); return; }
    const link = document.createElement('link');
    link.href = "https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    const script = document.createElement('script');
    script.src = "https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js";
    script.async = true;
    script.onload = () => { window.katexLoaded = true; setIsLoaded(true); };
    document.head.appendChild(script);
  }, []);
  return isLoaded;
};

const FormattedText = ({ text, className = "" }) => {
  const isKatexLoaded = useKatex();
  const containerRef = useRef(null);
  const safeText = typeof text === 'string' ? text : String(text || '');
  useEffect(() => {
    if (!containerRef.current || !isKatexLoaded || !window.katex) return;
    const regex = /\$\$([\s\S]*?)\$\$|\$((?:\\.|[^$])*?)\$/g;
    let lastIndex = 0; let match; let html = '';
    while ((match = regex.exec(safeText)) !== null) {
      html += safeText.slice(lastIndex, match.index).replace(/\n/g, '<br/>');
      const latex = match[1] || match[2];
      try { html += window.katex.renderToString(latex, { displayMode: !!match[1], throwOnError: false }); } catch (e) { html += latex; }
      lastIndex = regex.lastIndex;
    }
    html += safeText.slice(lastIndex).replace(/\n/g, '<br/>');
    containerRef.current.innerHTML = html;
  }, [safeText, isKatexLoaded]);
  return <div ref={containerRef} className={className}>{safeText}</div>;
};

// --- UTILS: SHUFFLE ---
const shuffleArray = (array) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

// --- DATA SEEDING ---
const SEED_DATA = {
  questions: [
    {
      id: "q1", type: 'single', category: 'Literasi Membaca', subject: 'Bahasa Indonesia', classLevel: 'X',
      stimulus: { title: 'Lebah dan Bunga', image: '', content: `Di sebuah taman yang indah, hiduplah seekor lebah bernama Biba. Biba sangat rajin mengumpulkan nektar dari bunga-bunga yang bermekaran. Suatu hari, Biba bertemu dengan seekor kupu-kupu yang sedang bersedih karena sayapnya terluka.\n\n"Mengapa kau menangis, teman?" tanya Biba.\n"Sayapku tersangkut ranting, aku tidak bisa terbang pulang," jawab kupu-kupu.\n\nTanpa berpikir panjang, Biba membantu melepaskan sayap kupu-kupu itu dengan hati-hati.` },
      question: "Apa sifat utama yang dimiliki oleh Biba berdasarkan cerita tersebut?",
      options: [{ id: 'A', text: 'Pemalas dan sombong' }, { id: 'B', text: 'Penolong dan rajin' }, { id: 'C', text: 'Penakut dan pemalu' }, { id: 'D', text: 'Cerdik tapi licik' }],
      correctAnswer: ['B']
    },
    {
      id: "q2", type: 'multiple', category: 'Numerasi', subject: 'Matematika', classLevel: 'X',
      stimulus: { title: 'Belanja Buah', image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&q=80&w=1000', content: `Ibu pergi ke pasar untuk membeli buah-buahan. Perhatikan gambar ilustrasi pasar buah di atas.\n\nBerikut adalah daftar harga buah per kilogram:\n- Apel: Rp 25.000\n- Jeruk: Rp 15.000\n- Mangga: Rp 20.000\n- Anggur: Rp 40.000\n\nIbu membawa uang sebesar Rp 100.000.` },
      question: "Manakah pernyataan yang BENAR? (Pilih lebih dari satu jawaban)",
      options: [{ id: 'A', text: 'Harga 2 kg Jeruk lebih murah daripada 1 kg Anggur.' }, { id: 'B', text: 'Dengan uang Rp 50.000, Ibu bisa membeli 1 kg Apel dan 1 kg Mangga.' }, { id: 'C', text: 'Harga 1 kg Apel sama dengan harga 2 kg Jeruk.' }, { id: 'D', text: 'Jika Ibu membeli 1 kg Anggur dan 2 kg Mangga, uangnya masih sisa.' }],
      correctAnswer: ['A', 'B']
    },
    {
      id: "q3", type: 'true_false', category: 'Literasi Sains', subject: 'IPA', classLevel: 'XI',
      stimulus: { title: 'Tata Surya', image: '', content: 'Bumi adalah planet ketiga dari matahari dalam sistem tata surya kita. Bumi memiliki satu satelit alami yaitu Bulan.' },
      question: 'Tentukan apakah pernyataan berikut Benar atau Salah!',
      trueFalseStatements: [
        { id: 's1', text: 'Bumi mengelilingi Matahari.', correct: true },
        { id: 's2', text: 'Matahari adalah sebuah planet.', correct: false },
        { id: 's3', text: 'Bulan adalah satelit alami Bumi.', correct: true }
      ]
    }
  ],
  students: [
    { id: "s1", name: 'Siswa Contoh', username: 'siswa', password: '123', class: 'XII-A', session: '1' }
  ],
  exams: [
    {
      id: "e1", title: 'Simulasi ANBK Lengkap', examCode: 'SIMULASI1', duration: 30,
      questionIds: ["q1", "q2", "q3"], randomizeQuestions: false, randomizeOptions: false, isActive: true, allowedSessions: ['1'], maxAttempts: 1
    }
  ],
  admins: [
    { id: "a1", name: "Administrator", username: "admin", password: "admin123" } 
  ],
  contributors: [
    { id: "c1", name: "Guru Soal", username: "guru", password: "123" }
  ],
  principals: [
    { id: "ks1", name: "Kepala Sekolah", username: "ks", password: "123" }
  ]
};

// --- HOOKS FIREBASE ---
const useFirestoreCollection = (collectionName, firebaseUser) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firebaseUser) return;
    const q = query(getCollectionRef(collectionName));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setData(items);
      setLoading(false);
    }, (error) => {
      console.error(`Error fetching ${collectionName}:`, error);
      setLoading(false);
    });
    return unsubscribe;
  }, [collectionName, firebaseUser]);
  return { data, loading };
};

// --- KOMPONEN QUESTION EDITOR ---
const QuestionEditor = ({ qForm, setQForm, onSave, onCancel, metadata, uniqueSubjects, uniqueCategories, allClassesMaster }) => {
  
  const handleAddTFStatement = () => {
    setQForm(prev => ({
      ...prev,
      trueFalseStatements: [...(prev.trueFalseStatements || []), { id: Date.now().toString(), text: '', correct: true }]
    }));
  };

  const handleUpdateTFStatement = (idx, field, value) => {
    setQForm(prev => {
      const newSt = [...(prev.trueFalseStatements || [])];
      newSt[idx] = { ...newSt[idx], [field]: value };
      return { ...prev, trueFalseStatements: newSt };
    });
  };

  const handleDeleteTFStatement = (idx) => {
    setQForm(prev => ({ ...prev, trueFalseStatements: prev.trueFalseStatements.filter((_, i) => i !== idx) }));
  };

  // Menggabungkan data master dan data kategori/mapel yang sudah ada sebelumnya di soal (serta memfilter 'Semua')
  const allSubjects = [...new Set([...(metadata?.subjects || []), ...(uniqueSubjects || []), qForm.subject])].filter(s => s && s !== 'Semua');
  const allCategories = [...new Set([...(metadata?.categories || []), ...(uniqueCategories || []), qForm.category])].filter(c => c && c !== 'Semua');
  const allClasses = [...new Set([...(metadata?.classes || []), ...(allClassesMaster || []), qForm.classLevel])].filter(c => c && c !== 'Semua');

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-800">{qForm.id ? 'Edit Soal' : 'Buat Soal Baru'}</h3>
        <button onClick={onCancel}><X className="text-gray-500 hover:text-gray-700"/></button>
      </div>
      <div className="bg-blue-50 p-4 rounded-md mb-6 border border-blue-200 text-sm text-blue-800 flex items-center">
        <Sigma className="w-4 h-4 mr-2"/> <span>Gunakan <code>$x^2$</code> untuk rumus inline dan <code>{'$$x=y$$'}</code> untuk blok.</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-2">
            <div className="w-full md:w-1/4">
              <select 
                value={qForm.classLevel || ''} 
                onChange={e => setQForm(prev => ({...prev, classLevel: e.target.value}))} 
                className="w-full p-2 border rounded bg-white"
              >
                <option value="" disabled>Pilih Kelas</option>
                {allClasses.map(c => <option key={`qcls-${c}`} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="w-full md:w-1/4">
              <select 
                value={qForm.subject || ''} 
                onChange={e => setQForm(prev => ({...prev, subject: e.target.value}))} 
                className="w-full p-2 border rounded bg-white"
              >
                <option value="" disabled>Pilih Mapel</option>
                {allSubjects.map(s => <option key={`sub-${s}`} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="w-full md:w-1/4">
              <select 
                value={qForm.category || ''} 
                onChange={e => setQForm(prev => ({...prev, category: e.target.value}))} 
                className="w-full p-2 border rounded bg-white"
              >
                <option value="" disabled>Pilih Kategori</option>
                {allCategories.map(c => <option key={`cat-${c}`} value={c}>{c}</option>)}
              </select>
            </div>
            <select 
              value={qForm.type} 
              onChange={e => setQForm(prev => ({...prev, type: e.target.value}))} 
              className="w-full md:w-1/4 p-2 border rounded"
            >
              <option value="single">Pilihan Ganda</option>
              <option value="multiple">PG Kompleks</option>
              <option value="true_false">Benar / Salah</option>
            </select>
          </div>
          <input 
            value={qForm.stimulus.title} 
            onChange={e => setQForm(prev => ({...prev, stimulus: {...prev.stimulus, title: e.target.value}}))} 
            className="w-full p-2 border rounded" 
            placeholder="Judul Stimulus"
          />
          <input 
            value={qForm.stimulus.image || ''} 
            onChange={e => setQForm(prev => ({...prev, stimulus: {...prev.stimulus, image: e.target.value}}))} 
            className="w-full p-2 border rounded text-sm" 
            placeholder="URL Gambar (Opsional)"
          />
          <textarea 
            value={qForm.stimulus.content} 
            onChange={e => setQForm(prev => ({...prev, stimulus: {...prev.stimulus, content: e.target.value}}))} 
            className="w-full p-2 border rounded h-32 font-mono text-sm" 
            placeholder="Isi bacaan..."
          />
        </div>
        <div className="space-y-4">
          <textarea 
            value={qForm.question} 
            onChange={e => setQForm(prev => ({...prev, question: e.target.value}))} 
            className="w-full p-2 border rounded h-24" 
            placeholder="Pertanyaan..."
          />
          
          {(qForm.type === 'single' || qForm.type === 'multiple') && (
            <div className="bg-gray-50 p-4 rounded border">
              <h4 className="font-bold text-sm mb-3 text-gray-500 uppercase">Opsi Jawaban</h4>
              {(qForm.options || []).map((opt, idx) => (
                <div key={idx} className="flex items-center mb-2">
                  <span className="w-8 font-bold text-gray-500">{opt.id}.</span>
                  <input 
                    value={opt.text} 
                    onChange={e => {
                      const val = e.target.value;
                      setQForm(prev => {
                        const newOptions = [...(prev.options || [])];
                        newOptions[idx] = { ...newOptions[idx], text: val };
                        return { ...prev, options: newOptions };
                      });
                    }} 
                    className="flex-1 p-2 border rounded mr-2" 
                    placeholder={`Opsi ${opt.id}`}
                  />
                  <input 
                    type={qForm.type === 'single' ? 'radio' : 'checkbox'} 
                    checked={(qForm.correctAnswer || []).includes(opt.id)} 
                    onChange={() => {
                      setQForm(prev => {
                        let nc;
                        const prevCorrect = prev.correctAnswer || [];
                        if (prev.type === 'single') nc = [opt.id];
                        else nc = prevCorrect.includes(opt.id) ? prevCorrect.filter(c => c !== opt.id) : [...prevCorrect, opt.id];
                        return { ...prev, correctAnswer: nc };
                      });
                    }} 
                    className="w-5 h-5 accent-green-600 cursor-pointer"
                  />
                </div>
              ))}
            </div>
          )}

          {qForm.type === 'true_false' && (
            <div className="bg-gray-50 p-4 rounded border">
              <h4 className="font-bold text-sm mb-3 text-gray-500 uppercase">Pernyataan Benar / Salah</h4>
              <div className="space-y-2">
                 {(qForm.trueFalseStatements || []).map((st, idx) => (
                  <div key={idx} className="flex gap-2 items-center bg-white p-2 border rounded">
                     <textarea 
                        className="flex-1 p-1 text-sm border-none outline-none resize-none h-10" 
                        placeholder="Pernyataan..." 
                        value={st.text} 
                        onChange={e => handleUpdateTFStatement(idx, 'text', e.target.value)}
                     />
                     <div className="flex items-center gap-1 bg-gray-100 p-1 rounded">
                        <button onClick={() => handleUpdateTFStatement(idx, 'correct', true)} className={`px-2 py-1 text-xs rounded font-bold ${st.correct ? 'bg-green-500 text-white' : 'text-gray-500'}`}>Benar</button>
                        <button onClick={() => handleUpdateTFStatement(idx, 'correct', false)} className={`px-2 py-1 text-xs rounded font-bold ${!st.correct ? 'bg-red-500 text-white' : 'text-gray-500'}`}>Salah</button>
                     </div>
                     <button onClick={() => handleDeleteTFStatement(idx)} className="text-red-500 hover:bg-red-50 p-1 rounded"><X size={16}/></button>
                  </div>
                 ))}
                 <button onClick={handleAddTFStatement} className="mt-2 text-sm text-blue-600 font-bold flex items-center hover:underline"><Plus size={14} className="mr-1"/> Tambah Pernyataan</button>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-3 pt-4 border-t">
        <button onClick={onCancel} className="px-4 py-2 text-gray-600 border rounded">Batal</button>
        <button onClick={onSave} className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center font-medium">
          <Save className="w-4 h-4 mr-2" /> Simpan
        </button>
      </div>
    </div>
  );
};

// --- HISTORY VIEW ---
const HistoryView = ({ results, exams, students, identity }) => {
  const [filterExam, setFilterExam] = useState('all');
  const [filterClass, setFilterClass] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: 'timestamp', direction: 'desc' });

  // Ambil daftar kelas unik dari results (karena result menyimpan snapshot kelas siswa)
  const uniqueClasses = ['all', ...new Set(results.map(r => r.studentClass || '-').filter(c => c !== '-'))].sort();

  // 1. Filter
  let processed = results;
  if (filterExam !== 'all') processed = processed.filter(r => r.examId === filterExam);
  if (filterClass !== 'all') processed = processed.filter(r => r.studentClass === filterClass);

  // 2. Sort
  processed.sort((a, b) => {
    let valA, valB;
    if (sortConfig.key === 'score') {
      valA = a.score || 0;
      valB = b.score || 0;
    } else if (sortConfig.key === 'timestamp') {
      valA = new Date(a.timestamp || 0).getTime();
      valB = new Date(b.timestamp || 0).getTime();
    } else if (sortConfig.key === 'name') {
      valA = (getStudentName(a) || '').toLowerCase();
      valB = (getStudentName(b) || '').toLowerCase();
    }
    
    if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
    if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const requestSort = (key) => {
    let direction = 'desc'; // Default desc untuk nilai/waktu
    if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key, direction });
  };

  function getExamTitle(examId) {
    const ex = exams.find(e => e.id === examId);
    return ex ? `${ex.title} (${ex.examCode || '-'})` : 'Ujian Dihapus';
  }

  function getStudentName(res) {
    if (res.studentName) return res.studentName;
    const st = students.find(s => s.id === res.studentId);
    return st ? st.name : 'Siswa Dihapus';
  }

  const handleDeleteResult = async (id) => {
    if (confirm("Hapus data riwayat ini secara permanen?")) {
      await deleteDoc(getDocRef('results', id));
    }
  };

  return (
    <div className="space-y-6 print-container">
       <div className="print-header">
           <h1 className="uppercase tracking-widest">{identity?.namaSekolah || 'NAMA SEKOLAH'}</h1>
           <p className="text-sm border-b-2 border-black pb-2 mb-2">{identity?.alamat || 'Alamat Sekolah'} | Tahun Pelajaran {identity?.tahunPelajaran || '-'} - {identity?.semester || '-'}</p>
           <h2 className="text-xl font-bold mt-4">RIWAYAT HASIL UJIAN</h2>
           <p>Dicetak pada: {new Date().toLocaleDateString('id-ID')}</p>
       </div>
       
       <div className="flex flex-col md:flex-row justify-between items-center no-print gap-4">
         <div>
            <h2 className="text-2xl font-bold">Riwayat Hasil</h2>
            <p className="text-gray-500 text-sm">Arsip semua pengerjaan siswa.</p>
         </div>
         <div className="flex flex-wrap gap-2">
            <select className="border p-2 rounded text-sm" value={filterClass} onChange={e => setFilterClass(e.target.value)}>
               <option value="all">Semua Kelas</option>
               {uniqueClasses.filter(c => c !== 'all').map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select className="border p-2 rounded text-sm" value={filterExam} onChange={e => setFilterExam(e.target.value)}>
               <option value="all">Semua Paket Ujian</option>
               {exams.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
            </select>
            <button onClick={() => window.print()} className="flex items-center bg-gray-800 text-white px-4 py-2 rounded shadow-sm text-sm">
                <Printer size={16} className="mr-2"/> Cetak
            </button>
         </div>
       </div>

       <div className="bg-white rounded-lg shadow overflow-hidden border print-card overflow-x-auto">
         <table className="w-full text-left text-sm min-w-[700px]">
           <thead className="bg-gray-50 text-gray-700 font-bold border-b select-none">
             <tr>
               <th className="p-4 cursor-pointer hover:bg-gray-100" onClick={() => requestSort('timestamp')}>
                   Waktu {sortConfig.key === 'timestamp' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
               </th>
               <th className="p-4 cursor-pointer hover:bg-gray-100" onClick={() => requestSort('name')}>
                   Siswa {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
               </th>
               <th className="p-4">Kelas</th>
               <th className="p-4">Paket Ujian</th>
               <th className="p-4 text-center">Status</th>
               <th className="p-4 text-center cursor-pointer hover:bg-gray-100" onClick={() => requestSort('score')}>
                   Nilai {sortConfig.key === 'score' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
               </th>
               <th className="p-4 text-center no-print">Aksi</th>
             </tr>
           </thead>
           <tbody className="divide-y">
             {processed.map(res => (
               <tr key={res.id} className="hover:bg-gray-50">
                 <td className="p-4 text-gray-500">
                    {res.timestamp ? new Date(res.timestamp).toLocaleString() : '-'}
                 </td>
                 <td className="p-4 font-medium">{getStudentName(res)}</td>
                 <td className="p-4">{res.studentClass || '-'}</td>
                 <td className="p-4"><span className="px-2 py-1 bg-gray-100 rounded text-xs border">{getExamTitle(res.examId)}</span></td>
                 <td className="p-4 text-center">
                    {res.status === 'finished' 
                      ? <span className="text-green-600 bg-green-50 px-2 py-1 rounded text-xs font-bold">Selesai</span> 
                      : <span className="text-blue-600 bg-blue-50 px-2 py-1 rounded text-xs font-bold">Proses</span>}
                 </td>
                 <td className="p-4 text-center font-bold text-lg">
                    {res.score !== undefined ? res.score.toFixed(1) : '-'}
                 </td>
                 <td className="p-4 text-center no-print">
                    <button onClick={() => handleDeleteResult(res.id)} className="text-red-500 p-2 hover:bg-red-50 rounded"><Trash2 size={16}/></button>
                 </td>
               </tr>
             ))}
             {processed.length === 0 && (
               <tr><td colSpan="7" className="p-8 text-center text-gray-400">Data tidak ditemukan.</td></tr>
             )}
           </tbody>
         </table>
       </div>

       <div className="print-footer w-full pt-8">
         <div className="float-right text-center w-64">
            <p>....................., {new Date().toLocaleDateString('id-ID')}</p>
            <p>Kepala Sekolah</p>
            <br/><br/><br/><br/>
            <p className="font-bold underline">{identity?.kepalaSekolah || '________________________'}</p>
            <p>NIP. {identity?.nip || '_________________'}</p>
         </div>
         <div className="clear-both"></div>
       </div>
    </div>
  );
};

const MonitoringView = ({ exams, results, students, identity }) => {
    const activeExams = exams.filter(e => e.isActive);
    const [selectedExamId, setSelectedExamId] = useState('');

    useEffect(() => {
        if (activeExams.length > 0 && !selectedExamId) {
            setSelectedExamId(activeExams[0].id);
        } else if (activeExams.length > 0 && selectedExamId) {
            // Pastikan yang terpilih masih aktif
            if (!activeExams.find(e => e.id === selectedExamId)) {
                setSelectedExamId(activeExams[0].id);
            }
        }
    }, [activeExams, selectedExamId]);

    const activeExam = exams.find(e => e.id === selectedExamId);

    const [filterClass, setFilterClass] = useState('all');
    const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
    const date = new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    if (activeExams.length === 0) return <div className="p-10 text-center text-gray-500">Tidak ada ujian yang sedang aktif.</div>;
    if (!activeExam) return null;

    const currentResults = results.filter(r => r.examId === activeExam.id);

    // Ambil kelas unik dari siswa
    const uniqueClasses = ['all', ...new Set(students.map(s => s.class || '-').filter(c => c !== '-'))].sort();

    // Gabungkan data siswa dan hasil untuk sorting/filtering
    const monitoredData = students.map(s => {
        const res = currentResults.find(r => r.studentId === s.id);
        return {
            ...s,
            status: res ? res.status : 'not_started',
            score: res && res.score !== undefined ? res.score : -1, // -1 agar bisa sort yg belum ada nilai
            answeredCount: res ? res.answeredCount : 0,
            resultId: res ? res.id : null
        };
    });

    // 1. Filter
    const filteredData = filterClass === 'all' 
        ? monitoredData 
        : monitoredData.filter(d => d.class === filterClass);

    // 2. Sort
    const sortedData = [...filteredData].sort((a, b) => {
        let valA, valB;

        if (sortConfig.key === 'name') {
            valA = (a.name || '').toLowerCase();
            valB = (b.name || '').toLowerCase();
        } else if (sortConfig.key === 'status') {
            // Urutan prioritas: finished > ongoing > not_started
            const statusPriority = { 'finished': 3, 'ongoing': 2, 'not_started': 1 };
            valA = statusPriority[a.status] || 0;
            valB = statusPriority[b.status] || 0;
        } else if (sortConfig.key === 'score') {
            valA = a.score;
            valB = b.score;
        }

        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });

    const requestSort = (key) => {
        let direction = 'asc';
        // Default desc untuk status dan nilai agar yg selesai/tinggi di atas
        if ((key === 'status' || key === 'score') && sortConfig.key !== key) direction = 'desc';
        else if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
        else if (sortConfig.key === key && sortConfig.direction === 'desc') direction = 'asc';
        
        setSortConfig({ key, direction });
    };

    const handleReset = async (resultId) => {
        if (window.confirm("Reset progres siswa ini?")) {
          await deleteDoc(getDocRef('results', resultId));
        }
    };

    return (
      <div className="space-y-6 print-container">
        <div className="print-header">
            <h1 className="uppercase tracking-widest">{identity?.namaSekolah || 'NAMA SEKOLAH'}</h1>
            <p className="text-sm border-b-2 border-black pb-2 mb-2">{identity?.alamat || 'Alamat Sekolah'} | Tahun Pelajaran {identity?.tahunPelajaran || '-'} - {identity?.semester || '-'}</p>
            <h2 className="text-xl font-bold mt-4">LAPORAN HASIL UJIAN</h2>
            <p>{activeExam.title} (Kode: {activeExam.examCode || '-'})</p>
            <p>Tanggal: {date}</p>
        </div>
        <div className="flex justify-between items-center no-print">
           <div>
              <h2 className="text-2xl font-bold">Pemantauan</h2>
              <div className="flex items-center gap-2 mt-2">
                 <span className="text-gray-500 text-sm">Ujian Aktif: </span>
                 <select className="border p-1.5 rounded text-sm font-bold bg-white text-blue-600 focus:ring focus:outline-none" value={selectedExamId} onChange={e => setSelectedExamId(e.target.value)}>
                     {activeExams.map(e => <option key={e.id} value={e.id}>{e.title} (Kode: {e.examCode || '-'})</option>)}
                 </select>
              </div>
           </div>
           <div className="flex gap-2">
               <select className="border p-2 rounded text-sm" value={filterClass} onChange={e => setFilterClass(e.target.value)}>
                   <option value="all">Semua Kelas</option>
                   {uniqueClasses.filter(c => c !== 'all').map(c => <option key={c} value={c}>{c}</option>)}
               </select>
               <button onClick={() => window.print()} className="flex items-center bg-gray-800 text-white px-4 py-2 rounded shadow-sm"><Printer size={16} className="mr-2"/> Cetak</button>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 print-container">
           <div className="bg-white p-4 rounded-lg shadow border-l-4 border-gray-300 print-card"><div className="text-gray-500 text-sm">Total Peserta</div><div className="text-2xl font-bold">{students.length}</div></div>
           <div className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500 print-card"><div className="text-gray-500 text-sm">Sedang Mengerjakan</div><div className="text-2xl font-bold text-blue-600">{currentResults.filter(r => r.status === 'ongoing').length}</div></div>
           <div className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500 print-card"><div className="text-gray-500 text-sm">Selesai</div><div className="text-2xl font-bold text-green-600">{currentResults.filter(r => r.status === 'finished').length}</div></div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden border print-container print-card overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[600px]">
            <thead className="bg-gray-50 text-gray-700 font-bold border-b select-none">
                <tr>
                    <th className="p-4 cursor-pointer hover:bg-gray-100" onClick={() => requestSort('name')}>
                        Nama Siswa {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="p-4 cursor-pointer hover:bg-gray-100" onClick={() => requestSort('status')}>
                        Status {sortConfig.key === 'status' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="p-4 w-1/3 no-print">Progres</th>
                    <th className="p-4 text-center cursor-pointer hover:bg-gray-100" onClick={() => requestSort('score')}>
                        Nilai {sortConfig.key === 'score' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="p-4 text-center no-print">Aksi</th>
                </tr>
            </thead>
            <tbody className="divide-y">
              {sortedData.map(s => {
                const total = (activeExam.questionIds || []).length; 
                const percent = total > 0 ? (s.answeredCount / total) * 100 : 0;
                
                return (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="p-4 font-medium">{s.name} <br/><span className="text-xs text-gray-400 no-print">{s.username} - {s.class || 'Tanpa Kelas'} - <strong>Sesi {s.session || '1'}</strong></span></td>
                    <td className="p-4">
                      {s.status === 'not_started' && <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">Belum Login</span>}
                      {s.status === 'ongoing' && <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded text-xs">Mengerjakan...</span>}
                      {s.status === 'finished' && <span className="px-2 py-1 bg-green-100 text-green-600 rounded text-xs font-bold">Selesai</span>}
                    </td>
                    <td className="p-4 no-print"><div className="flex items-center gap-2"><div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden border border-gray-300"><div className={`h-full rounded-full transition-all duration-500 ${s.status === 'finished' ? 'bg-green-500' : 'bg-blue-500'}`} style={{ width: `${percent}%` }}></div></div><span className="text-xs font-mono">{s.answeredCount}/{total}</span></div></td>
                    <td className="p-4 text-center">{s.status === 'finished' && s.score >= 0 ? <span className="font-bold text-lg text-gray-800">{s.score.toFixed(1)}</span> : <span className="text-gray-400">-</span>}</td>
                    <td className="p-4 text-center no-print">{s.resultId && <button onClick={() => handleReset(s.resultId)} className="text-red-600 hover:bg-red-50 px-2 py-1 rounded text-xs border border-red-200">Reset</button>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="print-footer w-full pt-8">
         <div className="float-right text-center w-64">
            <p>....................., {date}</p>
            <p>Kepala Sekolah</p>
            <br/><br/><br/><br/>
            <p className="font-bold underline">{identity?.kepalaSekolah || '________________________'}</p>
            <p>NIP. {identity?.nip || '_________________'}</p>
         </div>
         <div className="clear-both"></div>
        </div>
      </div>
    );
};

// --- LOGIN SCREEN ---
const LoginScreen = ({ onLogin, students, admins, contributors, principals, loading, isAuthReady }) => {
  const [view, setView] = useState('select');
  const [role, setRole] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false); 
  const [formData, setFormData] = useState({ name: '', username: '', password: '' });
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
    setView('form');
    setIsRegistering(false);
    setError('');
    setSuccessMsg('');
    setFormData({ name: '', username: '', password: '' });
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (loading || !isAuthReady) return;
    setError('');
    setSuccessMsg('');

    if (role === 'student') {
        const student = students.find(s => s.username === formData.username && s.password === formData.password);
        if (student) {
            if (student.isActive === false) {
                setError('Akun Anda sedang dinonaktifkan. Silakan hubungi proktor.');
                return;
            }
            toggleFullScreen();
            onLogin('student', student);
        } else {
            setError('Username atau Password salah!');
        }
    } else if (role === 'admin') {
      if (isRegistering) {
        if (!formData.name || !formData.username || !formData.password) {
          setError("Semua kolom wajib diisi.");
          return;
        }
        const exists = admins.find(a => a.username === formData.username);
        if (exists) {
          setError("Username sudah digunakan.");
          return;
        }

        try {
          await addDoc(getCollectionRef('admins'), {
            name: formData.name,
            username: formData.username,
            password: formData.password
          });
          setSuccessMsg("Akun berhasil dibuat! Silakan login.");
          setIsRegistering(false); 
          setFormData({ name: '', username: '', password: '' });
        } catch (err) {
          setError("Gagal membuat akun: " + err.message);
        }

      } else {
        const admin = admins.find(a => a.username === formData.username && a.password === formData.password);
        if (admin) onLogin('admin', admin);
        else setError('Username atau Password salah!');
      }
    } else if (role === 'contributor') {
        const contrib = contributors.find(c => c.username === formData.username && c.password === formData.password);
        if (contrib) onLogin('contributor', contrib);
        else setError('Username atau Password salah!');
    } else if (role === 'principal') {
        const principal = principals.find(p => p.username === formData.username && p.password === formData.password);
        if (principal) onLogin('principal', principal);
        else setError('Username atau Password salah!');
    }
  };

  // Handler untuk menekan tombol enter
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-gray-900 flex items-center justify-center p-4 font-sans">
      <button 
        onClick={toggleFullScreen}
        className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-all"
        title="Toggle Fullscreen"
      >
        <Maximize size={24} />
      </button>

      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center relative">
        {view === 'form' && (
          <button onClick={() => setView('select')} className="absolute top-4 left-4 text-gray-400 hover:text-gray-600">
            <ArrowLeft size={24} />
          </button>
        )}
        
        <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
          <FileText className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Portal Ujian</h1>
        <p className="text-sm text-gray-400 mb-6">
          {!isAuthReady ? "Menghubungkan ke server..." : "Siap digunakan"}
        </p>
        
        {view === 'select' ? (
          <>
            <p className="text-gray-500 mb-8">Silakan pilih peran Anda</p>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => handleRoleSelect('student')} disabled={loading || !isAuthReady} className="p-4 bg-white border-2 border-blue-100 hover:border-blue-500 rounded-xl flex flex-col items-center transition-all hover:shadow-md disabled:opacity-50 col-span-2">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-2"><Users className="text-blue-600"/></div>
                <h3 className="font-bold text-sm">Siswa</h3><p className="text-xs text-gray-500">Login Ujian</p>
              </button>
              
              <button onClick={() => handleRoleSelect('contributor')} disabled={!isAuthReady} className="p-4 bg-white border-2 border-orange-100 hover:border-orange-500 rounded-xl flex flex-col items-center transition-all hover:shadow-md disabled:opacity-50">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mb-2"><PenTool className="text-orange-600"/></div>
                <h3 className="font-bold text-sm">Kontributor</h3><p className="text-xs text-gray-500">Pembuat Soal</p>
              </button>

              <button onClick={() => handleRoleSelect('principal')} disabled={!isAuthReady} className="p-4 bg-white border-2 border-green-100 hover:border-green-500 rounded-xl flex flex-col items-center transition-all hover:shadow-md disabled:opacity-50">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mb-2"><School className="text-green-600"/></div>
                <h3 className="font-bold text-sm">Kepala Sekolah</h3><p className="text-xs text-gray-500">Monitoring</p>
              </button>
              
              <button onClick={() => handleRoleSelect('admin')} disabled={!isAuthReady} className="p-4 bg-white border-2 border-gray-100 hover:border-gray-500 rounded-xl flex flex-col items-center transition-all hover:shadow-md disabled:opacity-50 col-span-2">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mb-2"><Settings className="text-gray-600"/></div>
                <h3 className="font-bold text-sm">Admin</h3><p className="text-xs text-gray-500">Kelola Sistem</p>
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="text-gray-500 mb-6">
              {role === 'student' ? "Login Peserta Ujian" : (role === 'admin' ? (isRegistering ? "Buat Akun Admin Baru" : "Login Administrator") : (role === 'principal' ? "Login Kepala Sekolah" : "Login Kontributor"))}
            </p>
            
            {/* Mengganti tag <form> menjadi <div> biasa dengan autoComplete="off" */}
            <div className="space-y-4 text-left">
              {role === 'admin' && isRegistering && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                  <div className="relative">
                    <UserPlus className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
                    <input 
                      type="text"
                      autoComplete="off"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      onKeyDown={handleKeyDown}
                      className="w-full pl-10 p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="Nama Lengkap"
                      required
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
                  <input 
                    type="text"
                    autoComplete="off"
                    value={formData.username}
                    onChange={e => setFormData({...formData, username: e.target.value})}
                    onKeyDown={handleKeyDown}
                    className="w-full pl-10 p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Masukkan username"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <Key className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
                  <input 
                    type="password"
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})}
                    onKeyDown={handleKeyDown}
                    className="w-full pl-10 p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Masukkan password"
                    required
                  />
                </div>
              </div>
              
              {error && (
                <div className="text-red-500 text-sm bg-red-50 p-2 rounded flex items-center">
                  <AlertCircle size={16} className="mr-2" /> {error}
                </div>
              )}
              
              {successMsg && (
                <div className="text-green-600 text-sm bg-green-50 p-2 rounded flex items-center">
                  <CheckCircle size={16} className="mr-2" /> {successMsg}
                </div>
              )}

              {/* Tombol dengan type="button" dan memanggil handleSubmit langsung */}
              <button type="button" onClick={handleSubmit} disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 transition disabled:bg-gray-400">
                {loading ? 'Memuat...' : (isRegistering ? 'Daftar' : 'Masuk')}
              </button>

              {role === 'admin' && (
                <div className="text-center mt-4">
                  <button 
                    type="button" 
                    onClick={() => {
                      setIsRegistering(!isRegistering);
                      setError('');
                      setSuccessMsg('');
                      setFormData({ name: '', username: '', password: '' });
                    }} 
                    className="text-sm text-blue-600 hover:underline font-medium"
                  >
                    {isRegistering ? "Sudah punya akun? Login" : "Belum punya akun? Buat Akun"}
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// --- ADMIN DASHBOARD ---
const AdminDashboard = ({ 
  questions, exams, students, results, contributors, principals, identity, metadata,
  onLogout, userRole 
}) => {
  const isPrincipal = userRole === 'principal';
  const isContributor = userRole === 'contributor';
  
  // Set default tab berdasarkan Role
  const [activeTab, setActiveTab] = useState(isPrincipal ? 'monitoring' : 'questions'); 
  const [categoryFilter, setCategoryFilter] = useState('Semua'); 
  const [subjectFilter, setSubjectFilter] = useState('Semua'); 
  const [classFilter, setClassFilter] = useState('Semua');
  const [examView, setExamView] = useState('list');
  const fileInputRef = useRef(null);

  const [examQCategoryFilter, setExamQCategoryFilter] = useState('Semua');
  const [examQSubjectFilter, setExamQSubjectFilter] = useState('Semua');
  const [examQClassFilter, setExamQClassFilter] = useState('Semua');
  const [examQSearch, setExamQSearch] = useState('');

  const [expandedQId, setExpandedQId] = useState(null); // State baru untuk melacak soal mana yang sedang dibuka/di-expand
  const [isEditingQ, setIsEditingQ] = useState(false);
  const [qForm, setQForm] = useState(null);
  const [examForm, setExamForm] = useState({ title: '', examCode: '', duration: 60, questionIds: [], randomizeQuestions: false, randomizeOptions: false, isActive: false, allowedSessions: ['1', '2', '3', '4'], allowedClasses: [], maxAttempts: 1 });
  const [isEditingStudent, setIsEditingStudent] = useState(false);
  const [studentForm, setStudentForm] = useState({ name: '', username: '', password: '', class: '', session: '1', isActive: true });
  const [identitasForm, setIdentitasForm] = useState({ namaSekolah: '', alamat: '', tahunPelajaran: '', semester: 'Ganjil', kepalaSekolah: '', nip: '' });
  const [studentClassFilter, setStudentClassFilter] = useState('Semua');

  useEffect(() => {
    if (identity) {
        setIdentitasForm({
            namaSekolah: identity.namaSekolah || '',
            alamat: identity.alamat || '',
            tahunPelajaran: identity.tahunPelajaran || '',
            semester: identity.semester || 'Ganjil',
            kepalaSekolah: identity.kepalaSekolah || '',
            nip: identity.nip || ''
        });
    }
  }, [identity]);
  
  // States untuk Sorting Peserta
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });

  // States untuk Kontributor
  const [isEditingContributor, setIsEditingContributor] = useState(false);
  const [contributorForm, setContributorForm] = useState({ name: '', username: '', password: '' });

  // States untuk Principal
  const [isEditingPrincipal, setIsEditingPrincipal] = useState(false);
  const [principalForm, setPrincipalForm] = useState({ name: '', username: '', password: '' });

  // Modifikasi filter soal agar mengurutkan berdasarkan createdAt (Waktu pembuatan)
  const filteredQuestions = questions.filter(q => {
      const matchCat = categoryFilter === 'Semua' || q.category === categoryFilter;
      const matchSubj = subjectFilter === 'Semua' || (q.subject || 'Umum') === subjectFilter;
      const matchClass = classFilter === 'Semua' || (q.classLevel || 'Umum') === classFilter;
      return matchCat && matchSubj && matchClass;
  }).sort((a, b) => {
      // Mengurutkan dari yang paling lama diinput hingga terbaru
      const timeA = a.createdAt || 0;
      const timeB = b.createdAt || 0;
      if (timeA === timeB) return a.id.localeCompare(b.id);
      return timeA - timeB;
  });
  
  const uniqueCategories = ['Semua', ...new Set(questions.map(q => q.category).filter(Boolean))];
  const uniqueSubjects = ['Semua', ...new Set(questions.map(q => q.subject || 'Umum').filter(Boolean))];

  const allClassesMaster = [...new Set([...(metadata.classes || []), ...students.map(s => s.class || '-').filter(c => c !== '-'), ...questions.map(q => q.classLevel || 'Umum').filter(c => c !== 'Umum')])].sort();

  // Filter & Sorting Logic untuk Peserta
  const filteredStudents = students.filter(s => studentClassFilter === 'Semua' || (s.class || '-') === studentClassFilter);
  const sortedStudents = [...filteredStudents].sort((a, b) => {
    const valA = (a[sortConfig.key] || '').toString().toLowerCase();
    const valB = (b[sortConfig.key] || '').toString().toLowerCase();
    if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
    if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleEditQ = (q) => { setQForm({ ...q }); setIsEditingQ(true); };
  const handleCreateQ = () => { 
    setQForm({ 
      type: 'single', category: '', subject: '', classLevel: '',
      stimulus: {title:'',content:'',image:''}, 
      question:'', 
      options:[{id:'A',text:''},{id:'B',text:''},{id:'C',text:''},{id:'D',text:''}], 
      correctAnswer:[],
      trueFalseStatements: [{id: 's1', text: '', correct: true}] 
    }); 
    setIsEditingQ(true); 
  };
  const handleDeleteQ = async (id) => { if(window.confirm('Hapus soal?')) await deleteDoc(getDocRef('questions', id)); };
  
  // Modifikasi penyimpanan soal agar menambahkan createdAt
  const handleSaveQ = async () => { 
    if(!qForm.question) return alert("Pertanyaan wajib diisi!");
    if(!qForm.classLevel || !qForm.subject || !qForm.category) return alert("Kelas, Mata Pelajaran, dan Kategori wajib dipilih!");
    try {
      if (qForm.id) {
        await updateDoc(getDocRef('questions', qForm.id), { ...qForm, updatedAt: Date.now() });
      } else {
        await addDoc(getCollectionRef('questions'), { ...qForm, createdAt: Date.now() });
      }
      setIsEditingQ(false);
    } catch (e) { alert("Gagal menyimpan: " + e.message); }
  };

  const openExamForm = (e=null) => { 
    setExamForm(e ? {...e, allowedClasses: e.allowedClasses || []} : { title: '', examCode: '', duration: 60, questionIds: [], randomizeQuestions: false, randomizeOptions: false, isActive: false, allowedSessions: ['1', '2', '3', '4'], allowedClasses: [], maxAttempts: 1 }); 
    setExamView('form'); 
    setExamQCategoryFilter('Semua');
    setExamQSubjectFilter('Semua');
    setExamQClassFilter('Semua');
    setExamQSearch('');
  };
  const handleSaveExam = async () => { 
    if(!examForm.title || !examForm.examCode) return alert("Nama dan Kode ujian wajib diisi!");
    try {
      if (examForm.id) {
        await updateDoc(getDocRef('exams', examForm.id), examForm);
      } else {
        await addDoc(getCollectionRef('exams'), { ...examForm, isActive: false });
      }
      setExamView('list');
    } catch (e) { alert("Gagal menyimpan: " + e.message); }
  };
  const handleDeleteExam = async (id) => { if(window.confirm('Hapus paket ujian?')) await deleteDoc(getDocRef('exams', id)); };
  const toggleExamStatus = async (exam) => {
    try {
      await updateDoc(getDocRef('exams', exam.id), { isActive: !exam.isActive });
    } catch (e) { alert("Gagal update status: " + e.message); }
  };
  const toggleQuestionSelection = (qid) => { const s=examForm.questionIds; setExamForm({...examForm, questionIds: s.includes(qid)?s.filter(id=>id!==qid):[...s,qid]}); };
  const toggleSession = (ses) => { 
      const s = examForm.allowedSessions || []; 
      setExamForm({...examForm, allowedSessions: s.includes(ses) ? s.filter(id=>id!==ses) : [...s, ses]}); 
  };
  const toggleClassAllowed = (cls) => {
      const c = examForm.allowedClasses || [];
      setExamForm({...examForm, allowedClasses: c.includes(cls) ? c.filter(id=>id!==cls) : [...c, cls]});
  };

  // Modifikasi filter pilih soal di paket agar ikut mengurutkan berdasarkan createdAt
  const availableQuestionsForExam = questions.filter(q => {
      const matchCat = examQCategoryFilter === 'Semua' || q.category === examQCategoryFilter;
      const matchSubj = examQSubjectFilter === 'Semua' || (q.subject || 'Umum') === examQSubjectFilter;
      const matchClass = examQClassFilter === 'Semua' || (q.classLevel || 'Umum') === examQClassFilter;
      const matchSearch = (q.question || '').toLowerCase().includes(examQSearch.toLowerCase());
      return matchCat && matchSubj && matchClass && matchSearch;
  }).sort((a, b) => {
      const timeA = a.createdAt || 0;
      const timeB = b.createdAt || 0;
      if (timeA === timeB) return a.id.localeCompare(b.id);
      return timeA - timeB;
  });

  const handleSaveStudent = async () => {
    if(!studentForm.username) return alert("Username wajib diisi!");
    if(!studentForm.class) return alert("Kelas wajib dipilih!");
    try {
      if (studentForm.id) {
        await updateDoc(getDocRef('students', studentForm.id), studentForm);
      } else {
        if(students.some(s => s.username === studentForm.username)) return alert("Username sudah ada!");
        await addDoc(getCollectionRef('students'), studentForm);
      }
      setIsEditingStudent(false);
    } catch (e) { alert("Gagal menyimpan: " + e.message); }
  };
  const handleDeleteStudent = async (id) => { if(window.confirm('Hapus siswa?')) await deleteDoc(getDocRef('students', id)); };

  const handleImportClick = () => fileInputRef.current.click();
  const handleFileChange = (e) => {
    const file = e.target.files[0]; if(!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      const lines = evt.target.result.split('\n');
      const batch = writeBatch(db);
      let count = 0;
      lines.forEach((l,i) => {
        const p = l.trim().split(',');
        // CSV Format: Name,Username,Password,Class,Session
        if(p.length>=3 && (i>0 || p[1].toLowerCase()!=='username') && !students.some(s=>s.username===p[1])) {
          const newRef = doc(getCollectionRef('students'));
          batch.set(newRef, { 
            name: p[0], 
            username: p[1], 
            password: p[2],
            class: p[3] ? p[3].trim() : '-',
            session: p[4] ? p[4].trim() : '1',
            isActive: true
          });
          count++;
        }
      });
      if(count > 0) {
        await batch.commit();
        alert(`Berhasil mengimpor ${count} siswa.`);
      } else {
        alert("Tidak ada data valid atau semua username duplikat.");
      }
      e.target.value = null;
    };
    reader.readAsText(file);
  };

  // --- CONTRIBUTOR MANAGEMENT FUNCTIONS ---
  const handleSaveContributor = async () => {
    if(!contributorForm.username || !contributorForm.password) return alert("Username dan Password wajib diisi!");
    try {
      if (contributorForm.id) {
        await updateDoc(getDocRef('contributors', contributorForm.id), contributorForm);
      } else {
        if((contributors || []).some(c => c.username === contributorForm.username)) return alert("Username sudah ada!");
        await addDoc(getCollectionRef('contributors'), contributorForm);
      }
      setIsEditingContributor(false);
      setContributorForm({ name: '', username: '', password: '' });
    } catch (e) { alert("Gagal menyimpan: " + e.message); }
  };

  const handleDeleteContributor = async (id) => { if(window.confirm('Hapus kontributor ini?')) await deleteDoc(getDocRef('contributors', id)); };

  // --- PRINCIPAL MANAGEMENT FUNCTIONS ---
  const handleSavePrincipal = async () => {
    if(!principalForm.username || !principalForm.password) return alert("Username dan Password wajib diisi!");
    try {
      if (principalForm.id) {
        await updateDoc(getDocRef('principals', principalForm.id), principalForm);
      } else {
        if((principals || []).some(p => p.username === principalForm.username)) return alert("Username sudah ada!");
        await addDoc(getCollectionRef('principals'), principalForm);
      }
      setIsEditingPrincipal(false);
      setPrincipalForm({ name: '', username: '', password: '' });
    } catch (e) { alert("Gagal menyimpan: " + e.message); }
  };

  const handleDeletePrincipal = async (id) => { if(window.confirm('Hapus akun Kepala Sekolah ini?')) await deleteDoc(getDocRef('principals', id)); };

  const handleSaveIdentitas = async () => {
      try {
          await setDoc(getDocRef('settings', 'identity'), identitasForm, { merge: true });
          alert("Identitas Sekolah berhasil disimpan!");
      } catch (e) { alert("Gagal menyimpan identitas: " + e.message); }
  };

  const handleSeedData = async () => {
    if(!window.confirm("Database Anda akan diisi dengan data contoh (Soal, Siswa, Ujian). Lanjutkan?")) return;
    try {
      const batch = writeBatch(db);
      
      SEED_DATA.questions.forEach((q, index) => {
        const newRef = doc(getCollectionRef('questions'));
        batch.set(newRef, { ...q, createdAt: Date.now() + index }); // Menambahkan urutan waktu
      });
      SEED_DATA.students.forEach(s => {
        const newRef = doc(getCollectionRef('students'));
        batch.set(newRef, s);
      });
      SEED_DATA.exams.forEach(e => {
        const newRef = doc(getCollectionRef('exams'));
        batch.set(newRef, e);
      });
      SEED_DATA.admins.forEach(a => {
        const newRef = doc(getCollectionRef('admins'));
        batch.set(newRef, a);
      });
      // Seed Contributor & Principal
      if (SEED_DATA.contributors) {
        SEED_DATA.contributors.forEach(c => {
           const newRef = doc(getCollectionRef('contributors'));
           batch.set(newRef, c);
        });
      }
      if (SEED_DATA.principals) {
        SEED_DATA.principals.forEach(p => {
           const newRef = doc(getCollectionRef('principals'));
           batch.set(newRef, p);
        });
      }
      
      await batch.commit();
      alert("Database berhasil diisi! Silakan login admin dengan username 'admin' dan password 'admin123' atau daftar baru.");
    } catch(e) { alert("Gagal seeding: " + e.message); }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      <PrintStyles />
      <nav className="bg-white border-b px-6 py-4 flex justify-between items-center sticky top-0 z-10 no-print">
        <div className="flex items-center space-x-3">
          <div className="bg-gray-800 p-2 rounded text-white"><Settings size={20} /></div>
          <h1 className="text-xl font-bold">
              {isPrincipal ? 'Panel Kepala Sekolah' : (isContributor ? 'Panel Kontributor' : 'Panel Admin')}
          </h1>
        </div>
        <div className="flex items-center gap-4">
          {!isContributor && !isPrincipal && (
            <button onClick={handleSeedData} className="text-gray-500 hover:text-blue-600 text-xs flex items-center border px-2 py-1 rounded"><Database size={12} className="mr-1"/> Reset & Seed Data Awal</button>
          )}
          <button onClick={onLogout} className="text-red-600 font-medium text-sm flex items-center"><LogOut size={16} className="mr-2"/> Keluar</button>
        </div>
      </nav>
      <div className="max-w-6xl mx-auto px-6 mt-6 no-print overflow-x-auto">
        <div className="flex space-x-1 bg-gray-200 p-1 rounded-lg w-max md:w-fit">
          
          {/* Menu untuk Admin & Kontributor (KS Tidak Melihat Ini) */}
          {!isPrincipal && (
             <button onClick={() => setActiveTab('questions')} className={`px-4 py-2 rounded-md text-sm font-medium flex items-center ${activeTab === 'questions' ? 'bg-white shadow' : 'text-gray-600'}`}><List size={16} className="mr-2"/> Bank Soal</button>
          )}

          {/* Menu Hanya untuk Admin */}
          {!isContributor && !isPrincipal && (
            <>
              <button onClick={() => setActiveTab('exams')} className={`px-4 py-2 rounded-md text-sm font-medium flex items-center ${activeTab === 'exams' ? 'bg-white shadow' : 'text-gray-600'}`}><Calendar size={16} className="mr-2"/> Paket Ujian</button>
              <button onClick={() => setActiveTab('students')} className={`px-4 py-2 rounded-md text-sm font-medium flex items-center ${activeTab === 'students' ? 'bg-white shadow' : 'text-gray-600'}`}><Users size={16} className="mr-2"/> Peserta</button>
            </>
          )}

          {/* Menu Pemantauan (Admin & KS) */}
          {!isContributor && (
             <>
                <button onClick={() => setActiveTab('monitoring')} className={`px-4 py-2 rounded-md text-sm font-medium flex items-center ${activeTab === 'monitoring' ? 'bg-white shadow' : 'text-gray-600'}`}><Activity size={16} className="mr-2"/> Pemantauan</button>
                <button onClick={() => setActiveTab('history')} className={`px-4 py-2 rounded-md text-sm font-medium flex items-center ${activeTab === 'history' ? 'bg-white shadow' : 'text-gray-600'}`}><ClipboardList size={16} className="mr-2"/> Riwayat</button>
             </>
          )}

          {/* Menu Tambahan Hanya Admin */}
          {!isContributor && !isPrincipal && (
              <>
                <button onClick={() => setActiveTab('master')} className={`px-4 py-2 rounded-md text-sm font-medium flex items-center ${activeTab === 'master' ? 'bg-white shadow' : 'text-gray-600'}`}><Database size={16} className="mr-2"/> Data Master</button>
                <button onClick={() => setActiveTab('identitas')} className={`px-4 py-2 rounded-md text-sm font-medium flex items-center ${activeTab === 'identitas' ? 'bg-white shadow' : 'text-gray-600'}`}><Building size={16} className="mr-2"/> Profil Sekolah</button>
                <button onClick={() => setActiveTab('contributors')} className={`px-4 py-2 rounded-md text-sm font-medium flex items-center ${activeTab === 'contributors' ? 'bg-white shadow' : 'text-gray-600'}`}><UsersCog size={16} className="mr-2"/> Kontributor</button>
                <button onClick={() => setActiveTab('principals')} className={`px-4 py-2 rounded-md text-sm font-medium flex items-center ${activeTab === 'principals' ? 'bg-white shadow' : 'text-gray-600'}`}><School size={16} className="mr-2"/> Kepala Sekolah</button>
              </>
          )}
        </div>
      </div>
      <div className="max-w-6xl mx-auto p-6 print-container">
        {activeTab === 'questions' && !isPrincipal && (isEditingQ ? 
          <QuestionEditor 
            qForm={qForm} 
            setQForm={setQForm} 
            onSave={handleSaveQ} 
            onCancel={() => setIsEditingQ(false)} 
            metadata={metadata}
            uniqueSubjects={uniqueSubjects}
            uniqueCategories={uniqueCategories}
            allClassesMaster={allClassesMaster}
          /> 
          : (
            <>
              <div className="flex justify-between items-center mb-6">
                 <div>
                   <h2 className="text-2xl font-bold">Bank Soal ({filteredQuestions.length})</h2>
                   <div className="flex flex-wrap items-center mt-2 text-sm text-gray-500 gap-2">
                      <Filter size={14}/> 
                      <span>Filter:</span>
                      <select className="border rounded p-1" value={classFilter} onChange={(e) => setClassFilter(e.target.value)}>
                        <option value="Semua">Semua Kelas</option>
                        {allClassesMaster.map(c => <option key={`fcls-${c}`} value={c}>{c}</option>)}
                      </select>
                      <select className="border rounded p-1" value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)}>
                        {uniqueSubjects.map(s => <option key={`sub-${s}`} value={s}>{s === 'Semua' ? 'Semua Mapel' : s}</option>)}
                      </select>
                      <select className="border rounded p-1" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                        {uniqueCategories.map(c => <option key={`cat-${c}`} value={c}>{c === 'Semua' ? 'Semua Kategori' : c}</option>)}
                      </select>
                   </div>
                 </div>
                 <button onClick={handleCreateQ} className="bg-blue-600 text-white px-4 py-2 rounded flex items-center"><Plus size={18} className="mr-2"/> Tambah Soal</button>
              </div>
              <div className="grid gap-3">{filteredQuestions.map((q, idx) => {
                   const isExpanded = expandedQId === q.id;
                   
                   return (
                   <div key={q.id} className={`bg-white p-5 rounded-lg border ${isExpanded ? 'border-blue-400 shadow-md ring-1 ring-blue-100' : 'border-gray-200 hover:border-blue-300 shadow-sm'} transition-all flex flex-col`}>
                     <div className="flex justify-between items-start w-full">
                         <div 
                             className="flex-1 pr-6 cursor-pointer" 
                             onClick={() => setExpandedQId(isExpanded ? null : q.id)}
                         >
                             <div className="flex items-center space-x-2 mb-2 flex-wrap gap-y-1">
                               <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs font-bold uppercase">#{idx + 1}</span>
                               <span className="text-xs font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded">Kelas {q.classLevel || 'Umum'}</span>
                               <span className="text-xs font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded uppercase">{(q.type || 'unknown').replace('_', ' ')}</span>
                               <span className="text-xs font-bold text-gray-700 bg-gray-200 px-2 py-0.5 rounded">{q.subject || 'Umum'}</span>
                               <span className="text-xs text-gray-500 border px-2 py-0.5 rounded">{q.category}</span>
                             </div>
                             
                             {!isExpanded ? (
                                 <div className="font-semibold line-clamp-2 text-gray-800 hover:text-blue-600 transition-colors">
                                     <FormattedText text={q.question}/>
                                 </div>
                             ) : (
                                 <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300 cursor-default">
                                     {/* Menampilkan Stimulus Jika Ada */}
                                     {(q.stimulus?.title || q.stimulus?.content || q.stimulus?.image) && (
                                         <div className="mb-4 p-4 bg-gray-50 border rounded-lg text-sm text-gray-700">
                                             <div className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Stimulus / Bacaan</div>
                                             {q.stimulus.title && <div className="font-bold mb-2 text-base text-gray-800">{q.stimulus.title}</div>}
                                             {q.stimulus.image && <img src={getOptimizedImageUrl(q.stimulus.image)} alt="Stimulus" className="max-h-48 rounded mb-3 border object-contain bg-white"/>}
                                             {q.stimulus.content && <div className="text-gray-600 leading-relaxed"><FormattedText text={q.stimulus.content}/></div>}
                                         </div>
                                     )}
                                     
                                     {/* Menampilkan Pertanyaan Penuh */}
                                     <div className="font-bold text-lg mb-5 text-gray-800">
                                         <FormattedText text={q.question}/>
                                     </div>

                                     {/* Menampilkan Opsi PG / PGK beserta Kunci Jawaban */}
                                     {(q.type === 'single' || q.type === 'multiple') && (
                                         <div className="space-y-2 mt-2">
                                            {(q.options || []).map(opt => {
                                                const isCorrect = (q.correctAnswer || []).includes(opt.id);
                                                return (
                                                    <div key={opt.id} className={`p-3 border rounded-lg flex items-center ${isCorrect ? 'bg-green-50 border-green-500 shadow-sm' : 'bg-white border-gray-200'}`}>
                                                        <span className={`w-8 h-8 flex items-center justify-center text-sm font-bold rounded-full mr-3 ${isCorrect ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-500 border border-gray-300'}`}>{opt.id}</span>
                                                        <span className={`flex-1 ${isCorrect ? 'text-green-900 font-medium' : 'text-gray-700'}`}><FormattedText text={opt.text}/></span>
                                                        {isCorrect && <CheckCircle className="text-green-500 w-5 h-5 ml-2"/>}
                                                    </div>
                                                );
                                            })}
                                         </div>
                                     )}

                                     {/* Menampilkan Pilihan Benar / Salah beserta Kunci Jawaban */}
                                     {q.type === 'true_false' && (
                                         <div className="overflow-hidden rounded-lg border border-gray-200 mt-2">
                                             <table className="w-full text-sm text-left bg-white">
                                                 <thead className="bg-gray-50 font-bold text-gray-600 border-b">
                                                     <tr><th className="p-3">Pernyataan</th><th className="p-3 w-32 text-center">Kunci Jawaban</th></tr>
                                                 </thead>
                                                 <tbody className="divide-y">
                                                     {(q.trueFalseStatements || []).map(st => (
                                                         <tr key={st.id} className="hover:bg-gray-50 transition-colors">
                                                             <td className="p-3 text-gray-700"><FormattedText text={st.text}/></td>
                                                             <td className="p-3 text-center">
                                                                 <span className={`px-3 py-1 rounded-full text-xs font-bold ${st.correct ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>
                                                                     {st.correct ? 'Benar' : 'Salah'}
                                                                 </span>
                                                             </td>
                                                         </tr>
                                                     ))}
                                                 </tbody>
                                             </table>
                                         </div>
                                     )}
                                 </div>
                             )}
                         </div>
                         <div className="flex gap-2 ml-4">
                           <button onClick={(e) => { e.stopPropagation(); handleEditQ(q); }} className="text-blue-600 bg-blue-50 hover:bg-blue-100 p-2 rounded transition" title="Edit Soal"><Edit size={16}/></button>
                           <button onClick={(e) => { e.stopPropagation(); handleDeleteQ(q.id); }} className="text-red-600 bg-red-50 hover:bg-red-100 p-2 rounded transition" title="Hapus Soal"><Trash2 size={16}/></button>
                         </div>
                     </div>
                     {/* Indikator klik (Bisa diklik untuk tutup/buka) */}
                     <div 
                         className="w-full text-center mt-3 pt-2 border-t border-dashed border-gray-200 cursor-pointer text-xs font-medium text-gray-400 hover:text-blue-500 transition-colors"
                         onClick={() => setExpandedQId(isExpanded ? null : q.id)}
                     >
                         {isExpanded ? 'Tutup Detail Soal ▲' : 'Klik area ini untuk melihat detail soal ▼'}
                     </div>
                   </div>
                 )})}
                 {filteredQuestions.length === 0 && <div className="text-center py-10 text-gray-400">Tidak ada soal di kategori ini.</div>}
              </div>
            </>
        ))}
        
        {/* VIEW DATA MASTER */}
        {activeTab === 'master' && !isContributor && !isPrincipal && (
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 max-w-4xl mx-auto">
               <div className="flex items-center mb-6 border-b pb-4">
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mr-4">
                     <Database size={24} />
                  </div>
                  <div>
                     <h2 className="text-2xl font-bold text-gray-800">Data Master</h2>
                     <p className="text-sm text-gray-500">Kelola daftar pilihan otomatis Mata Pelajaran dan Kategori Soal.</p>
                  </div>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                   {/* Kelola Mata Pelajaran */}
                   <div>
                       <h3 className="font-bold flex items-center mb-3 text-gray-800"><Book size={18} className="mr-2 text-blue-600"/> Mata Pelajaran</h3>
                       <div className="flex gap-2 mb-3">
                           <input 
                               type="text" 
                               id="newSubjectInput" 
                               placeholder="Tambah Mapel Baru..." 
                               className="border border-gray-300 p-2 rounded w-full text-sm outline-none focus:ring-2 focus:ring-blue-500" 
                               onKeyDown={(e) => {
                                   if (e.key === 'Enter') {
                                       const val = e.target.value.trim();
                                       if (val && !(metadata.subjects||[]).includes(val)) {
                                           const nl = [...(metadata.subjects||[]), val];
                                           setDoc(getDocRef('settings', 'metadata'), { subjects: nl }, { merge: true });
                                           e.target.value = '';
                                       }
                                   }
                               }}
                           />
                           <button onClick={() => {
                               const el = document.getElementById('newSubjectInput');
                               const val = el.value.trim();
                               if (val && !(metadata.subjects||[]).includes(val)) {
                                   const nl = [...(metadata.subjects||[]), val];
                                   setDoc(getDocRef('settings', 'metadata'), { subjects: nl }, { merge: true });
                                   el.value = '';
                               }
                           }} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded transition shadow-sm"><Plus size={16}/></button>
                       </div>
                       <ul className="border rounded-md divide-y bg-gray-50 max-h-72 overflow-y-auto">
                           {(metadata.subjects||[]).map(s => (
                               <li key={`master-sub-${s}`} className="p-2.5 px-4 flex justify-between items-center bg-white text-sm hover:bg-gray-50 transition-colors">
                                   <span className="font-medium text-gray-700">{s}</span>
                                   <button onClick={() => {
                                       if(window.confirm(`Hapus mapel "${s}" dari daftar dropdown?`)) {
                                           const nl = metadata.subjects.filter(x => x !== s);
                                           setDoc(getDocRef('settings', 'metadata'), { subjects: nl }, { merge: true });
                                       }
                                   }} className="text-red-500 hover:bg-red-50 p-1.5 rounded transition"><Trash2 size={16}/></button>
                               </li>
                           ))}
                           {(metadata.subjects||[]).length === 0 && <li className="p-4 text-center text-sm text-gray-400 italic">Belum ada data mata pelajaran.</li>}
                       </ul>
                   </div>

                   {/* Kelola Kategori Soal */}
                   <div>
                       <h3 className="font-bold flex items-center mb-3 text-gray-800"><Tag size={18} className="mr-2 text-blue-600"/> Kategori Soal</h3>
                       <div className="flex gap-2 mb-3">
                           <input 
                               type="text" 
                               id="newCategoryInput" 
                               placeholder="Tambah Kategori Baru..." 
                               className="border border-gray-300 p-2 rounded w-full text-sm outline-none focus:ring-2 focus:ring-blue-500" 
                               onKeyDown={(e) => {
                                   if (e.key === 'Enter') {
                                       const val = e.target.value.trim();
                                       if (val && !(metadata.categories||[]).includes(val)) {
                                           const nl = [...(metadata.categories||[]), val];
                                           setDoc(getDocRef('settings', 'metadata'), { categories: nl }, { merge: true });
                                           e.target.value = '';
                                       }
                                   }
                               }}
                           />
                           <button onClick={() => {
                               const el = document.getElementById('newCategoryInput');
                               const val = el.value.trim();
                               if (val && !(metadata.categories||[]).includes(val)) {
                                   const nl = [...(metadata.categories||[]), val];
                                   setDoc(getDocRef('settings', 'metadata'), { categories: nl }, { merge: true });
                                   el.value = '';
                               }
                           }} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded transition shadow-sm"><Plus size={16}/></button>
                       </div>
                       <ul className="border rounded-md divide-y bg-gray-50 max-h-72 overflow-y-auto">
                           {(metadata.categories||[]).map(c => (
                               <li key={`master-cat-${c}`} className="p-2.5 px-4 flex justify-between items-center bg-white text-sm hover:bg-gray-50 transition-colors">
                                   <span className="font-medium text-gray-700">{c}</span>
                                   <button onClick={() => {
                                       if(window.confirm(`Hapus kategori "${c}" dari daftar dropdown?`)) {
                                           const nl = metadata.categories.filter(x => x !== c);
                                           setDoc(getDocRef('settings', 'metadata'), { categories: nl }, { merge: true });
                                       }
                                   }} className="text-red-500 hover:bg-red-50 p-1.5 rounded transition"><Trash2 size={16}/></button>
                               </li>
                           ))}
                           {(metadata.categories||[]).length === 0 && <li className="p-4 text-center text-sm text-gray-400 italic">Belum ada data kategori.</li>}
                       </ul>
                   </div>

                   {/* Kelola Tingkatan Kelas */}
                   <div>
                       <h3 className="font-bold flex items-center mb-3 text-gray-800"><Users size={18} className="mr-2 text-blue-600"/> Tingkatan Kelas</h3>
                       <div className="flex gap-2 mb-3">
                           <input 
                               type="text" 
                               id="newClassInput" 
                               placeholder="Tambah Kelas Baru..." 
                               className="border border-gray-300 p-2 rounded w-full text-sm outline-none focus:ring-2 focus:ring-blue-500" 
                               onKeyDown={(e) => {
                                   if (e.key === 'Enter') {
                                       const val = e.target.value.trim();
                                       if (val && !(metadata.classes||[]).includes(val)) {
                                           const nl = [...(metadata.classes||[]), val];
                                           setDoc(getDocRef('settings', 'metadata'), { classes: nl }, { merge: true });
                                           e.target.value = '';
                                       }
                                   }
                               }}
                           />
                           <button onClick={() => {
                               const el = document.getElementById('newClassInput');
                               const val = el.value.trim();
                               if (val && !(metadata.classes||[]).includes(val)) {
                                   const nl = [...(metadata.classes||[]), val];
                                   setDoc(getDocRef('settings', 'metadata'), { classes: nl }, { merge: true });
                                   el.value = '';
                               }
                           }} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded transition shadow-sm"><Plus size={16}/></button>
                       </div>
                       <ul className="border rounded-md divide-y bg-gray-50 max-h-72 overflow-y-auto">
                           {(metadata.classes||[]).map(c => (
                               <li key={`master-cls-${c}`} className="p-2.5 px-4 flex justify-between items-center bg-white text-sm hover:bg-gray-50 transition-colors">
                                   <span className="font-medium text-gray-700">{c}</span>
                                   <button onClick={() => {
                                       if(window.confirm(`Hapus kelas "${c}" dari daftar master?`)) {
                                           const nl = metadata.classes.filter(x => x !== c);
                                           setDoc(getDocRef('settings', 'metadata'), { classes: nl }, { merge: true });
                                       }
                                   }} className="text-red-500 hover:bg-red-50 p-1.5 rounded transition"><Trash2 size={16}/></button>
                               </li>
                           ))}
                           {(metadata.classes||[]).length === 0 && <li className="p-4 text-center text-sm text-gray-400 italic">Belum ada data kelas.</li>}
                       </ul>
                   </div>
               </div>
            </div>
        )}

        {activeTab === 'exams' && !isContributor && !isPrincipal && (examView === 'form' ? (
             <div className="bg-white p-6 rounded-lg shadow border">
                <div className="flex justify-between items-center mb-6"><h3 className="text-xl font-bold">{examForm.id ? 'Edit' : 'Baru'} Paket Ujian</h3><button onClick={()=>setExamView('list')}><X/></button></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                   <div className="space-y-4">
                       <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Nama Ujian</label>
                          <input value={examForm.title} onChange={e=>setExamForm({...examForm, title:e.target.value})} className="border p-2 rounded w-full" placeholder="Nama Ujian"/>
                       </div>
                       <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Kode Ujian / Token</label>
                          <input value={examForm.examCode || ''} onChange={e=>setExamForm({...examForm, examCode:e.target.value.toUpperCase()})} className="border p-2 rounded w-full font-bold uppercase" placeholder="Misal: MTK01"/>
                          <p className="text-xs text-gray-400 mt-1">Siswa membutuhkan kode ini untuk masuk ke dalam soal.</p>
                       </div>
                       <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Durasi (Menit)</label>
                          <input type="number" value={examForm.duration} onChange={e=>setExamForm({...examForm, duration:parseInt(e.target.value)})} className="border p-2 rounded w-full" placeholder="Durasi (menit)"/>
                       </div>
                       <div className="flex gap-4">
                         <label className="flex items-center"><input type="checkbox" checked={examForm.randomizeQuestions} onChange={e=>setExamForm({...examForm, randomizeQuestions:e.target.checked})} className="mr-2"/> Acak Soal</label>
                         <label className="flex items-center"><input type="checkbox" checked={examForm.randomizeOptions} onChange={e=>setExamForm({...examForm, randomizeOptions:e.target.checked})} className="mr-2"/> Acak Opsi</label>
                       </div>
                       <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">Batasan Mengerjakan (Kali)</label>
                           <input type="number" min="1" value={examForm.maxAttempts || 1} onChange={e=>setExamForm({...examForm, maxAttempts:parseInt(e.target.value)})} className="border p-2 rounded w-full" placeholder="Contoh: 1"/>
                           <p className="text-xs text-gray-400 mt-1">Siswa hanya dapat mengerjakan ujian sebanyak jumlah ini.</p>
                       </div>
                   </div>
                   <div className="bg-gray-50 p-4 rounded border">
                       <h4 className="font-bold text-sm mb-3 text-gray-600">Sesi yang Diizinkan:</h4>
                       <div className="flex gap-4 flex-wrap">
                          {['1', '2', '3', '4'].map(ses => (
                              <label key={ses} className="flex items-center bg-white border px-3 py-2 rounded cursor-pointer hover:bg-gray-50">
                                  <input 
                                    type="checkbox" 
                                    checked={(examForm.allowedSessions || []).includes(ses)} 
                                    onChange={() => toggleSession(ses)}
                                    className="mr-2 w-4 h-4 accent-blue-600"
                                  />
                                  Sesi {ses}
                              </label>
                          ))}
                       </div>
                       <p className="text-xs text-gray-400 mt-2">Hanya siswa dengan sesi yang dicentang yang bisa masuk ujian ini.</p>
                   </div>

                   <div className="bg-gray-50 p-4 rounded border mt-4">
                       <h4 className="font-bold text-sm mb-3 text-gray-600">Kelas yang Diizinkan:</h4>
                       <div className="flex gap-2 flex-wrap max-h-32 overflow-y-auto">
                          {(() => {
                              if (allClassesMaster.length === 0) return <span className="text-sm text-gray-500">Belum ada data kelas. Tambahkan di Data Master atau Siswa.</span>;
                              return allClassesMaster.map(cls => (
                                  <label key={cls} className="flex items-center bg-white border px-3 py-2 rounded cursor-pointer hover:bg-gray-50 text-sm">
                                      <input 
                                        type="checkbox" 
                                        checked={(examForm.allowedClasses || []).includes(cls)} 
                                        onChange={() => toggleClassAllowed(cls)}
                                        className="mr-2 w-4 h-4 accent-blue-600"
                                      />
                                      {cls}
                                  </label>
                              ));
                          })()}
                       </div>
                       <p className="text-xs text-gray-400 mt-2">Biarkan KOSONG jika semua kelas diizinkan.</p>
                   </div>
                </div>
                <div className="border-t pt-4">
                   <div className="flex justify-between items-center mb-3"><p className="font-bold">Pilih Soal:</p><span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-bold">{examForm.questionIds.length} terpilih</span></div>
                   
                   <div className="flex gap-2 mb-3 flex-wrap md:flex-nowrap">
                       <select value={examQClassFilter} onChange={e=>setExamQClassFilter(e.target.value)} className="border p-2 rounded text-sm w-full md:w-1/5 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none">
                           <option value="Semua">Semua Kelas</option>
                           {allClassesMaster.map(c => <option key={`exam-cls-${c}`} value={c}>{c}</option>)}
                       </select>
                       <select value={examQSubjectFilter} onChange={e=>setExamQSubjectFilter(e.target.value)} className="border p-2 rounded text-sm w-full md:w-1/5 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none">
                           {uniqueSubjects.map(s => <option key={`exam-sub-${s}`} value={s}>{s === 'Semua' ? 'Semua Mapel' : s}</option>)}
                       </select>
                       <select value={examQCategoryFilter} onChange={e=>setExamQCategoryFilter(e.target.value)} className="border p-2 rounded text-sm w-full md:w-1/5 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none">
                           {uniqueCategories.map(c => <option key={`exam-cat-${c}`} value={c}>{c === 'Semua' ? 'Semua Kategori' : c}</option>)}
                       </select>
                       <input type="text" placeholder="Cari cuplikan soal..." value={examQSearch} onChange={e=>setExamQSearch(e.target.value)} className="border p-2 rounded text-sm w-full md:w-2/5 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"/>
                   </div>

                   <div className="max-h-72 overflow-y-auto border rounded divide-y bg-gray-50">
                     {availableQuestionsForExam.map((q,i)=>(
                       <div key={q.id} onClick={()=>toggleQuestionSelection(q.id)} className={`p-3 flex items-start cursor-pointer hover:bg-blue-50 transition-colors ${examForm.questionIds.includes(q.id)?'bg-blue-50 border-l-4 border-blue-500':'bg-white border-l-4 border-transparent'}`}>
                         <input type="checkbox" checked={examForm.questionIds.includes(q.id)} readOnly className="mr-3 mt-1 w-4 h-4 accent-blue-600 cursor-pointer"/> 
                         <div className="overflow-hidden flex-1">
                           <span className="text-xs font-bold text-indigo-700 mr-2 border border-indigo-200 px-1.5 py-0.5 rounded bg-indigo-50">[Kls: {q.classLevel || 'Umum'}]</span>
                           <span className="text-xs font-bold text-gray-800 mr-2 border border-gray-300 px-1.5 py-0.5 rounded bg-white">[{q.subject || 'Umum'}]</span>
                           <span className="text-xs font-bold text-gray-500 mr-2 border px-1.5 py-0.5 rounded bg-gray-100">[{q.category}]</span>
                           <span className="text-sm text-gray-800 line-clamp-2 mt-1">{q.question}</span>
                         </div>
                       </div>
                     ))}
                     {availableQuestionsForExam.length === 0 && (
                         <div className="p-6 text-center text-sm text-gray-400 italic">Tidak ada soal yang sesuai dengan filter.</div>
                     )}
                   </div>
                </div>
                <div className="mt-4 flex justify-end gap-2"><button onClick={()=>setExamView('list')} className="px-4 py-2 border rounded">Batal</button><button onClick={handleSaveExam} className="px-4 py-2 bg-blue-600 text-white rounded">Simpan</button></div>
             </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-6"><h2 className="text-2xl font-bold">Daftar Paket</h2><button onClick={() => openExamForm()} className="bg-green-600 text-white px-4 py-2 rounded flex items-center"><Plus size={18} className="mr-2"/> Buat Baru</button></div>
              <div className="grid gap-4">{exams.map((exam) => {const isActive = exam.isActive; return (<div key={exam.id} className={`bg-white p-6 rounded-lg border-2 ${isActive ? 'border-green-500 shadow-md' : 'border-gray-100'}`}><div className="flex justify-between items-start"><div><h3 className="font-bold text-lg">{exam.title} <span className="text-sm font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded border ml-2">Kode: <strong>{exam.examCode || '-'}</strong></span></h3>{isActive && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded font-bold mt-1 inline-block">AKTIF</span>}<p className="text-sm text-gray-500 mt-1">{exam.duration} Menit • {exam.questionIds.length} Soal • Sesi: {(exam.allowedSessions || []).join(', ')} • Max: {exam.maxAttempts || 1}x{(exam.allowedClasses && exam.allowedClasses.length > 0) ? ` • Kelas: ${exam.allowedClasses.join(', ')}` : ''}</p></div><div className="flex gap-2"><button onClick={() => toggleExamStatus(exam)} className={`px-3 py-1 rounded text-sm font-bold flex items-center ${isActive ? 'bg-red-100 text-red-700' : 'bg-gray-100 hover:bg-green-100 text-gray-700 hover:text-green-700'}`}>{isActive ? <><StopCircle size={14} className="mr-1"/> Stop</> : <><PlayCircle size={14} className="mr-1"/> Mulai</>}</button><button onClick={()=>openExamForm(exam)} className="p-2 text-blue-500"><Edit size={16}/></button><button onClick={()=>handleDeleteExam(exam.id)} className="p-2 text-red-500"><Trash2 size={16}/></button></div></div></div>);})}</div>
            </>
        ))}
        {activeTab === 'students' && !isContributor && !isPrincipal && (isEditingStudent ? (
             <div className="bg-white p-6 rounded-lg shadow max-w-md mx-auto">
               <h3 className="font-bold mb-4">{studentForm.id ? 'Edit' : 'Tambah'} Siswa</h3>
               <div className="space-y-3">
                 <input value={studentForm.name} onChange={e=>setStudentForm({...studentForm, name:e.target.value})} className="border p-2 w-full rounded" placeholder="Nama"/>
                 <div className="flex gap-2">
                    <select value={studentForm.class || ''} onChange={e=>setStudentForm({...studentForm, class:e.target.value})} className="border p-2 w-full rounded bg-white">
                        <option value="" disabled>Pilih Kelas</option>
                        {allClassesMaster.filter(c => c !== 'Semua').map(c => <option key={`dl-cls-${c}`} value={c}>{c}</option>)}
                    </select>
                    <select value={studentForm.session || '1'} onChange={e=>setStudentForm({...studentForm, session:e.target.value})} className="border p-2 rounded w-1/3">
                        <option value="1">Sesi 1</option>
                        <option value="2">Sesi 2</option>
                        <option value="3">Sesi 3</option>
                        <option value="4">Sesi 4</option>
                    </select>
                 </div>
                 <input value={studentForm.username} onChange={e=>setStudentForm({...studentForm, username:e.target.value})} className="border p-2 w-full rounded" placeholder="Username"/>
                 <input value={studentForm.password} onChange={e=>setStudentForm({...studentForm, password:e.target.value})} className="border p-2 w-full rounded" placeholder="Password"/>
                 <label className="flex items-center mt-2 cursor-pointer">
                     <input type="checkbox" checked={studentForm.isActive !== false} onChange={e=>setStudentForm({...studentForm, isActive: e.target.checked})} className="mr-2 w-4 h-4 accent-blue-600"/>
                     <span className="text-sm font-bold text-gray-700">Akun Aktif (Bisa Login)</span>
                 </label>
               </div>
               <div className="mt-4 flex justify-end gap-2"><button onClick={()=>setIsEditingStudent(false)} className="px-3 py-2 border rounded">Batal</button><button onClick={handleSaveStudent} className="px-3 py-2 bg-blue-600 text-white rounded">Simpan</button></div>
             </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold">Data Peserta</h2>
                  <div className="flex items-center mt-2 text-sm text-gray-500 gap-2">
                      <Filter size={14}/>
                      <span>Filter Kelas:</span>
                      <select className="border rounded p-1" value={studentClassFilter} onChange={(e) => setStudentClassFilter(e.target.value)}>
                          <option value="Semua">Semua Kelas</option>
                          {allClassesMaster.map(c => <option key={`filter-cls-${c}`} value={c}>{c}</option>)}
                      </select>
                  </div>
                </div>
                <div className="flex gap-2 self-start mt-1">
                  <input type="file" accept=".csv" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} />
                  <button onClick={handleImportClick} className="bg-green-600 text-white px-3 py-2 rounded flex items-center text-sm"><Upload size={16} className="mr-2"/> Impor CSV</button>
                  <button onClick={()=> {setStudentForm({name:'', username:'', password:'', class: '', session: '1', isActive: true}); setIsEditingStudent(true);}} className="bg-blue-600 text-white px-3 py-2 rounded flex items-center text-sm"><Plus size={16} className="mr-2"/> Tambah</button>
                </div>
              </div>
              <div className="bg-white shadow rounded-lg overflow-hidden border overflow-x-auto">
                <table className="w-full text-left text-sm min-w-[600px]">
                  <thead className="bg-gray-50 font-bold select-none">
                    <tr>
                      <th className="p-4 cursor-pointer hover:bg-gray-100 flex items-center" onClick={() => requestSort('name')}>
                        Nama {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? <ArrowUpDown className="ml-1 w-3 h-3 transform rotate-180"/> : <ArrowUpDown className="ml-1 w-3 h-3"/>)}
                      </th>
                      <th className="p-4 cursor-pointer hover:bg-gray-100" onClick={() => requestSort('class')}>
                        Kelas {sortConfig.key === 'class' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="p-4">Sesi</th>
                      <th className="p-4">Username</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {sortedStudents.map(s => (
                      <tr key={s.id} className="hover:bg-gray-50">
                        <td className="p-4">{s.name}</td>
                        <td className="p-4"><span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded border">{s.class || '-'}</span></td>
                        <td className="p-4"><span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded">Sesi {s.session || '1'}</span></td>
                        <td className="p-4 font-mono text-gray-600">{s.username}</td>
                        <td className="p-4">
                            <button 
                                onClick={async () => await updateDoc(getDocRef('students', s.id), { isActive: s.isActive === false ? true : false })} 
                                className={`px-2 py-1 text-xs font-bold rounded border ${s.isActive !== false ? 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200' : 'bg-red-100 text-red-700 border-red-200 hover:bg-red-200'}`}
                                title="Klik untuk mengubah status"
                            >
                                {s.isActive !== false ? 'Aktif' : 'Nonaktif'}
                            </button>
                        </td>
                        <td className="p-4 text-center space-x-2">
                          <button onClick={() => {setStudentForm({...s, isActive: s.isActive !== false}); setIsEditingStudent(true);}} className="text-blue-600"><Edit size={16}/></button>
                          <button onClick={() => handleDeleteStudent(s.id)} className="text-red-600"><Trash2 size={16}/></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
        ))}
        {activeTab === 'contributors' && !isContributor && !isPrincipal && (isEditingContributor ? (
             <div className="bg-white p-6 rounded-lg shadow max-w-md mx-auto">
               <h3 className="font-bold mb-4">{contributorForm.id ? 'Edit' : 'Tambah'} Kontributor</h3>
               <div className="space-y-3">
                 <input value={contributorForm.name} onChange={e=>setContributorForm({...contributorForm, name:e.target.value})} className="border p-2 w-full rounded" placeholder="Nama Kontributor"/>
                 <input value={contributorForm.username} onChange={e=>setContributorForm({...contributorForm, username:e.target.value})} className="border p-2 w-full rounded" placeholder="Username (Login)"/>
                 <input value={contributorForm.password} onChange={e=>setContributorForm({...contributorForm, password:e.target.value})} className="border p-2 w-full rounded" placeholder="Password"/>
               </div>
               <div className="mt-4 flex justify-end gap-2"><button onClick={()=>setIsEditingContributor(false)} className="px-3 py-2 border rounded">Batal</button><button onClick={handleSaveContributor} className="px-3 py-2 bg-blue-600 text-white rounded">Simpan</button></div>
             </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Daftar Kontributor</h2>
                <button onClick={()=> {setContributorForm({name:'', username:'', password:''}); setIsEditingContributor(true);}} className="bg-blue-600 text-white px-3 py-2 rounded flex items-center text-sm"><Plus size={16} className="mr-2"/> Tambah Kontributor</button>
              </div>
              <div className="bg-white shadow rounded-lg overflow-hidden border overflow-x-auto">
                <table className="w-full text-left text-sm min-w-[600px]">
                    <thead className="bg-gray-50 font-bold"><tr><th className="p-4">Nama</th><th className="p-4">Username</th><th className="p-4 text-center">Aksi</th></tr></thead>
                    <tbody className="divide-y">
                        {(contributors || []).map(c => (
                            <tr key={c.id} className="hover:bg-gray-50">
                                <td className="p-4">{c.name}</td>
                                <td className="p-4 font-mono text-gray-600">{c.username}</td>
                                <td className="p-4 text-center space-x-2">
                                    <button onClick={() => {setContributorForm({...c}); setIsEditingContributor(true);}} className="text-blue-600"><Edit size={16}/></button>
                                    <button onClick={() => handleDeleteContributor(c.id)} className="text-red-600"><Trash2 size={16}/></button>
                                </td>
                            </tr>
                        ))}
                        {(contributors || []).length === 0 && <tr><td colSpan="3" className="p-4 text-center text-gray-400">Belum ada kontributor.</td></tr>}
                    </tbody>
                </table>
              </div>
            </>
        ))}
        {activeTab === 'identitas' && !isContributor && !isPrincipal && (
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 max-w-2xl mx-auto">
               <div className="flex items-center mb-6 border-b pb-4">
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mr-4">
                     <Building size={24} />
                  </div>
                  <div>
                     <h2 className="text-2xl font-bold text-gray-800">Profil & Identitas Sekolah</h2>
                     <p className="text-sm text-gray-500">Digunakan untuk kop surat pada laporan ujian.</p>
                  </div>
               </div>
               
               <div className="space-y-5">
                   <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Nama Sekolah</label>
                      <input value={identitasForm.namaSekolah || ''} onChange={e=>setIdentitasForm({...identitasForm, namaSekolah: e.target.value})} className="border border-gray-300 p-2.5 w-full rounded-md focus:ring-2 focus:ring-blue-500 outline-none transition" placeholder="Contoh: SMA Negeri 1 Indonesia"/>
                   </div>
                   <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Alamat Lengkap</label>
                      <textarea value={identitasForm.alamat || ''} onChange={e=>setIdentitasForm({...identitasForm, alamat: e.target.value})} className="border border-gray-300 p-2.5 w-full rounded-md focus:ring-2 focus:ring-blue-500 outline-none transition h-24" placeholder="Jalan, Desa, Kecamatan, Kab/Kota, Provinsi"/>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                       <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1">Tahun Pelajaran</label>
                          <input value={identitasForm.tahunPelajaran || ''} onChange={e=>setIdentitasForm({...identitasForm, tahunPelajaran: e.target.value})} className="border border-gray-300 p-2.5 w-full rounded-md focus:ring-2 focus:ring-blue-500 outline-none transition" placeholder="Misal: 2023/2024"/>
                       </div>
                       <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1">Semester</label>
                          <select value={identitasForm.semester || 'Ganjil'} onChange={e=>setIdentitasForm({...identitasForm, semester: e.target.value})} className="border border-gray-300 p-2.5 w-full rounded-md focus:ring-2 focus:ring-blue-500 outline-none transition">
                              <option value="Ganjil">Ganjil</option>
                              <option value="Genap">Genap</option>
                          </select>
                       </div>
                       <div className="md:col-span-2 mt-4 border-t pt-4">
                          <h3 className="font-bold text-gray-800 mb-4">Penandatangan Laporan</h3>
                       </div>
                       <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1">Nama Kepala Sekolah</label>
                          <input value={identitasForm.kepalaSekolah || ''} onChange={e=>setIdentitasForm({...identitasForm, kepalaSekolah: e.target.value})} className="border border-gray-300 p-2.5 w-full rounded-md focus:ring-2 focus:ring-blue-500 outline-none transition" placeholder="Nama lengkap beserta gelar"/>
                       </div>
                       <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1">NIP Kepala Sekolah</label>
                          <input value={identitasForm.nip || ''} onChange={e=>setIdentitasForm({...identitasForm, nip: e.target.value})} className="border border-gray-300 p-2.5 w-full rounded-md focus:ring-2 focus:ring-blue-500 outline-none transition" placeholder="NIP (Kosongkan jika tidak ada)"/>
                       </div>
                   </div>
               </div>
               <div className="mt-8 flex justify-end">
                  <button onClick={handleSaveIdentitas} className="px-6 py-2.5 bg-blue-600 text-white rounded-md font-bold hover:bg-blue-700 flex items-center shadow-md transition">
                     <Save size={18} className="mr-2"/> Simpan Identitas
                  </button>
               </div>
            </div>
        )}
        {activeTab === 'monitoring' && !isContributor && <MonitoringView exams={exams} results={results} students={students} identity={identity} />}
        {activeTab === 'history' && !isContributor && <HistoryView results={results} exams={exams} students={students} identity={identity} />}
      </div>
    </div>
  );
};

// --- SISWA (DILENGKAPI LOCKDOWN FULLSCREEN & AUTO RESTORE) ---
const StudentExam = ({ questions, activeExam, currentUser, onLogout, results, onBack }) => {
  const [processedQuestions, setProcessedQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [raguRagu, setRaguRagu] = useState({});
  const [timeLeft, setTimeLeft] = useState(0); 
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [examFinished, setExamFinished] = useState(false);
  const [score, setScore] = useState(0);
  const [resultId, setResultId] = useState(null); 
  const [sessionError, setSessionError] = useState(null); 
  const [attemptError, setAttemptError] = useState(null); 
  
  // STATE KEAMANAN
  const [isFullscreen, setIsFullscreen] = useState(true);
  const [isViolating, setIsViolating] = useState(false);

  // EFFECT 1: Check Attempts
  useEffect(() => {
    if (!activeExam || !currentUser || !results) return;

    const maxAttempts = parseInt(activeExam.maxAttempts || 1);
    const myFinishedResults = results.filter(r => 
        r.examId === activeExam.id && 
        r.studentId === currentUser.id && 
        r.status === 'finished'
    );

    if (myFinishedResults.length >= maxAttempts) {
        setAttemptError(`Anda sudah menggunakan kesempatan mengerjakan sebanyak ${myFinishedResults.length} dari ${maxAttempts} kali.`);
    } else {
        setAttemptError(null);
    }
  }, [activeExam?.id, currentUser?.id, results.length]); 

  // EFFECT 2: Initialization & Restoration
  useEffect(() => {
    if(!activeExam || sessionError || attemptError) return;

    const allowed = activeExam.allowedSessions || []; 
    const userSession = currentUser.session || '1'; 

    if (allowed.length > 0 && !allowed.includes(userSession)) {
        setSessionError(`Maaf, Ujian ini hanya untuk Sesi ${allowed.join(', ')}. Anda terdaftar di Sesi ${userSession}.`);
        return; 
    }

    const allowedClasses = activeExam.allowedClasses || [];
    const userClass = currentUser.class || '-';
    if (allowedClasses.length > 0 && !allowedClasses.includes(userClass)) {
        setSessionError(`Maaf, Ujian ini tidak diperuntukkan untuk kelas Anda (${userClass}).`);
        return;
    }

    if (activeExam && questions.length > 0) {
      if (processedQuestions.length > 0) return; // Cegah re-inisialisasi jika sudah ada

      const storageKey = `exam_data_${currentUser.id}_${activeExam.id}`;
      const savedDataStr = localStorage.getItem(storageKey);

      // 1. Coba pulihkan data dari Local Storage terlebih dahulu
      if (savedDataStr) {
          try {
              const savedData = JSON.parse(savedDataStr);
              // Pastikan data yang tersimpan valid dan tidak kosong
              if (savedData.processedQuestions && savedData.processedQuestions.length > 0) {
                  setProcessedQuestions(savedData.processedQuestions);
                  setAnswers(savedData.answers || {});
                  setRaguRagu(savedData.raguRagu || {});
                  setTimeLeft(savedData.timeLeft);
                  setResultId(savedData.resultId || `${activeExam.id}_${currentUser.id}_${Date.now()}`);
                  return; // SUCCESSFUL RESTORE: Keluar dari useEffect ini, jangan timpa datanya!
              }
          } catch (e) { console.error("Gagal memulihkan data ujian:", e); }
      }

      // 2. Jika tidak ada di penyimpanan, Buat Sesi Baru (FRESH START)
      let qList = questions.filter(q => activeExam.questionIds.includes(q.id));
      if (activeExam.randomizeQuestions) qList = shuffleArray(qList);
      
      if (activeExam.randomizeOptions) {
        qList = qList.map(q => {
          if (q.type === 'single' || q.type === 'multiple') {
            return {...q, options: shuffleArray([...q.options])};
          }
          return q;
        });
      }
      setProcessedQuestions(qList); 
      const initialTime = activeExam.duration * 60;
      setTimeLeft(initialTime);
      
      const currentSessionId = `${activeExam.id}_${currentUser.id}_${Date.now()}`;
      setResultId(currentSessionId);

      localStorage.setItem(storageKey, JSON.stringify({
          processedQuestions: qList,
          answers: {},
          raguRagu: {},
          timeLeft: initialTime,
          resultId: currentSessionId
      }));

      const resultData = {
        examId: activeExam.id,
        studentId: currentUser.id,
        studentName: currentUser.name,
        studentClass: currentUser.class || '-',
        status: 'ongoing',
        answeredCount: 0,
        score: 0,
        timestamp: new Date().toISOString()
      };
      
      try {
        setDoc(getDocRef('results', currentSessionId), resultData, { merge: true });
      } catch (e) { console.error("Error init exam:", e); }
    }
  }, [activeExam?.id, questions, currentUser, sessionError, attemptError]);

  // EFFECT 3: Timer & Auto Submit
  useEffect(() => {
    if (timeLeft > 0 && !examFinished) {
      const timerId = setInterval(() => setTimeLeft(p => p - 1), 1000);
      return () => clearInterval(timerId);
    } else if (timeLeft === 0 && !examFinished && activeExam && processedQuestions.length > 0) {
      finishExam();
    }
  }, [timeLeft, examFinished, activeExam, processedQuestions.length]);

  // EFFECT 4: Sinkronisasi progress ujian ke LocalStorage secara realtime
  useEffect(() => {
    if (processedQuestions.length > 0 && resultId && activeExam && currentUser) {
        const storageKey = `exam_data_${currentUser.id}_${activeExam.id}`;
        localStorage.setItem(storageKey, JSON.stringify({
            processedQuestions,
            answers,
            raguRagu,
            timeLeft,
            resultId
        }));
    }
  }, [answers, raguRagu, timeLeft, processedQuestions, resultId, activeExam, currentUser]);

  // EFFECT 5: TRACK FULLSCREEN
  useEffect(() => {
      const checkFs = () => setIsFullscreen(!!document.fullscreenElement);
      // Pengecekan pertama kali (saat re-render setelah refresh)
      checkFs();
      document.addEventListener('fullscreenchange', checkFs);
      return () => document.removeEventListener('fullscreenchange', checkFs);
  }, []);

  // EFFECT 6: TRACK PELANGGARAN (TAB SWITCH & BLUR)
  useEffect(() => {
    if (!activeExam || examFinished) return;

    const handleVisibilityChange = () => {
      // Jika pengguna berpindah tab atau mengecilkan browser
      if (document.hidden) setIsViolating(true);
    };

    const handleWindowBlur = () => {
      // Jika pengguna mengklik aplikasi lain di luar jendela browser ini
      setIsViolating(true);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [activeExam, examFinished]);

  const finishExam = async () => {
    if (!resultId) return;
    let totalScore = 0;
    
    processedQuestions.forEach(q => {
      const userAns = answers[q.id];
      const originalQuestion = questions.find(oq => oq.id === q.id); 
      if (!originalQuestion) return;

      if (q.type === 'single') {
         const correct = originalQuestion.correctAnswer || [];
         if (userAns && userAns.length > 0 && correct.includes(userAns[0])) {
           totalScore += 1;
         }
      } 
      else if (q.type === 'multiple') {
         const u = (userAns || []).sort();
         const c = [...(originalQuestion.correctAnswer || [])].sort();
         if (c.length > 0 && JSON.stringify(u) === JSON.stringify(c)) totalScore += 1;
      }
      else if (q.type === 'true_false') {
         const statements = originalQuestion.trueFalseStatements || [];
         const isAllCorrect = statements.every(st => {
             return userAns && userAns[st.id] === st.correct;
         });
         
         if (statements.length > 0 && isAllCorrect) {
            totalScore += 1;
         }
      }
    });

    const finalScore = (totalScore / processedQuestions.length) * 100;
    setScore(finalScore);
    setExamFinished(true);
    
    const storageKey = `exam_data_${currentUser.id}_${activeExam.id}`;
    localStorage.removeItem(storageKey);

    if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(err => console.log(err));
    }
    
    try {
        await setDoc(getDocRef('results', resultId), {
            status: 'finished',
            score: finalScore,
            answeredCount: Object.keys(answers).length
        }, { merge: true });
    } catch(e) { console.error(e); }
  };

  const handleAnswer = async (value, type, subId = null) => {
    if(examFinished || !resultId) return;
    const currentQ = processedQuestions[currentQuestionIndex];
    const curr = answers[currentQ.id];
    let next;

    if (type === 'single') {
        next = [value];
    } else if (type === 'multiple') {
        const c = curr || [];
        next = c.includes(value) ? c.filter(id=>id!==value) : [...c, value];
    } else if (type === 'true_false') {
        next = { ...(curr || {}), [subId]: value };
    }
    
    const newAnswers = {...answers, [currentQ.id]: next};
    setAnswers(newAnswers);

    try {
        await setDoc(getDocRef('results', resultId), {
            answeredCount: Object.keys(newAnswers).length
        }, { merge: true });
    } catch(e) { console.error(e); }
  };

  if (!activeExam) return (<div className="h-screen flex flex-col items-center justify-center bg-gray-50"><div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md"><div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4"><StopCircle size={32} /></div><h2 className="text-xl font-bold text-gray-800">Tidak Ada Ujian Aktif</h2><p className="text-gray-500 mb-6">Halo, {currentUser.name}. Saat ini belum ada ujian yang aktif.</p><button onClick={onBack} className="px-6 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-lg transition">Kembali ke Beranda</button></div></div>);
  
  if (attemptError) {
      return (
        <div className="h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
            <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md w-full border-t-4 border-red-500">
                <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <StopHand size={32} />
                </div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">Batas Mengerjakan Habis</h2>
                <p className="text-gray-600 mb-6">{attemptError}</p>
                <div className="text-xs text-gray-400 mb-6 bg-gray-100 p-3 rounded">
                    Anda tidak diizinkan mengulang ujian ini lagi.
                </div>
                <button onClick={onLogout} className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 text-white flex justify-center items-center rounded-lg transition font-bold">
                    <LogOut size={20} className="mr-2" /> Keluar Aplikasi
                </button>
            </div>
        </div>
      );
  }

  if (sessionError) {
      return (
        <div className="h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
            <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md w-full border-t-4 border-yellow-500">
                <div className="w-16 h-16 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock3 size={32} />
                </div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">Akses Dibatasi</h2>
                <p className="text-gray-600 mb-6">{sessionError}</p>
                <div className="text-xs text-gray-400 mb-6 bg-gray-100 p-3 rounded">
                    Silakan hubungi proktor jika Anda merasa ini adalah kesalahan.
                </div>
                <button onClick={onBack} className="w-full px-6 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-lg transition font-medium">
                    Kembali ke Beranda
                </button>
            </div>
        </div>
      );
  }

  if (processedQuestions.length === 0) return <div className="h-screen flex items-center justify-center bg-gray-50 text-gray-600 font-medium">Memuat Soal...</div>;

  if (examFinished) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white max-w-lg w-full rounded-xl shadow-lg p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4"/>
          <h2 className="text-2xl font-bold mb-2">Ujian Selesai!</h2>
          <p className="text-gray-500 mb-4">Terima kasih, {currentUser.name}.</p>
          <div className="bg-blue-50 p-6 rounded mb-6"><span className="text-sm font-bold text-blue-600 uppercase">Nilai Akhir</span><div className="text-5xl font-bold text-blue-800 mt-2">{score.toFixed(1)}</div></div>
          <button onClick={onLogout} className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded font-bold transition flex items-center justify-center">
             <LogOut size={20} className="mr-2" /> Keluar Aplikasi
          </button>
        </div>
      </div>
    );
  }

  // TAMPILAN LOCKDOWN PELANGGARAN MERAH (Pindah Tab / Buka Aplikasi Lain)
  if (isViolating && !examFinished) {
    return (
        <div className="h-screen flex flex-col items-center justify-center bg-gray-900 p-4 z-50 fixed inset-0">
            <div className="bg-white p-8 rounded-xl shadow-2xl text-center max-w-md w-full border-t-8 border-red-600 animate-pulse">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="w-10 h-10 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Pelanggaran Terdeteksi!</h2>
                <p className="text-gray-600 mb-6">Anda terdeteksi membuka tab lain atau beralih ke aplikasi lain di luar area ujian. <br/><br/><strong>Harap berfokus pada halaman ini.</strong></p>
                <button
                    onClick={() => {
                        document.documentElement.requestFullscreen().then(() => {
                            setIsViolating(false);
                        }).catch(e => setIsViolating(false));
                    }}
                    className="w-full px-6 py-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold transition flex justify-center items-center text-lg shadow-lg hover:shadow-xl"
                >
                    <Maximize size={24} className="mr-2" /> Kembali ke Ujian
                </button>
            </div>
        </div>
    );
  }

  // TAMPILAN NETRAL UNTUK REFRESH (Karena browser mematikan fullscreen saat direfresh)
  if (!isFullscreen && !examFinished) {
    return (
        <div className="h-screen flex flex-col items-center justify-center bg-gray-900 p-4 z-50 fixed inset-0 backdrop-blur-sm bg-opacity-95">
            <div className="bg-white p-8 rounded-xl shadow-2xl text-center max-w-md w-full border-t-8 border-blue-600">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Maximize className="w-10 h-10 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Layar Penuh Diperlukan</h2>
                <p className="text-gray-600 mb-6">Ujian harus dikerjakan dalam mode layar penuh (Fullscreen). Hal ini juga biasa muncul apabila Anda me-refresh halaman.<br/><br/>Klik tombol di bawah untuk melanjutkan.</p>
                <button
                    onClick={() => {
                        document.documentElement.requestFullscreen().catch(e => console.log("Perlu izin pengguna"));
                    }}
                    className="w-full px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition flex justify-center items-center text-lg shadow-lg hover:shadow-xl"
                >
                    <Maximize size={24} className="mr-2" /> Lanjutkan Ujian
                </button>
            </div>
        </div>
    );
  }

  const currentQuestion = processedQuestions[currentQuestionIndex];
  const currentAns = answers[currentQuestion.id];

  // Pengecekan apakah soal ini memiliki stimulus yang valid untuk ditampilkan
  const hasStimulus = currentQuestion?.stimulus && (
      (currentQuestion.stimulus.title && currentQuestion.stimulus.title.trim() !== '') ||
      (currentQuestion.stimulus.content && currentQuestion.stimulus.content.trim() !== '') ||
      (currentQuestion.stimulus.image && currentQuestion.stimulus.image.trim() !== '')
  );

  return (
    // Gunakan h-[100dvh] untuk mobile browser (address bar issue)
    <div className="flex flex-col h-screen h-[100dvh] bg-gray-100 font-sans text-gray-800 overflow-hidden">
      <header className="bg-[#2d3748] text-white h-16 flex items-center justify-between px-4 shadow z-20 shrink-0">
        <div className="flex items-center space-x-4"><div className="bg-blue-600 w-10 h-10 rounded flex items-center justify-center font-bold text-xl">A</div><div><h1 className="font-semibold text-lg">{activeExam.title}</h1><p className="text-xs text-gray-400">Peserta: {currentUser.name} ({currentUser.class || '-'}) - Sesi {currentUser.session || '1'}</p></div></div>
        <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center bg-gray-700 px-3 py-1.5 rounded-full border border-gray-600 font-mono"><Clock className="w-4 h-4 mr-2 text-yellow-400" />{Math.floor(timeLeft/60).toString().padStart(2,'0')}:{(timeLeft%60).toString().padStart(2,'0')}</div>
            {/* Tombol Menu Mobile */}
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="md:hidden p-2 rounded hover:bg-gray-700"><Menu/></button>
        </div>
      </header>
      
      {/* Timer Floating untuk Mobile */}
      <div className="md:hidden bg-yellow-100 text-yellow-800 text-center text-xs font-bold py-1 border-b border-yellow-200">
        Sisa Waktu: {Math.floor(timeLeft/60).toString().padStart(2,'0')}:{(timeLeft%60).toString().padStart(2,'0')}
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        <main className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Stimulus Section (Kiri/Atas) - Hanya tampil jika ada stimulus */}
          {hasStimulus && (
            <div className="md:w-1/2 w-full h-1/2 md:h-full overflow-y-auto border-r bg-white p-6">
                <div className="max-w-3xl mx-auto">
                    {currentQuestion.category && <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-full mb-4 inline-block">{currentQuestion.category}</span>}
                    {currentQuestion.stimulus.title && <h2 className="text-xl font-bold mb-4">{currentQuestion.stimulus.title}</h2>}
                    {currentQuestion.stimulus.image && (<div className="mb-4 rounded-lg overflow-hidden border"><img src={getOptimizedImageUrl(currentQuestion.stimulus.image)} className="w-full h-auto" alt="Stimulus"/></div>)}
                    {currentQuestion.stimulus.content && <div className="prose prose-blue text-gray-700 leading-relaxed text-lg"><FormattedText text={currentQuestion.stimulus.content}/></div>}
                </div>
            </div>
          )}

          {/* Soal Section (Kanan/Bawah) - Melebar penuh jika stimulus kosong */}
          <div className={`${hasStimulus ? 'md:w-1/2 h-1/2 md:h-full' : 'w-full h-full'} w-full overflow-y-auto bg-[#f7fafc] p-6`}>
              <div className={`${hasStimulus ? 'max-w-2xl' : 'max-w-4xl'} mx-auto pb-20`}>
                  <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-500">Soal No. {currentQuestionIndex + 1}</span>
                          {!hasStimulus && currentQuestion.category && <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-bold rounded-full">{currentQuestion.category}</span>}
                      </div>
                      <span className="text-xs px-2 py-1 rounded bg-gray-200 uppercase">{currentQuestion.type.replace('_', ' ')}</span>
                  </div>
                  <div className="text-lg font-medium mb-6"><FormattedText text={currentQuestion.question}/></div>
                  <div className="space-y-3">
                      
                      {/* RENDER PILIHAN GANDA / KOMPLEKS */}
                      {(currentQuestion.type === 'single' || currentQuestion.type === 'multiple') && currentQuestion.options.map(opt => {
                          const sel = (currentAns || []).includes(opt.id); 
                          return (
                              <div key={opt.id} onClick={()=>handleAnswer(opt.id, currentQuestion.type)} className={`flex p-4 rounded border-2 cursor-pointer ${sel?'border-blue-500 bg-blue-50':'border-gray-200 bg-white'}`}>
                                  <div className={`w-6 h-6 flex items-center justify-center border-2 mr-4 ${currentQuestion.type==='multiple'?'rounded':'rounded-full'} ${sel?'bg-blue-500 border-blue-500 text-white':'border-gray-300'}`}>
                                      {sel && (currentQuestion.type==='multiple'?<CheckCircle size={14}/>:<div className="w-2.5 h-2.5 bg-white rounded-full"/>)}
                                      {!sel && <span className="text-xs font-bold text-gray-400">{activeExam.randomizeOptions ? '-' : opt.id}</span>}
                                  </div>
                                  <span className="flex-1 text-sm md:text-base"><FormattedText text={opt.text}/></span>
                              </div>
                          )
                      })}

                      {/* RENDER BENAR / SALAH */}
                      {currentQuestion.type === 'true_false' && (
                        <div className="overflow-x-auto bg-white rounded shadow border">
                           <table className="w-full text-sm text-left">
                             <thead className="bg-gray-100 font-bold text-gray-600"><tr><th className="p-3">Pernyataan</th><th className="p-3 w-20 text-center">Benar</th><th className="p-3 w-20 text-center">Salah</th></tr></thead>
                             <tbody className="divide-y">
                               {(currentQuestion.trueFalseStatements || []).map(st => (
                                 <tr key={st.id}>
                                   <td className="p-3"><FormattedText text={st.text}/></td>
                                   <td className="p-3 text-center">
                                     <input 
                                       type="radio" 
                                       name={`tf-${st.id}`} 
                                       checked={(currentAns || {})[st.id] === true} 
                                       onChange={() => handleAnswer(true, 'true_false', st.id)} 
                                       className="w-5 h-5 accent-blue-600 cursor-pointer"
                                     />
                                   </td>
                                   <td className="p-3 text-center">
                                     <input 
                                       type="radio" 
                                       name={`tf-${st.id}`} 
                                       checked={(currentAns || {})[st.id] === false} 
                                       onChange={() => handleAnswer(false, 'true_false', st.id)} 
                                       className="w-5 h-5 accent-blue-600 cursor-pointer"
                                     />
                                   </td>
                                 </tr>
                               ))}
                             </tbody>
                           </table>
                        </div>
                      )}

                  </div>
              </div>
          </div>
        </main>

        {/* Sidebar Navigasi Soal */}
        <div className={`fixed inset-y-0 right-0 z-30 w-72 bg-white shadow-2xl transform transition-transform border-l flex flex-col ${isSidebarOpen || window.innerWidth >= 768 ? 'translate-x-0' : 'translate-x-full md:translate-x-0'} md:relative md:w-80 md:shadow-none`}>
            <div className="p-4 border-b flex justify-between bg-gray-50 font-bold text-gray-700">
                <span>Daftar Soal</span>
                <button onClick={()=>setIsSidebarOpen(false)} className="md:hidden"><X/></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 grid grid-cols-5 gap-2 content-start">
                {processedQuestions.map((q, idx) => {
                    // Logic Cek Jawaban:
                    let hasAns = false;
                    const ansData = answers[q.id];
                    if (q.type === 'single' || q.type === 'multiple') {
                        hasAns = ansData && ansData.length > 0;
                    } else if (q.type === 'true_false') {
                        hasAns = ansData && Object.keys(ansData).length > 0;
                    }

                    const active = currentQuestionIndex === idx; 
                    const ragu = raguRagu[q.id]; 
                    let cls = "border bg-white"; 
                    if(active) cls="border-blue-600 bg-blue-50 ring-2 ring-blue-100 text-blue-700 font-bold"; 
                    else if(ragu) cls="bg-yellow-100 border-yellow-400 text-yellow-700"; 
                    else if(hasAns) cls="bg-gray-800 border-gray-800 text-white"; 
                    return <button key={q.id} onClick={()=>{setCurrentQuestionIndex(idx); setIsSidebarOpen(false)}} className={`h-10 rounded text-sm relative ${cls}`}>{idx+1}{ragu&&<span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-yellow-400 rounded-full border border-white"/>}</button>
                })}
            </div>
            <div className="p-4 border-t bg-gray-50">
                <button onClick={finishExam} className="w-full py-2.5 bg-red-600 text-white rounded font-bold">Selesai Ujian</button>
            </div>
        </div>
      </div>
      <footer className="bg-white border-t h-16 flex items-center justify-between px-4 z-20 shrink-0">
          <button onClick={()=>setCurrentQuestionIndex(p=>p-1)} disabled={currentQuestionIndex===0} className="flex items-center px-4 py-2 border rounded disabled:opacity-50 text-sm">
              <ChevronLeft className="mr-1 w-4 h-4"/> <span className="hidden md:inline">Sebelumnya</span>
          </button>
          
          <label className="flex items-center cursor-pointer select-none">
              <input type="checkbox" className="sr-only" checked={raguRagu[currentQuestion.id]||false} onChange={()=>setRaguRagu({...raguRagu,[currentQuestion.id]:!raguRagu[currentQuestion.id]})}/>
              <div className={`w-10 h-6 rounded-full transition ${raguRagu[currentQuestion.id]?'bg-yellow-400':'bg-gray-300'}`}/>
              <span className="ml-2 font-medium text-sm">Ragu-ragu</span>
          </label>
          
          {currentQuestionIndex<processedQuestions.length-1 ? 
              <button onClick={()=>setCurrentQuestionIndex(p=>p+1)} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded text-sm">
                  <span className="hidden md:inline">Selanjutnya</span> <ChevronRight className="ml-1 w-4 h-4"/>
              </button> : 
              <button onClick={finishExam} className="flex items-center px-4 py-2 bg-green-600 text-white rounded text-sm">
                  Selesai <CheckCircle className="ml-1 w-4 h-4"/>
              </button>
          }
      </footer>
    </div>
  );
};

// --- STUDENT DASHBOARD (KODE UJIAN) ---
const StudentDashboard = ({ questions, exams, currentUser, onLogout, results }) => {
    // Membaca local storage secara sinkron pada saat komponen pertama kali diinisialisasi
    // Hal ini berguna untuk mem-bypass splash screen seketika saat halamannya di-refresh
    const [selectedExamId, setSelectedExamId] = useState(() => {
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(`exam_data_${currentUser.id}_`)) {
                const examId = key.split('_')[3]; // mendapatkan id ujian
                // Validasi: Pastikan ujian yang di-resume ini MASIH AKTIF
                const match = exams.find(e => e.id === examId);
                if (match && match.isActive) {
                    return examId;
                }
            }
        }
        return null;
    });
    
    const [inputCode, setInputCode] = useState('');
    const [error, setError] = useState('');

    // Fallback Cek Firebase (Hanya jika belum ketemu di local storage)
    useEffect(() => {
        if (!selectedExamId) {
            const ongoing = results.find(r => r.studentId === currentUser.id && r.status === 'ongoing');
            if (ongoing) {
                // Validasi: Pastikan ujian yang di-resume ini MASIH AKTIF
                const match = exams.find(e => e.id === ongoing.examId);
                if (match && match.isActive) {
                    setSelectedExamId(ongoing.examId);
                }
            }
        }
    }, [results, currentUser.id, selectedExamId, exams]);

    const handleJoin = () => {
        if (!inputCode.trim()) return;
        const match = exams.find(e => e.examCode === inputCode.trim().toUpperCase() && e.isActive);
        if (match) {
            setError('');
            setSelectedExamId(match.id);
        } else {
            setError('Kode ujian tidak valid atau ujian belum dimulai.');
        }
    };

    if (selectedExamId) {
        const examObj = exams.find(e => e.id === selectedExamId);
        if (!examObj) return <div className="p-10 text-center">Ujian tidak ditemukan. <button onClick={()=>setSelectedExamId(null)} className="text-blue-500 underline ml-2">Kembali</button></div>;
        
        return <StudentExam
            questions={questions}
            activeExam={examObj}
            currentUser={currentUser}
            onLogout={onLogout}
            results={results}
            onBack={() => { setSelectedExamId(null); setInputCode(''); }}
        />;
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 relative">
            <div className="absolute top-4 right-4 flex gap-4">
                <button onClick={toggleFullScreen} className="p-2 bg-white border border-gray-200 shadow-sm rounded-full hover:bg-gray-100 text-gray-600"><Maximize size={20}/></button>
                <button onClick={onLogout} className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 font-bold text-sm shadow-sm transition">Keluar</button>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                    <Key className="w-10 h-10 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold mb-2 text-gray-800">Selamat Datang, {currentUser.name}</h2>
                <p className="text-gray-500 mb-8 text-sm px-4">Silakan masukkan <strong>Kode Ujian (Token)</strong> untuk mulai mengerjakan soal.</p>
                
                <input
                    type="text"
                    value={inputCode}
                    onChange={e => setInputCode(e.target.value.toUpperCase())}
                    onKeyDown={e => e.key === 'Enter' && handleJoin()}
                    placeholder="KODE UJIAN"
                    className="w-full text-center text-3xl tracking-[0.2em] font-bold p-4 border-2 rounded-xl mb-4 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none uppercase transition-all"
                />
                
                {error && (
                    <div className="mb-4 text-red-600 bg-red-50 p-3 rounded-lg text-sm border border-red-100 flex items-center">
                        <AlertCircle size={18} className="mr-2 shrink-0"/> {error}
                    </div>
                )}
                
                <button onClick={handleJoin} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md mt-2 text-lg flex justify-center items-center">
                    Mulai Ujian <ChevronRight size={20} className="ml-2"/>
                </button>
            </div>
        </div>
    );
};

// --- APP UTAMA ---
export default function App() {
  useTailwind(); // Inject Tailwind otomatis
  
  const [user, setUser] = useState(() => {
    // Cek status login saat halaman pertama kali dimuat (mencegah logout saat refresh)
    try {
      const savedUser = localStorage.getItem('simase_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch(e) { return null; }
  });
  const [firebaseUser, setFirebaseUser] = useState(null);

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (error) {
        console.error("Auth Error:", error);
      }
    };
    initAuth();
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
    });
    return () => unsubscribe();
  }, []);

  const { data: questions, loading: qLoading } = useFirestoreCollection('questions', firebaseUser);
  const { data: exams, loading: eLoading } = useFirestoreCollection('exams', firebaseUser);
  const { data: students, loading: sLoading } = useFirestoreCollection('students', firebaseUser);
  const { data: results } = useFirestoreCollection('results', firebaseUser);
  const { data: admins, loading: aLoading } = useFirestoreCollection('admins', firebaseUser);
  const { data: contributors, loading: cLoading } = useFirestoreCollection('contributors', firebaseUser);
  const { data: principals, loading: pLoading } = useFirestoreCollection('principals', firebaseUser);
  const { data: settingsData, loading: setLoading } = useFirestoreCollection('settings', firebaseUser);

  const loading = qLoading || eLoading || sLoading || aLoading || cLoading || pLoading || setLoading;
  const identity = (settingsData || []).find(s => s.id === 'identity') || {};
  
  // Mengambil Master Data (Metadata) untuk Mapel dan Kategori Soal
  const metadata = (settingsData || []).find(s => s.id === 'metadata') || {
      subjects: ['Matematika', 'Bahasa Indonesia', 'Bahasa Inggris', 'IPA', 'IPS', 'Umum'],
      categories: ['Literasi Membaca', 'Numerasi', 'Literasi Sains', 'Survei Karakter', 'Pilihan Ganda Biasa'],
      classes: ['X', 'XI', 'XII']
  };

  const handleLogin = (role, userData) => {
    const newUser = { role, ...userData };
    setUser(newUser);
    // Simpan status login ke LocalStorage
    localStorage.setItem('simase_user', JSON.stringify(newUser));
  };

  const handleLogout = () => {
    setUser(null);
    // Hapus status login dari LocalStorage
    localStorage.removeItem('simase_user');
  };

  if (!user) return <LoginScreen onLogin={handleLogin} students={students} admins={admins} contributors={contributors} principals={principals} loading={loading} isAuthReady={!!firebaseUser} />;
  
  if (loading) {
      return (
          <div className="h-screen flex flex-col items-center justify-center bg-gray-50">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mb-4"></div>
              <p className="text-gray-500 font-medium">Memuat data dari server...</p>
          </div>
      );
  }

  // Render Dashboard Admin untuk Admin (Full) atau Contributor (Limited) atau Principal (Monitoring)
  if (user.role === 'admin' || user.role === 'contributor' || user.role === 'principal') return <AdminDashboard 
    questions={questions} 
    exams={exams} 
    students={students} 
    results={results}
    contributors={contributors}
    principals={principals}
    identity={identity}
    metadata={metadata}
    onLogout={handleLogout} 
    userRole={user.role} 
  />;

  if (user.role === 'student') return <StudentDashboard 
    questions={questions} 
    exams={exams}
    currentUser={user}
    onLogout={handleLogout}
    results={results}
  />;
}