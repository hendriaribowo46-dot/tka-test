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
  onAuthStateChanged 
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
const Upload = (p) => <IconWrapper {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></IconWrapper>;
const Activity = (p) => <IconWrapper {...p}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></IconWrapper>;
const Printer = (p) => <IconWrapper {...p}><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></IconWrapper>;
const Database = (p) => <IconWrapper {...p}><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></IconWrapper>;
const UserPlus = (p) => <IconWrapper {...p}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/></IconWrapper>;
const Maximize = (p) => <IconWrapper {...p}><path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/></IconWrapper>;
const Filter = (p) => <IconWrapper {...p}><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></IconWrapper>;

// --- KONFIGURASI FIREBASE ---
const firebaseConfig = {
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
    }
    .print-header { display: none; }
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
      id: "q1", type: 'single', category: 'Literasi Membaca',
      stimulus: { title: 'Lebah dan Bunga', image: '', content: `Di sebuah taman yang indah, hiduplah seekor lebah bernama Biba. Biba sangat rajin mengumpulkan nektar dari bunga-bunga yang bermekaran. Suatu hari, Biba bertemu dengan seekor kupu-kupu yang sedang bersedih karena sayapnya terluka.\n\n"Mengapa kau menangis, teman?" tanya Biba.\n"Sayapku tersangkut ranting, aku tidak bisa terbang pulang," jawab kupu-kupu.\n\nTanpa berpikir panjang, Biba membantu melepaskan sayap kupu-kupu itu dengan hati-hati.` },
      question: "Apa sifat utama yang dimiliki oleh Biba berdasarkan cerita tersebut?",
      options: [{ id: 'A', text: 'Pemalas dan sombong' }, { id: 'B', text: 'Penolong dan rajin' }, { id: 'C', text: 'Penakut dan pemalu' }, { id: 'D', text: 'Cerdik tapi licik' }],
      correctAnswer: ['B']
    },
    {
      id: "q2", type: 'multiple', category: 'Numerasi',
      stimulus: { title: 'Belanja Buah', image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&q=80&w=1000', content: `Ibu pergi ke pasar untuk membeli buah-buahan. Perhatikan gambar ilustrasi pasar buah di atas.\n\nBerikut adalah daftar harga buah per kilogram:\n- Apel: Rp 25.000\n- Jeruk: Rp 15.000\n- Mangga: Rp 20.000\n- Anggur: Rp 40.000\n\nIbu membawa uang sebesar Rp 100.000.` },
      question: "Manakah pernyataan yang BENAR? (Pilih lebih dari satu jawaban)",
      options: [{ id: 'A', text: 'Harga 2 kg Jeruk lebih murah daripada 1 kg Anggur.' }, { id: 'B', text: 'Dengan uang Rp 50.000, Ibu bisa membeli 1 kg Apel dan 1 kg Mangga.' }, { id: 'C', text: 'Harga 1 kg Apel sama dengan harga 2 kg Jeruk.' }, { id: 'D', text: 'Jika Ibu membeli 1 kg Anggur dan 2 kg Mangga, uangnya masih sisa.' }],
      correctAnswer: ['A', 'B']
    },
    {
      id: "q3", type: 'true_false', category: 'Literasi Sains',
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
    { id: "s1", name: 'Siswa Contoh', username: 'siswa', password: '123' }
  ],
  exams: [
    {
      id: "e1", title: 'Simulasi ANBK Lengkap', duration: 30,
      questionIds: ["q1", "q2", "q3"], randomizeQuestions: false, randomizeOptions: false, isActive: true
    }
  ],
  admins: [
    { id: "a1", name: "Administrator", username: "admin", password: "admin123" } 
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
const QuestionEditor = ({ qForm, setQForm, onSave, onCancel }) => {
  
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
          <div className="flex gap-2">
            <div className="w-1/2">
              <input 
                list="category-list"
                value={qForm.category} 
                onChange={e => setQForm(prev => ({...prev, category: e.target.value}))} 
                className="w-full p-2 border rounded" 
                placeholder="Kategori"
              />
              <datalist id="category-list">
                <option value="Literasi Membaca" />
                <option value="Numerasi" />
                <option value="Literasi Sains" />
                <option value="Survei Karakter" />
                <option value="Umum" />
              </datalist>
            </div>
            <select 
              value={qForm.type} 
              onChange={e => setQForm(prev => ({...prev, type: e.target.value}))} 
              className="w-1/2 p-2 border rounded"
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
          
          {/* EDITOR PILIHAN GANDA / KOMPLEKS */}
          {(qForm.type === 'single' || qForm.type === 'multiple') && (
            <div className="bg-gray-50 p-4 rounded border">
              <h4 className="font-bold text-sm mb-3 text-gray-500 uppercase">Opsi Jawaban</h4>
              {qForm.options.map((opt, idx) => (
                <div key={idx} className="flex items-center mb-2">
                  <span className="w-8 font-bold text-gray-500">{opt.id}.</span>
                  <input 
                    value={opt.text} 
                    onChange={e => {
                      const val = e.target.value;
                      setQForm(prev => {
                        const newOptions = [...prev.options];
                        newOptions[idx] = { ...newOptions[idx], text: val };
                        return { ...prev, options: newOptions };
                      });
                    }} 
                    className="flex-1 p-2 border rounded mr-2" 
                    placeholder={`Opsi ${opt.id}`}
                  />
                  <input 
                    type={qForm.type === 'single' ? 'radio' : 'checkbox'} 
                    checked={qForm.correctAnswer.includes(opt.id)} 
                    onChange={() => {
                      setQForm(prev => {
                        let nc;
                        if (prev.type === 'single') nc = [opt.id];
                        else nc = prev.correctAnswer.includes(opt.id) ? prev.correctAnswer.filter(c => c !== opt.id) : [...prev.correctAnswer, opt.id];
                        return { ...prev, correctAnswer: nc };
                      });
                    }} 
                    className="w-5 h-5 accent-green-600 cursor-pointer"
                  />
                </div>
              ))}
            </div>
          )}

          {/* EDITOR BENAR / SALAH */}
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

const MonitoringView = ({ activeExam, results, students }) => {
    if (!activeExam) return <div className="p-10 text-center text-gray-500">Tidak ada ujian yang sedang aktif.</div>;
    const date = new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const currentResults = results.filter(r => r.examId === activeExam.id);

    const handleReset = async (resultId) => {
        if (window.confirm("Reset progres siswa ini?")) {
          await deleteDoc(getDocRef('results', resultId));
        }
    };

    return (
      <div className="space-y-6 print-container">
        <div className="print-header"><h1>LAPORAN HASIL UJIAN</h1><p>{activeExam.title}</p><p>Tanggal: {date}</p></div>
        <div className="flex justify-between items-center no-print">
           <div><h2 className="text-2xl font-bold">Pemantauan</h2><p className="text-gray-500">Ujian Aktif: <strong>{activeExam.title}</strong></p></div>
           <button onClick={() => window.print()} className="flex items-center bg-gray-800 text-white px-4 py-2 rounded shadow-sm"><Printer size={16} className="mr-2"/> Cetak</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 print-container">
           <div className="bg-white p-4 rounded-lg shadow border-l-4 border-gray-300 print-card"><div className="text-gray-500 text-sm">Total Peserta</div><div className="text-2xl font-bold">{students.length}</div></div>
           <div className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500 print-card"><div className="text-gray-500 text-sm">Sedang Mengerjakan</div><div className="text-2xl font-bold text-blue-600">{currentResults.filter(r => r.status === 'ongoing').length}</div></div>
           <div className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500 print-card"><div className="text-gray-500 text-sm">Selesai</div><div className="text-2xl font-bold text-green-600">{currentResults.filter(r => r.status === 'finished').length}</div></div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden border print-container print-card overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[600px]">
            <thead className="bg-gray-50 text-gray-700 font-bold border-b"><tr><th className="p-4">Nama Siswa</th><th className="p-4">Status</th><th className="p-4 w-1/3 no-print">Progres</th><th className="p-4 text-center">Nilai</th><th className="p-4 text-center no-print">Aksi</th></tr></thead>
            <tbody className="divide-y">
              {students.map(s => {
                const res = currentResults.find(r => r.studentId === s.id);
                const status = res ? res.status : 'not_started';
                const total = activeExam.questionIds.length;
                const answered = res ? res.answeredCount : 0;
                const percent = total > 0 ? (answered / total) * 100 : 0;
                
                return (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="p-4 font-medium">{s.name} <br/><span className="text-xs text-gray-400 no-print">{s.username}</span></td>
                    <td className="p-4">
                      {status === 'not_started' && <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">Belum Login</span>}
                      {status === 'ongoing' && <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded text-xs">Mengerjakan...</span>}
                      {status === 'finished' && <span className="px-2 py-1 bg-green-100 text-green-600 rounded text-xs font-bold">Selesai</span>}
                    </td>
                    <td className="p-4 no-print"><div className="flex items-center gap-2"><div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden border border-gray-300"><div className={`h-full rounded-full transition-all duration-500 ${status === 'finished' ? 'bg-green-500' : 'bg-blue-500'}`} style={{ width: `${percent}%` }}></div></div><span className="text-xs font-mono">{answered}/{total}</span></div></td>
                    <td className="p-4 text-center">{status === 'finished' ? <span className="font-bold text-lg text-gray-800">{res.score.toFixed(1)}</span> : <span className="text-gray-400">-</span>}</td>
                    <td className="p-4 text-center no-print">{res && <button onClick={() => handleReset(res.id)} className="text-red-600 hover:bg-red-50 px-2 py-1 rounded text-xs border border-red-200">Reset</button>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
};

// --- LOGIN SCREEN ---
const LoginScreen = ({ onLogin, students, admins, loading, isAuthReady }) => {
  const [view, setView] = useState('select'); // 'select' | 'form'
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
    e.preventDefault();
    if (loading || !isAuthReady) return;
    setError('');
    setSuccessMsg('');

    // Trigger Full Screen saat tombol submit ditekan
    if (role === 'student') {
        toggleFullScreen();
    }

    if (role === 'student') {
      const student = students.find(s => s.username === formData.username && s.password === formData.password);
      if (student) {
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
        if (admin) {
          onLogin('admin', admin);
        } else {
          setError('Username atau Password salah!');
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-gray-900 flex items-center justify-center p-4 font-sans">
      {/* Tombol Fullscreen Manual (Pojok Kanan Atas) */}
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
            <div className="space-y-4">
              <button onClick={() => handleRoleSelect('student')} disabled={loading || !isAuthReady} className="w-full p-4 bg-white border-2 border-blue-100 hover:border-blue-500 rounded-xl flex items-center transition-all hover:shadow-md disabled:opacity-50">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4"><Users className="text-blue-600"/></div>
                <div className="text-left"><h3 className="font-bold">Siswa</h3><p className="text-xs text-gray-500">{loading ? 'Memuat data...' : 'Login untuk ujian'}</p></div>
              </button>
              <button onClick={() => handleRoleSelect('admin')} disabled={!isAuthReady} className="w-full p-4 bg-white border-2 border-gray-100 hover:border-gray-500 rounded-xl flex items-center transition-all hover:shadow-md disabled:opacity-50">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mr-4"><Settings className="text-gray-600"/></div>
                <div className="text-left"><h3 className="font-bold">Admin</h3><p className="text-xs text-gray-500">Kelola sistem</p></div>
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="text-gray-500 mb-6">
              {role === 'student' ? "Login Peserta Ujian" : (isRegistering ? "Buat Akun Admin Baru" : "Login Administrator")}
            </p>
            
            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              {role === 'admin' && isRegistering && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                  <div className="relative">
                    <UserPlus className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
                    <input 
                      type="text"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
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
                    value={formData.username}
                    onChange={e => setFormData({...formData, username: e.target.value})}
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
                    value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})}
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

              <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 transition disabled:bg-gray-400">
                {loading ? 'Memuat...' : (isRegistering ? 'Daftar' : 'Masuk & Fullscreen')}
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
            </form>
          </>
        )}
      </div>
    </div>
  );
};

// --- ADMIN DASHBOARD ---
const AdminDashboard = ({ 
  questions, exams, students, results,
  onLogout 
}) => {
  const [activeTab, setActiveTab] = useState('questions'); 
  const [categoryFilter, setCategoryFilter] = useState('Semua'); // NEW: Filter State
  const [examView, setExamView] = useState('list');
  const fileInputRef = useRef(null);
  
  // FIX: Definisi activeExam yang hilang sebelumnya
  const activeExam = exams.find(e => e.isActive);

  // Forms State
  const [isEditingQ, setIsEditingQ] = useState(false);
  const [qForm, setQForm] = useState(null);
  const [examForm, setExamForm] = useState({ title: '', duration: 60, questionIds: [], randomizeQuestions: false, randomizeOptions: false, isActive: false });
  const [isEditingStudent, setIsEditingStudent] = useState(false);
  const [studentForm, setStudentForm] = useState({ name: '', username: '', password: '' });

  // Filter Logic
  const filteredQuestions = categoryFilter === 'Semua' ? questions : questions.filter(q => q.category === categoryFilter);
  const uniqueCategories = ['Semua', ...new Set(questions.map(q => q.category).filter(Boolean))];

  // --- ACTIONS (FIRESTORE) ---

  // Questions
  const handleEditQ = (q) => { setQForm({ ...q }); setIsEditingQ(true); };
  const handleCreateQ = () => { 
    setQForm({ 
      type: 'single', category: 'Umum', 
      stimulus: {title:'',content:'',image:''}, 
      question:'', 
      options:[{id:'A',text:''},{id:'B',text:''},{id:'C',text:''},{id:'D',text:''}], 
      correctAnswer:[],
      trueFalseStatements: [{id: 's1', text: '', correct: true}] // Init untuk B/S
    }); 
    setIsEditingQ(true); 
  };
  const handleDeleteQ = async (id) => { if(window.confirm('Hapus soal?')) await deleteDoc(getDocRef('questions', id)); };
  const handleSaveQ = async () => { 
    if(!qForm.question) return alert("Pertanyaan wajib diisi!");
    try {
      if (qForm.id) {
        await updateDoc(getDocRef('questions', qForm.id), qForm);
      } else {
        await addDoc(getCollectionRef('questions'), qForm);
      }
      setIsEditingQ(false);
    } catch (e) { alert("Gagal menyimpan: " + e.message); }
  };

  // Exams
  const openExamForm = (e=null) => { 
    setExamForm(e ? {...e} : { title: '', duration: 60, questionIds: [], randomizeQuestions: false, randomizeOptions: false, isActive: false }); 
    setExamView('form'); 
  };
  const handleSaveExam = async () => { 
    if(!examForm.title) return alert("Nama ujian wajib diisi!");
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

  // Students
  const handleSaveStudent = async () => {
    if(!studentForm.username) return alert("Username wajib diisi!");
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

  // Import CSV
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
        if(p.length>=3 && (i>0 || p[1].toLowerCase()!=='username') && !students.some(s=>s.username===p[1])) {
          const newRef = doc(getCollectionRef('students'));
          batch.set(newRef, { name:p[0], username:p[1], password:p[2] });
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

  // SEED DATA FUNCTION
  const handleSeedData = async () => {
    if(!window.confirm("Database Anda akan diisi dengan data contoh (Soal, Siswa, Ujian). Lanjutkan?")) return;
    try {
      const batch = writeBatch(db);
      
      SEED_DATA.questions.forEach(q => {
        const newRef = doc(getCollectionRef('questions'));
        batch.set(newRef, q);
      });
      SEED_DATA.students.forEach(s => {
        const newRef = doc(getCollectionRef('students'));
        batch.set(newRef, s);
      });
      SEED_DATA.exams.forEach(e => {
        const newRef = doc(getCollectionRef('exams'));
        batch.set(newRef, e);
      });
      // Seed Admin juga jika belum ada
      SEED_DATA.admins.forEach(a => {
        const newRef = doc(getCollectionRef('admins'));
        batch.set(newRef, a);
      });
      
      await batch.commit();
      alert("Database berhasil diisi! Silakan login admin dengan username 'admin' dan password 'admin123' atau daftar baru.");
    } catch(e) { alert("Gagal seeding: " + e.message); }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      <PrintStyles />
      <nav className="bg-white border-b px-6 py-4 flex justify-between items-center sticky top-0 z-10 no-print">
        <div className="flex items-center space-x-3"><div className="bg-gray-800 p-2 rounded text-white"><Settings size={20} /></div><h1 className="text-xl font-bold">Panel Admin</h1></div>
        <div className="flex items-center gap-4">
          <button onClick={handleSeedData} className="text-gray-500 hover:text-blue-600 text-xs flex items-center border px-2 py-1 rounded"><Database size={12} className="mr-1"/> Reset & Seed Data Awal</button>
          <button onClick={onLogout} className="text-red-600 font-medium text-sm flex items-center"><LogOut size={16} className="mr-2"/> Keluar</button>
        </div>
      </nav>
      <div className="max-w-6xl mx-auto px-6 mt-6 no-print overflow-x-auto">
        <div className="flex space-x-1 bg-gray-200 p-1 rounded-lg w-max md:w-fit">
          <button onClick={() => setActiveTab('questions')} className={`px-4 py-2 rounded-md text-sm font-medium flex items-center ${activeTab === 'questions' ? 'bg-white shadow' : 'text-gray-600'}`}><List size={16} className="mr-2"/> Bank Soal</button>
          <button onClick={() => setActiveTab('exams')} className={`px-4 py-2 rounded-md text-sm font-medium flex items-center ${activeTab === 'exams' ? 'bg-white shadow' : 'text-gray-600'}`}><Calendar size={16} className="mr-2"/> Paket Ujian</button>
          <button onClick={() => setActiveTab('students')} className={`px-4 py-2 rounded-md text-sm font-medium flex items-center ${activeTab === 'students' ? 'bg-white shadow' : 'text-gray-600'}`}><Users size={16} className="mr-2"/> Peserta</button>
          <button onClick={() => setActiveTab('monitoring')} className={`px-4 py-2 rounded-md text-sm font-medium flex items-center ${activeTab === 'monitoring' ? 'bg-white shadow' : 'text-gray-600'}`}><Activity size={16} className="mr-2"/> Pemantauan</button>
        </div>
      </div>
      <div className="max-w-6xl mx-auto p-6 print-container">
        {activeTab === 'questions' && (isEditingQ ? 
          <QuestionEditor 
            qForm={qForm} 
            setQForm={setQForm} 
            onSave={handleSaveQ} 
            onCancel={() => setIsEditingQ(false)} 
          /> 
          : (
            <>
              <div className="flex justify-between items-center mb-6">
                 <div>
                   <h2 className="text-2xl font-bold">Bank Soal ({questions.length})</h2>
                   <div className="flex items-center mt-2 text-sm text-gray-500 gap-2">
                      <Filter size={14}/> 
                      <span>Filter Kategori:</span>
                      <select className="border rounded p-1" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                        {uniqueCategories.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                   </div>
                 </div>
                 <button onClick={handleCreateQ} className="bg-blue-600 text-white px-4 py-2 rounded flex items-center"><Plus size={18} className="mr-2"/> Tambah Soal</button>
              </div>
              <div className="grid gap-3">{filteredQuestions.map((q, idx) => (
                   <div key={q.id} className="bg-white p-5 rounded-lg border border-gray-200 hover:border-blue-300 shadow-sm transition flex justify-between items-start">
                     <div className="flex-1 pr-6">
                       <div className="flex items-center space-x-2 mb-2">
                         <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs font-bold uppercase">#{idx + 1}</span>
                         <span className="text-xs font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded uppercase">{q.type.replace('_', ' ')}</span>
                         <span className="text-xs text-gray-400 border px-2 py-0.5 rounded">{q.category}</span>
                       </div>
                       <div className="font-semibold line-clamp-2"><FormattedText text={q.question}/></div>
                     </div>
                     <div className="flex gap-2">
                       <button onClick={() => handleEditQ(q)} className="text-blue-600 bg-blue-50 p-2 rounded"><Edit size={16}/></button>
                       <button onClick={() => handleDeleteQ(q.id)} className="text-red-600 bg-red-50 p-2 rounded"><Trash2 size={16}/></button>
                     </div>
                   </div>
                 ))}
                 {filteredQuestions.length === 0 && <div className="text-center py-10 text-gray-400">Tidak ada soal di kategori ini.</div>}
              </div>
            </>
        ))}
        {activeTab === 'exams' && (examView === 'form' ? (
             <div className="bg-white p-6 rounded-lg shadow border">
                <div className="flex justify-between items-center mb-6"><h3 className="text-xl font-bold">{examForm.id ? 'Edit' : 'Baru'} Paket Ujian</h3><button onClick={()=>setExamView('list')}><X/></button></div>
                <div className="grid gap-4 mb-4">
                   <input value={examForm.title} onChange={e=>setExamForm({...examForm, title:e.target.value})} className="border p-2 rounded w-full" placeholder="Nama Ujian"/>
                   <input type="number" value={examForm.duration} onChange={e=>setExamForm({...examForm, duration:parseInt(e.target.value)})} className="border p-2 rounded w-full" placeholder="Durasi (menit)"/>
                   <div className="flex gap-4">
                     <label className="flex items-center"><input type="checkbox" checked={examForm.randomizeQuestions} onChange={e=>setExamForm({...examForm, randomizeQuestions:e.target.checked})} className="mr-2"/> Acak Soal</label>
                     <label className="flex items-center"><input type="checkbox" checked={examForm.randomizeOptions} onChange={e=>setExamForm({...examForm, randomizeOptions:e.target.checked})} className="mr-2"/> Acak Opsi</label>
                   </div>
                </div>
                <div className="border-t pt-4">
                   <div className="flex justify-between mb-2"><p className="font-bold">Pilih Soal:</p><span className="text-xs text-gray-400">{examForm.questionIds.length} terpilih</span></div>
                   <div className="max-h-60 overflow-y-auto border rounded divide-y">
                     {questions.map((q,i)=>(
                       <div key={q.id} onClick={()=>toggleQuestionSelection(q.id)} className={`p-2 flex items-center cursor-pointer hover:bg-gray-50 ${examForm.questionIds.includes(q.id)?'bg-blue-50':''}`}>
                         <input type="checkbox" checked={examForm.questionIds.includes(q.id)} readOnly className="mr-3"/> 
                         <div className="overflow-hidden">
                           <span className="text-xs font-bold text-gray-500 mr-2">[{q.category}]</span>
                           <span className="text-sm truncate">{q.question}</span>
                         </div>
                       </div>
                     ))}
                   </div>
                </div>
                <div className="mt-4 flex justify-end gap-2"><button onClick={()=>setExamView('list')} className="px-4 py-2 border rounded">Batal</button><button onClick={handleSaveExam} className="px-4 py-2 bg-blue-600 text-white rounded">Simpan</button></div>
             </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-6"><h2 className="text-2xl font-bold">Daftar Paket</h2><button onClick={() => openExamForm()} className="bg-green-600 text-white px-4 py-2 rounded flex items-center"><Plus size={18} className="mr-2"/> Buat Baru</button></div>
              <div className="grid gap-4">{exams.map((exam) => {const isActive = exam.isActive; return (<div key={exam.id} className={`bg-white p-6 rounded-lg border-2 ${isActive ? 'border-green-500 shadow-md' : 'border-gray-100'}`}><div className="flex justify-between items-start"><div><h3 className="font-bold text-lg">{exam.title}</h3>{isActive && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded font-bold">AKTIF</span>}<p className="text-sm text-gray-500 mt-1">{exam.duration} Menit • {exam.questionIds.length} Soal</p></div><div className="flex gap-2"><button onClick={() => toggleExamStatus(exam)} className={`px-3 py-1 rounded text-sm font-bold flex items-center ${isActive ? 'bg-red-100 text-red-700' : 'bg-gray-100 hover:bg-green-100 text-gray-700 hover:text-green-700'}`}>{isActive ? <><StopCircle size={14} className="mr-1"/> Stop</> : <><PlayCircle size={14} className="mr-1"/> Mulai</>}</button><button onClick={()=>openExamForm(exam)} className="p-2 text-blue-500"><Edit size={16}/></button><button onClick={()=>handleDeleteExam(exam.id)} className="p-2 text-red-500"><Trash2 size={16}/></button></div></div></div>);})}</div>
            </>
        ))}
        {activeTab === 'students' && (isEditingStudent ? (
             <div className="bg-white p-6 rounded-lg shadow max-w-md mx-auto">
               <h3 className="font-bold mb-4">{studentForm.id ? 'Edit' : 'Tambah'} Siswa</h3>
               <div className="space-y-3">
                 <input value={studentForm.name} onChange={e=>setStudentForm({...studentForm, name:e.target.value})} className="border p-2 w-full rounded" placeholder="Nama"/>
                 <input value={studentForm.username} onChange={e=>setStudentForm({...studentForm, username:e.target.value})} className="border p-2 w-full rounded" placeholder="Username"/>
                 <input value={studentForm.password} onChange={e=>setStudentForm({...studentForm, password:e.target.value})} className="border p-2 w-full rounded" placeholder="Password"/>
               </div>
               <div className="mt-4 flex justify-end gap-2"><button onClick={()=>setIsEditingStudent(false)} className="px-3 py-2 border rounded">Batal</button><button onClick={handleSaveStudent} className="px-3 py-2 bg-blue-600 text-white rounded">Simpan</button></div>
             </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Data Peserta</h2>
                <div className="flex gap-2">
                  <input type="file" accept=".csv" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} />
                  <button onClick={handleImportClick} className="bg-green-600 text-white px-3 py-2 rounded flex items-center text-sm"><Upload size={16} className="mr-2"/> Impor CSV</button>
                  <button onClick={()=> {setStudentForm({name:'', username:'', password:''}); setIsEditingStudent(true);}} className="bg-blue-600 text-white px-3 py-2 rounded flex items-center text-sm"><Plus size={16} className="mr-2"/> Tambah</button>
                </div>
              </div>
              <div className="bg-white shadow rounded-lg overflow-hidden border overflow-x-auto">
                <table className="w-full text-left text-sm min-w-[600px]"><thead className="bg-gray-50 font-bold"><tr><th className="p-4">Nama</th><th className="p-4">Username</th><th className="p-4 text-center">Aksi</th></tr></thead><tbody className="divide-y">{students.map(s => (<tr key={s.id} className="hover:bg-gray-50"><td className="p-4">{s.name}</td><td className="p-4 font-mono text-gray-600">{s.username}</td><td className="p-4 text-center space-x-2"><button onClick={() => {setStudentForm({...s}); setIsEditingStudent(true);}} className="text-blue-600"><Edit size={16}/></button><button onClick={() => handleDeleteStudent(s.id)} className="text-red-600"><Trash2 size={16}/></button></td></tr>))}</tbody></table>
              </div>
            </>
        ))}
        {activeTab === 'monitoring' && <MonitoringView activeExam={activeExam} results={results} students={students} />}
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        <main className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Stimulus Section (Kiri/Atas) */}
          <div className="md:w-1/2 w-full h-1/2 md:h-full overflow-y-auto border-r bg-white p-6">
              <div className="max-w-3xl mx-auto">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-full mb-4 inline-block">{currentQuestion.category}</span>
                  <h2 className="text-xl font-bold mb-4">{currentQuestion.stimulus.title}</h2>
                  {currentQuestion.stimulus.image && (<div className="mb-4 rounded-lg overflow-hidden border"><img src={currentQuestion.stimulus.image} className="w-full h-auto" alt="Stimulus"/></div>)}
                  <div className="prose prose-blue text-gray-700 leading-relaxed text-lg"><FormattedText text={currentQuestion.stimulus.content}/></div>
              </div>
          </div>

          {/* Soal Section (Kanan/Bawah) */}
          <div className="md:w-1/2 w-full h-1/2 md:h-full overflow-y-auto bg-[#f7fafc] p-6">
              <div className="max-w-2xl mx-auto pb-20">
                  <div className="flex justify-between items-start mb-4">
                      <span className="text-sm font-medium text-gray-500">Soal No. {currentQuestionIndex + 1}</span>
                      <span className="text-xs px-2 py-1 rounded bg-gray-200">{currentQuestion.type==='multiple'?'Pilihan Ganda Kompleks':'Pilihan Ganda'}</span>
                  </div>
                  <div className="text-lg font-medium mb-6"><FormattedText text={currentQuestion.question}/></div>
                  <div className="space-y-3">
                      {currentQuestion.options.map(opt => {
                          const sel = (answers[currentQuestion.id]||[]).includes(opt.id); 
                          return (
                              <div key={opt.id} onClick={()=>handleAnswer(opt.id)} className={`flex p-4 rounded border-2 cursor-pointer ${sel?'border-blue-500 bg-blue-50':'border-gray-200 bg-white'}`}>
                                  <div className={`w-6 h-6 flex items-center justify-center border-2 mr-4 ${currentQuestion.type==='multiple'?'rounded':'rounded-full'} ${sel?'bg-blue-500 border-blue-500 text-white':'border-gray-300'}`}>
                                      {sel && (currentQuestion.type==='multiple'?<CheckCircle size={14}/>:<div className="w-2.5 h-2.5 bg-white rounded-full"/>)}
                                      {!sel && <span className="text-xs font-bold text-gray-400">{activeExam.randomizeOptions ? '-' : opt.id}</span>}
                                  </div>
                                  <span className="flex-1 text-sm md:text-base"><FormattedText text={opt.text}/></span>
                              </div>
                          )
                      })}
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
                    const ans = answers[q.id]?.length > 0; 
                    const active = currentQuestionIndex === idx; 
                    const ragu = raguRagu[q.id]; 
                    let cls = "border bg-white"; 
                    if(active) cls="border-blue-600 bg-blue-50 ring-2 ring-blue-100 text-blue-700 font-bold"; 
                    else if(ragu) cls="bg-yellow-100 border-yellow-400 text-yellow-700"; 
                    else if(ans) cls="bg-gray-800 border-gray-800 text-white"; 
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

// --- SISWA ---
const StudentExam = ({ questions, activeExam, currentUser, onLogout }) => {
  const [processedQuestions, setProcessedQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [raguRagu, setRaguRagu] = useState({});
  const [timeLeft, setTimeLeft] = useState(0); 
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [examFinished, setExamFinished] = useState(false);
  const [score, setScore] = useState(0);
  
  const resultDocId = `${activeExam?.id}_${currentUser.id}`;

  useEffect(() => {
    if (activeExam) {
      let qList = questions.filter(q => activeExam.questionIds.includes(q.id));
      if (activeExam.randomizeQuestions) qList = shuffleArray(qList);
      
      // Randomize options ONLY for Single/Multiple choice
      if (activeExam.randomizeOptions) {
        qList = qList.map(q => {
          if (q.type === 'single' || q.type === 'multiple') {
            return {...q, options: shuffleArray([...q.options])};
          }
          return q;
        });
      }
      setProcessedQuestions(qList); 
      setTimeLeft(activeExam.duration * 60);
      
      const resultData = {
        examId: activeExam.id,
        studentId: currentUser.id,
        studentName: currentUser.name,
        status: 'ongoing',
        answeredCount: 0,
        score: 0,
        timestamp: new Date().toISOString()
      };
      
      try {
        setDoc(getDocRef('results', resultDocId), resultData, { merge: true });
      } catch (e) { console.error("Error init exam:", e); }
    }
  }, [activeExam?.id, questions, currentUser.id]);

  useEffect(() => {
    if (timeLeft > 0 && !examFinished) {
      const timerId = setInterval(() => setTimeLeft(p => p - 1), 1000);
      return () => clearInterval(timerId);
    } else if (timeLeft === 0 && !examFinished && activeExam && processedQuestions.length > 0) {
      finishExam();
    }
  }, [timeLeft, examFinished, activeExam, processedQuestions.length]);

  const finishExam = async () => {
    let totalScore = 0;
    
    processedQuestions.forEach(q => {
      const userAns = answers[q.id];
      const originalQuestion = questions.find(oq => oq.id === q.id); 
      if (!originalQuestion) return;

      // Logika Penilaian
      if (q.type === 'single') {
         if (userAns && userAns.length > 0 && originalQuestion.correctAnswer.includes(userAns[0])) {
           totalScore += 1;
         }
      } 
      else if (q.type === 'multiple') {
         // Strict Scoring: Harus sama persis
         const u = (userAns || []).sort();
         const c = [...originalQuestion.correctAnswer].sort();
         if (JSON.stringify(u) === JSON.stringify(c)) totalScore += 1;
      }
      else if (q.type === 'true_false') {
         // Partial Scoring: Poin per pernyataan benar
         // Jika ada 3 pernyataan, maka tiap baris bernilai 1/3 poin
         const statements = originalQuestion.trueFalseStatements || [];
         let correctCount = 0;
         statements.forEach(st => {
            // userAns is object like { s1: true, s2: false }
            if (userAns && userAns[st.id] === st.correct) {
               correctCount++;
            }
         });
         if (statements.length > 0) {
            totalScore += (correctCount / statements.length);
         }
      }
    });

    const finalScore = (totalScore / processedQuestions.length) * 100;
    setScore(finalScore);
    setExamFinished(true);
    
    if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(err => console.log(err));
    }
    
    try {
        await setDoc(getDocRef('results', resultDocId), {
            status: 'finished',
            score: finalScore,
            answeredCount: Object.keys(answers).length
        }, { merge: true });
    } catch(e) { console.error(e); }
  };

  const handleAnswer = async (value, type, subId = null) => {
    if(examFinished) return;
    const currentQ = processedQuestions[currentQuestionIndex];
    const curr = answers[currentQ.id];
    let next;

    if (type === 'single') {
        next = [value];
    } else if (type === 'multiple') {
        const c = curr || [];
        next = c.includes(value) ? c.filter(id=>id!==value) : [...c, value];
    } else if (type === 'true_false') {
        // value is boolean (true/false), subId is statement ID
        next = { ...(curr || {}), [subId]: value };
    }
    
    const newAnswers = {...answers, [currentQ.id]: next};
    setAnswers(newAnswers);

    try {
        setDoc(getDocRef('results', resultDocId), {
            answeredCount: Object.keys(newAnswers).length
        }, { merge: true });
    } catch(e) { console.error(e); }
  };

  if (!activeExam) return (<div className="h-screen flex flex-col items-center justify-center bg-gray-50"><div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md"><div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4"><StopCircle size={32} /></div><h2 className="text-xl font-bold text-gray-800">Tidak Ada Ujian Aktif</h2><p className="text-gray-500 mb-6">Halo, {currentUser.name}. Saat ini belum ada ujian yang aktif.</p><button onClick={onLogout} className="px-6 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-lg transition">Keluar</button></div></div>);
  if (processedQuestions.length === 0) return <div className="h-screen flex items-center justify-center">Loading ujian...</div>;

  if (examFinished) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white max-w-lg w-full rounded-xl shadow-lg p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4"/>
          <h2 className="text-2xl font-bold mb-2">Ujian Selesai!</h2>
          <p className="text-gray-500 mb-4">Terima kasih, {currentUser.name}.</p>
          <div className="bg-blue-50 p-6 rounded mb-6"><span className="text-sm font-bold text-blue-600 uppercase">Nilai Akhir</span><div className="text-5xl font-bold text-blue-800 mt-2">{score.toFixed(1)}</div></div>
          <button onClick={onLogout} className="w-full bg-gray-800 hover:bg-gray-900 text-white py-3 rounded font-bold transition">Keluar Aplikasi</button>
        </div>
      </div>
    );
  }

  const currentQuestion = processedQuestions[currentQuestionIndex];
  const currentAns = answers[currentQuestion.id];

  return (
    // Gunakan h-[100dvh] untuk mobile browser (address bar issue)
    <div className="flex flex-col h-screen h-[100dvh] bg-gray-100 font-sans text-gray-800 overflow-hidden">
      <header className="bg-[#2d3748] text-white h-16 flex items-center justify-between px-4 shadow z-20 shrink-0">
        <div className="flex items-center space-x-4"><div className="bg-blue-600 w-10 h-10 rounded flex items-center justify-center font-bold text-xl">A</div><div><h1 className="font-semibold text-lg">{activeExam.title}</h1><p className="text-xs text-gray-400">Peserta: {currentUser.name}</p></div></div>
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
          {/* Stimulus Section (Kiri/Atas) */}
          <div className="md:w-1/2 w-full h-1/2 md:h-full overflow-y-auto border-r bg-white p-6">
              <div className="max-w-3xl mx-auto">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-full mb-4 inline-block">{currentQuestion.category}</span>
                  <h2 className="text-xl font-bold mb-4">{currentQuestion.stimulus.title}</h2>
                  {currentQuestion.stimulus.image && (<div className="mb-4 rounded-lg overflow-hidden border"><img src={getOptimizedImageUrl(currentQuestion.stimulus.image)} className="w-full h-auto" alt="Stimulus"/></div>)}
                  <div className="prose prose-blue text-gray-700 leading-relaxed text-lg"><FormattedText text={currentQuestion.stimulus.content}/></div>
              </div>
          </div>

          {/* Soal Section (Kanan/Bawah) */}
          <div className="md:w-1/2 w-full h-1/2 md:h-full overflow-y-auto bg-[#f7fafc] p-6">
              <div className="max-w-2xl mx-auto pb-20">
                  <div className="flex justify-between items-start mb-4">
                      <span className="text-sm font-medium text-gray-500">Soal No. {currentQuestionIndex + 1}</span>
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

// --- APP UTAMA ---
export default function App() {
  useTailwind(); // Inject Tailwind otomatis
  
  const [user, setUser] = useState(null);
  const [firebaseUser, setFirebaseUser] = useState(null);

  useEffect(() => {
    const initAuth = async () => {
      try {
        await signInAnonymously(auth);
      } catch (error) {
        console.error("Auth Error:", error);
      }
    };
    initAuth();
    return onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
    });
  }, []);

  const { data: questions, loading: qLoading } = useFirestoreCollection('questions', firebaseUser);
  const { data: exams, loading: eLoading } = useFirestoreCollection('exams', firebaseUser);
  const { data: students, loading: sLoading } = useFirestoreCollection('students', firebaseUser);
  const { data: results } = useFirestoreCollection('results', firebaseUser);
  // Fetch data admin juga
  const { data: admins, loading: aLoading } = useFirestoreCollection('admins', firebaseUser);

  const loading = qLoading || eLoading || sLoading || aLoading;

  const handleLogin = (role, userData) => {
    setUser({ role, ...userData });
  };

  const activeExam = exams.find(e => e.isActive);

  if (!user) return <LoginScreen onLogin={handleLogin} students={students} admins={admins} loading={loading} isAuthReady={!!firebaseUser} />;
  
  if (user.role === 'admin') return <AdminDashboard 
    questions={questions} 
    exams={exams} 
    students={students} 
    results={results}
    onLogout={() => setUser(null)} 
  />;

  if (user.role === 'student') return <StudentExam 
    questions={questions} 
    activeExam={activeExam}
    currentUser={user}
    onLogout={() => setUser(null)}
  />;
}
