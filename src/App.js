import React, { useState, useEffect, useRef } from "react";
import { initializeApp } from "firebase/app";
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
  setDoc,
} from "firebase/firestore";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Grid,
  CheckCircle,
  AlertCircle,
  Flag,
  FileText,
  Menu,
  X,
  Users,
  Settings,
  Plus,
  Trash2,
  Edit,
  Save,
  LogOut,
  ArrowLeft,
  Image as ImageIcon,
  Sigma,
  LayoutDashboard,
  List,
  Calendar,
  PlayCircle,
  StopCircle,
  Shuffle,
  User,
  Key,
  Upload,
  Activity,
  RefreshCw,
  Printer,
  Database,
  UserPlus,
  Lock,
} from "lucide-react";

// --- KONFIGURASI FIREBASE ---
const firebaseConfig = {
  apiKey: "AIzaSyBSffScL6JuDPtrJJ7aKrUxdOCRoyX7aBg",
  authDomain: "si-mase.firebaseapp.com",
  projectId: "si-mase",
  storageBucket: "si-mase.firebasestorage.app",
  messagingSenderId: "620270328510",
  appId: "1:620270328510:web:f0e18b1ad1817a1eaa1cef",
  measurementId: "G-KVC45P33S5",
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// App ID Handler
const APP_ID = typeof __app_id !== "undefined" ? __app_id : "default-app-id";

// Helper Referensi Koleksi
const getCollectionRef = (name) => {
  return collection(db, "artifacts", APP_ID, "public", "data", name);
};

// Helper Referensi Dokumen
const getDocRef = (colName, docId) => {
  return doc(db, "artifacts", APP_ID, "public", "data", colName, docId);
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

// --- UTILS: AUTO INJECT TAILWIND CSS (FIX TAMPILAN) ---
const useTailwind = () => {
  useEffect(() => {
    // Cek apakah script Tailwind sudah ada
    if (document.getElementById("tailwind-cdn")) return;

    // Inject Script Tailwind CDN
    const script = document.createElement("script");
    script.id = "tailwind-cdn";
    script.src = "https://cdn.tailwindcss.com";
    script.async = true;
    document.head.appendChild(script);

    // Optional: Tambahkan font Inter untuk tampilan lebih mirip
    const link = document.createElement("link");
    link.href =
      "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);

    document.body.style.fontFamily = "'Inter', sans-serif";
  }, []);
};

// --- UTILS: KATEX & FORMATTER ---
const useKatex = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => {
    if (window.katex) {
      setIsLoaded(true);
      return;
    }
    const link = document.createElement("link");
    link.href = "https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js";
    script.async = true;
    script.onload = () => {
      window.katexLoaded = true;
      setIsLoaded(true);
    };
    document.head.appendChild(script);
  }, []);
  return isLoaded;
};

const FormattedText = ({ text, className = "" }) => {
  const isKatexLoaded = useKatex();
  const containerRef = useRef(null);
  useEffect(() => {
    if (!containerRef.current || !isKatexLoaded || !window.katex) return;
    const regex = /\$\$([\s\S]*?)\$\$|\$((?:\\.|[^$])*?)\$/g;
    let lastIndex = 0;
    let match;
    let html = "";
    while ((match = regex.exec(text)) !== null) {
      html += text.slice(lastIndex, match.index).replace(/\n/g, "<br/>");
      const latex = match[1] || match[2];
      try {
        html += window.katex.renderToString(latex, {
          displayMode: !!match[1],
          throwOnError: false,
        });
      } catch (e) {
        html += latex;
      }
      lastIndex = regex.lastIndex;
    }
    html += text.slice(lastIndex).replace(/\n/g, "<br/>");
    containerRef.current.innerHTML = html;
  }, [text, isKatexLoaded]);
  return (
    <div ref={containerRef} className={className}>
      {text}
    </div>
  );
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
      id: "q1",
      type: "single",
      category: "Literasi Membaca",
      stimulus: {
        title: "Lebah dan Bunga",
        image: "",
        content: `Di sebuah taman yang indah, hiduplah seekor lebah bernama Biba. Biba sangat rajin mengumpulkan nektar dari bunga-bunga yang bermekaran. Suatu hari, Biba bertemu dengan seekor kupu-kupu yang sedang bersedih karena sayapnya terluka.\n\n"Mengapa kau menangis, teman?" tanya Biba.\n"Sayapku tersangkut ranting, aku tidak bisa terbang pulang," jawab kupu-kupu.\n\nTanpa berpikir panjang, Biba membantu melepaskan sayap kupu-kupu itu dengan hati-hati.`,
      },
      question:
        "Apa sifat utama yang dimiliki oleh Biba berdasarkan cerita tersebut?",
      options: [
        { id: "A", text: "Pemalas dan sombong" },
        { id: "B", text: "Penolong dan rajin" },
        { id: "C", text: "Penakut dan pemalu" },
        { id: "D", text: "Cerdik tapi licik" },
      ],
      correctAnswer: ["B"],
    },
    {
      id: "q2",
      type: "multiple",
      category: "Numerasi",
      stimulus: {
        title: "Belanja Buah",
        image:
          "https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&q=80&w=1000",
        content: `Ibu pergi ke pasar untuk membeli buah-buahan. Perhatikan gambar ilustrasi pasar buah di atas.\n\nBerikut adalah daftar harga buah per kilogram:\n- Apel: Rp 25.000\n- Jeruk: Rp 15.000\n- Mangga: Rp 20.000\n- Anggur: Rp 40.000\n\nIbu membawa uang sebesar Rp 100.000.`,
      },
      question:
        "Manakah pernyataan yang BENAR? (Pilih lebih dari satu jawaban)",
      options: [
        { id: "A", text: "Harga 2 kg Jeruk lebih murah daripada 1 kg Anggur." },
        {
          id: "B",
          text: "Dengan uang Rp 50.000, Ibu bisa membeli 1 kg Apel dan 1 kg Mangga.",
        },
        { id: "C", text: "Harga 1 kg Apel sama dengan harga 2 kg Jeruk." },
        {
          id: "D",
          text: "Jika Ibu membeli 1 kg Anggur dan 2 kg Mangga, uangnya masih sisa.",
        },
      ],
      correctAnswer: ["A", "B"],
    },
  ],
  students: [
    { id: "s1", name: "Siswa Contoh", username: "siswa", password: "123" },
  ],
  exams: [
    {
      id: "e1",
      title: "Simulasi ANBK Literasi & Numerasi",
      duration: 30,
      questionIds: ["q1", "q2"],
      randomizeQuestions: false,
      randomizeOptions: false,
      isActive: true,
    },
  ],
  // Tambahkan data admin default jika database kosong
  admins: [
    {
      id: "a1",
      name: "Administrator",
      username: "admin",
      password: "admin123",
    },
  ],
};

// --- HOOKS FIREBASE ---
const useFirestoreCollection = (collectionName, firebaseUser) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firebaseUser) return;
    const q = query(getCollectionRef(collectionName));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setData(items);
        setLoading(false);
      },
      (error) => {
        console.error(`Error fetching ${collectionName}:`, error);
        setLoading(false);
      }
    );
    return unsubscribe;
  }, [collectionName, firebaseUser]);
  return { data, loading };
};

// --- LOGIN SCREEN ---
const LoginScreen = ({ onLogin, students, admins, loading, isAuthReady }) => {
  const [view, setView] = useState("select"); // 'select' | 'form'
  const [role, setRole] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false); // Untuk mode daftar admin
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
    setView("form");
    setIsRegistering(false);
    setError("");
    setSuccessMsg("");
    setFormData({ name: "", username: "", password: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading || !isAuthReady) return;
    setError("");
    setSuccessMsg("");

    if (role === "student") {
      const student = students.find(
        (s) =>
          s.username === formData.username && s.password === formData.password
      );
      if (student) {
        onLogin("student", student);
      } else {
        setError("Username atau Password salah!");
      }
    } else if (role === "admin") {
      if (isRegistering) {
        // --- LOGIKA REGISTER ADMIN ---
        if (!formData.name || !formData.username || !formData.password) {
          setError("Semua kolom wajib diisi.");
          return;
        }
        // Cek duplikat
        const exists = admins.find((a) => a.username === formData.username);
        if (exists) {
          setError("Username sudah digunakan.");
          return;
        }

        try {
          await addDoc(getCollectionRef("admins"), {
            name: formData.name,
            username: formData.username,
            password: formData.password,
          });
          setSuccessMsg("Akun berhasil dibuat! Silakan login.");
          setIsRegistering(false); // Kembali ke mode login
          setFormData({ name: "", username: "", password: "" });
        } catch (err) {
          setError("Gagal membuat akun: " + err.message);
        }
      } else {
        // --- LOGIKA LOGIN ADMIN ---
        const admin = admins.find(
          (a) =>
            a.username === formData.username && a.password === formData.password
        );
        if (admin) {
          onLogin("admin", admin);
        } else {
          setError("Username atau Password salah!");
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-gray-900 flex items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center relative">
        {view === "form" && (
          <button
            onClick={() => setView("select")}
            className="absolute top-4 left-4 text-gray-400 hover:text-gray-600"
          >
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

        {view === "select" ? (
          <>
            <p className="text-gray-500 mb-8">Silakan pilih peran Anda</p>
            <div className="space-y-4">
              <button
                onClick={() => handleRoleSelect("student")}
                disabled={loading || !isAuthReady}
                className="w-full p-4 bg-white border-2 border-blue-100 hover:border-blue-500 rounded-xl flex items-center transition-all hover:shadow-md disabled:opacity-50"
              >
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                  <Users className="text-blue-600" />
                </div>
                <div className="text-left">
                  <h3 className="font-bold">Siswa</h3>
                  <p className="text-xs text-gray-500">
                    {loading ? "Memuat data..." : "Login untuk ujian"}
                  </p>
                </div>
              </button>
              <button
                onClick={() => handleRoleSelect("admin")}
                disabled={!isAuthReady}
                className="w-full p-4 bg-white border-2 border-gray-100 hover:border-gray-500 rounded-xl flex items-center transition-all hover:shadow-md disabled:opacity-50"
              >
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mr-4">
                  <Settings className="text-gray-600" />
                </div>
                <div className="text-left">
                  <h3 className="font-bold">Admin</h3>
                  <p className="text-xs text-gray-500">Kelola sistem</p>
                </div>
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="text-gray-500 mb-6">
              {role === "student"
                ? "Login Peserta Ujian"
                : isRegistering
                ? "Buat Akun Admin Baru"
                : "Login Administrator"}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              {/* Field Nama hanya untuk Register Admin */}
              {role === "admin" && isRegistering && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Lengkap
                  </label>
                  <div className="relative">
                    <UserPlus className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full pl-10 p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="Nama Lengkap"
                      required
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    className="w-full pl-10 p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Masukkan username"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
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

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 transition disabled:bg-gray-400"
              >
                {loading ? "Memuat..." : isRegistering ? "Daftar" : "Masuk"}
              </button>

              {/* Toggle Register/Login Khusus Admin */}
              {role === "admin" && (
                <div className="text-center mt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsRegistering(!isRegistering);
                      setError("");
                      setSuccessMsg("");
                      setFormData({ name: "", username: "", password: "" });
                    }}
                    className="text-sm text-blue-600 hover:underline font-medium"
                  >
                    {isRegistering
                      ? "Sudah punya akun? Login"
                      : "Belum punya akun? Buat Akun"}
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
const AdminDashboard = ({ questions, exams, students, results, onLogout }) => {
  const [activeTab, setActiveTab] = useState("questions");
  const [examView, setExamView] = useState("list");
  const fileInputRef = useRef(null);

  // Forms State
  const [isEditingQ, setIsEditingQ] = useState(false);
  const [qForm, setQForm] = useState(null);
  const [examForm, setExamForm] = useState({
    title: "",
    duration: 60,
    questionIds: [],
    randomizeQuestions: false,
    randomizeOptions: false,
    isActive: false,
  });
  const [isEditingStudent, setIsEditingStudent] = useState(false);
  const [studentForm, setStudentForm] = useState({
    name: "",
    username: "",
    password: "",
  });

  // --- ACTIONS (FIRESTORE) ---

  // Questions
  const handleEditQ = (q) => {
    setQForm({ ...q });
    setIsEditingQ(true);
  };
  const handleCreateQ = () => {
    setQForm({
      type: "single",
      category: "Umum",
      stimulus: { title: "", content: "", image: "" },
      question: "",
      options: [
        { id: "A", text: "" },
        { id: "B", text: "" },
        { id: "C", text: "" },
        { id: "D", text: "" },
      ],
      correctAnswer: [],
    });
    setIsEditingQ(true);
  };
  const handleDeleteQ = async (id) => {
    if (window.confirm("Hapus soal?"))
      await deleteDoc(getDocRef("questions", id));
  };
  const handleSaveQ = async () => {
    if (!qForm.question) return alert("Pertanyaan wajib diisi!");
    try {
      if (qForm.id) {
        await updateDoc(getDocRef("questions", qForm.id), qForm);
      } else {
        await addDoc(getCollectionRef("questions"), qForm);
      }
      setIsEditingQ(false);
    } catch (e) {
      alert("Gagal menyimpan: " + e.message);
    }
  };

  // Exams
  const openExamForm = (e = null) => {
    setExamForm(
      e
        ? { ...e }
        : {
            title: "",
            duration: 60,
            questionIds: [],
            randomizeQuestions: false,
            randomizeOptions: false,
            isActive: false,
          }
    );
    setExamView("form");
  };
  const handleSaveExam = async () => {
    if (!examForm.title) return alert("Nama ujian wajib diisi!");
    try {
      if (examForm.id) {
        await updateDoc(getDocRef("exams", examForm.id), examForm);
      } else {
        await addDoc(getCollectionRef("exams"), {
          ...examForm,
          isActive: false,
        });
      }
      setExamView("list");
    } catch (e) {
      alert("Gagal menyimpan: " + e.message);
    }
  };
  const handleDeleteExam = async (id) => {
    if (window.confirm("Hapus paket ujian?"))
      await deleteDoc(getDocRef("exams", id));
  };
  const toggleExamStatus = async (exam) => {
    try {
      await updateDoc(getDocRef("exams", exam.id), {
        isActive: !exam.isActive,
      });
    } catch (e) {
      alert("Gagal update status: " + e.message);
    }
  };
  const toggleQuestionSelection = (qid) => {
    const s = examForm.questionIds;
    setExamForm({
      ...examForm,
      questionIds: s.includes(qid) ? s.filter((id) => id !== qid) : [...s, qid],
    });
  };

  // Students
  const handleSaveStudent = async () => {
    if (!studentForm.username) return alert("Username wajib diisi!");
    try {
      if (studentForm.id) {
        await updateDoc(getDocRef("students", studentForm.id), studentForm);
      } else {
        if (students.some((s) => s.username === studentForm.username))
          return alert("Username sudah ada!");
        await addDoc(getCollectionRef("students"), studentForm);
      }
      setIsEditingStudent(false);
    } catch (e) {
      alert("Gagal menyimpan: " + e.message);
    }
  };
  const handleDeleteStudent = async (id) => {
    if (window.confirm("Hapus siswa?"))
      await deleteDoc(getDocRef("students", id));
  };

  // Import CSV
  const handleImportClick = () => fileInputRef.current.click();
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      const lines = evt.target.result.split("\n");
      const batch = writeBatch(db);
      let count = 0;
      lines.forEach((l, i) => {
        const p = l.trim().split(",");
        if (
          p.length >= 3 &&
          (i > 0 || p[1].toLowerCase() !== "username") &&
          !students.some((s) => s.username === p[1])
        ) {
          const newRef = doc(getCollectionRef("students"));
          batch.set(newRef, { name: p[0], username: p[1], password: p[2] });
          count++;
        }
      });
      if (count > 0) {
        await batch.commit();
        alert(`Berhasil mengimpor ${count} siswa.`);
      } else {
        alert("Tidak ada data valid atau semua username duplikat.");
      }
      e.target.value = null;
    };
    reader.readAsText(file);
  };

  // Monitoring
  const activeExam = exams.find((e) => e.isActive);
  const handleResetProgress = async (resultId) => {
    if (window.confirm("Reset progres siswa ini?")) {
      await deleteDoc(getDocRef("results", resultId));
    }
  };

  // SEED DATA FUNCTION
  const handleSeedData = async () => {
    if (
      !window.confirm(
        "Database Anda akan diisi dengan data contoh (Soal, Siswa, Ujian). Lanjutkan?"
      )
    )
      return;
    try {
      const batch = writeBatch(db);

      SEED_DATA.questions.forEach((q) => {
        const newRef = doc(getCollectionRef("questions"));
        batch.set(newRef, q);
      });
      SEED_DATA.students.forEach((s) => {
        const newRef = doc(getCollectionRef("students"));
        batch.set(newRef, s);
      });
      SEED_DATA.exams.forEach((e) => {
        const newRef = doc(getCollectionRef("exams"));
        batch.set(newRef, e);
      });
      // Seed Admin juga jika belum ada
      SEED_DATA.admins.forEach((a) => {
        const newRef = doc(getCollectionRef("admins"));
        batch.set(newRef, a);
      });

      await batch.commit();
      alert(
        "Database berhasil diisi! Silakan login admin dengan username 'admin' dan password 'admin123' atau daftar baru."
      );
    } catch (e) {
      alert("Gagal seeding: " + e.message);
    }
  };

  // --- RENDERERS ---
  const QuestionEditor = () => (
    <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-800">
          {qForm.id ? "Edit Soal" : "Buat Soal Baru"}
        </h3>
        <button onClick={() => setIsEditingQ(false)}>
          <X className="text-gray-500 hover:text-gray-700" />
        </button>
      </div>
      <div className="bg-blue-50 p-4 rounded-md mb-6 border border-blue-200 text-sm text-blue-800 flex items-center">
        <Sigma className="w-4 h-4 mr-2" />{" "}
        <span>
          Gunakan <code>$x^2$</code> untuk rumus inline dan{" "}
          <code>{"$$x=y$$"}</code> untuk blok.
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              value={qForm.category}
              onChange={(e) => setQForm({ ...qForm, category: e.target.value })}
              className="w-1/2 p-2 border rounded"
              placeholder="Kategori"
            />
            <select
              value={qForm.type}
              onChange={(e) => setQForm({ ...qForm, type: e.target.value })}
              className="w-1/2 p-2 border rounded"
            >
              <option value="single">Pilihan Ganda</option>
              <option value="multiple">PG Kompleks</option>
            </select>
          </div>
          <input
            value={qForm.stimulus.title}
            onChange={(e) =>
              setQForm({
                ...qForm,
                stimulus: { ...qForm.stimulus, title: e.target.value },
              })
            }
            className="w-full p-2 border rounded"
            placeholder="Judul Stimulus"
          />
          <input
            value={qForm.stimulus.image || ""}
            onChange={(e) =>
              setQForm({
                ...qForm,
                stimulus: { ...qForm.stimulus, image: e.target.value },
              })
            }
            className="w-full p-2 border rounded text-sm"
            placeholder="URL Gambar (Opsional)"
          />
          <textarea
            value={qForm.stimulus.content}
            onChange={(e) =>
              setQForm({
                ...qForm,
                stimulus: { ...qForm.stimulus, content: e.target.value },
              })
            }
            className="w-full p-2 border rounded h-32 font-mono text-sm"
            placeholder="Isi bacaan..."
          />
        </div>
        <div className="space-y-4">
          <textarea
            value={qForm.question}
            onChange={(e) => setQForm({ ...qForm, question: e.target.value })}
            className="w-full p-2 border rounded h-24"
            placeholder="Pertanyaan..."
          />
          {qForm.options.map((opt, idx) => (
            <div key={idx} className="flex items-center mb-2">
              <span className="w-8 font-bold text-gray-500">{opt.id}.</span>
              <input
                value={opt.text}
                onChange={(e) => {
                  const n = [...qForm.options];
                  n[idx].text = e.target.value;
                  setQForm({ ...qForm, options: n });
                }}
                className="flex-1 p-2 border rounded mr-2"
                placeholder={`Opsi ${opt.id}`}
              />
              <input
                type={qForm.type === "single" ? "radio" : "checkbox"}
                checked={qForm.correctAnswer.includes(opt.id)}
                onChange={() => {
                  let nc;
                  if (qForm.type === "single") nc = [opt.id];
                  else
                    nc = qForm.correctAnswer.includes(opt.id)
                      ? qForm.correctAnswer.filter((c) => c !== opt.id)
                      : [...qForm.correctAnswer, opt.id];
                  setQForm({ ...qForm, correctAnswer: nc });
                }}
                className="w-5 h-5 accent-green-600"
              />
            </div>
          ))}
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-3 pt-4 border-t">
        <button
          onClick={() => setIsEditingQ(false)}
          className="px-4 py-2 text-gray-600 border rounded"
        >
          Batal
        </button>
        <button
          onClick={handleSaveQ}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center font-medium"
        >
          <Save className="w-4 h-4 mr-2" /> Simpan
        </button>
      </div>
    </div>
  );

  const MonitoringView = () => {
    if (!activeExam)
      return (
        <div className="p-10 text-center text-gray-500">
          Tidak ada ujian yang sedang aktif.
        </div>
      );
    const date = new Date().toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const currentResults = results.filter((r) => r.examId === activeExam.id);

    return (
      <div className="space-y-6 print-container">
        <div className="print-header">
          <h1>LAPORAN HASIL UJIAN</h1>
          <p>{activeExam.title}</p>
          <p>Tanggal: {date}</p>
        </div>
        <div className="flex justify-between items-center no-print">
          <div>
            <h2 className="text-2xl font-bold">Pemantauan</h2>
            <p className="text-gray-500">
              Ujian Aktif: <strong>{activeExam.title}</strong>
            </p>
          </div>
          <button
            onClick={() => window.print()}
            className="flex items-center bg-gray-800 text-white px-4 py-2 rounded shadow-sm"
          >
            <Printer size={16} className="mr-2" /> Cetak
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 print-container">
          <div className="bg-white p-4 rounded-lg shadow border-l-4 border-gray-300 print-card">
            <div className="text-gray-500 text-sm">Total Peserta</div>
            <div className="text-2xl font-bold">{students.length}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500 print-card">
            <div className="text-gray-500 text-sm">Sedang Mengerjakan</div>
            <div className="text-2xl font-bold text-blue-600">
              {currentResults.filter((r) => r.status === "ongoing").length}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500 print-card">
            <div className="text-gray-500 text-sm">Selesai</div>
            <div className="text-2xl font-bold text-green-600">
              {currentResults.filter((r) => r.status === "finished").length}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden border print-container print-card">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-700 font-bold border-b">
              <tr>
                <th className="p-4">Nama Siswa</th>
                <th className="p-4">Status</th>
                <th className="p-4 w-1/3 no-print">Progres</th>
                <th className="p-4 text-center">Nilai</th>
                <th className="p-4 text-center no-print">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {students.map((s) => {
                const res = currentResults.find((r) => r.studentId === s.id);
                const status = res ? res.status : "not_started";
                const total = activeExam.questionIds.length;
                const answered = res ? res.answeredCount : 0;
                const percent = total > 0 ? (answered / total) * 100 : 0;

                return (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="p-4 font-medium">
                      {s.name} <br />
                      <span className="text-xs text-gray-400 no-print">
                        {s.username}
                      </span>
                    </td>
                    <td className="p-4">
                      {status === "not_started" && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                          Belum Login
                        </span>
                      )}
                      {status === "ongoing" && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded text-xs">
                          Mengerjakan...
                        </span>
                      )}
                      {status === "finished" && (
                        <span className="px-2 py-1 bg-green-100 text-green-600 rounded text-xs font-bold">
                          Selesai
                        </span>
                      )}
                    </td>
                    <td className="p-4 no-print">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden border border-gray-300">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              status === "finished"
                                ? "bg-green-500"
                                : "bg-blue-500"
                            }`}
                            style={{ width: `${percent}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-mono">
                          {answered}/{total}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      {status === "finished" ? (
                        <span className="font-bold text-lg text-gray-800">
                          {res.score.toFixed(1)}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="p-4 text-center no-print">
                      {res && (
                        <button
                          onClick={() => handleResetProgress(res.id)}
                          className="text-red-600 hover:bg-red-50 px-2 py-1 rounded text-xs border border-red-200"
                        >
                          Reset
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      <PrintStyles />
      <nav className="bg-white border-b px-6 py-4 flex justify-between items-center sticky top-0 z-10 no-print">
        <div className="flex items-center space-x-3">
          <div className="bg-gray-800 p-2 rounded text-white">
            <Settings size={20} />
          </div>
          <h1 className="text-xl font-bold">Panel Admin</h1>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={handleSeedData}
            className="text-gray-500 hover:text-blue-600 text-xs flex items-center border px-2 py-1 rounded"
          >
            <Database size={12} className="mr-1" /> Reset & Seed Data Awal
          </button>
          <button
            onClick={onLogout}
            className="text-red-600 font-medium text-sm flex items-center"
          >
            <LogOut size={16} className="mr-2" /> Keluar
          </button>
        </div>
      </nav>
      <div className="max-w-6xl mx-auto px-6 mt-6 no-print">
        <div className="flex space-x-1 bg-gray-200 p-1 rounded-lg w-fit">
          <button
            onClick={() => setActiveTab("questions")}
            className={`px-4 py-2 rounded-md text-sm font-medium flex items-center ${
              activeTab === "questions" ? "bg-white shadow" : "text-gray-600"
            }`}
          >
            <List size={16} className="mr-2" /> Bank Soal
          </button>
          <button
            onClick={() => setActiveTab("exams")}
            className={`px-4 py-2 rounded-md text-sm font-medium flex items-center ${
              activeTab === "exams" ? "bg-white shadow" : "text-gray-600"
            }`}
          >
            <Calendar size={16} className="mr-2" /> Paket Ujian
          </button>
          <button
            onClick={() => setActiveTab("students")}
            className={`px-4 py-2 rounded-md text-sm font-medium flex items-center ${
              activeTab === "students" ? "bg-white shadow" : "text-gray-600"
            }`}
          >
            <Users size={16} className="mr-2" /> Peserta
          </button>
          <button
            onClick={() => setActiveTab("monitoring")}
            className={`px-4 py-2 rounded-md text-sm font-medium flex items-center ${
              activeTab === "monitoring" ? "bg-white shadow" : "text-gray-600"
            }`}
          >
            <Activity size={16} className="mr-2" /> Pemantauan
          </button>
        </div>
      </div>
      <div className="max-w-6xl mx-auto p-6 print-container">
        {activeTab === "questions" &&
          (isEditingQ ? (
            <QuestionEditor />
          ) : (
            <>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">
                  Bank Soal ({questions.length})
                </h2>
                <button
                  onClick={handleCreateQ}
                  className="bg-blue-600 text-white px-4 py-2 rounded flex items-center"
                >
                  <Plus size={18} className="mr-2" /> Tambah Soal
                </button>
              </div>
              <div className="grid gap-3">
                {questions.map((q, idx) => (
                  <div
                    key={q.id}
                    className="bg-white p-5 rounded-lg border border-gray-200 hover:border-blue-300 shadow-sm transition flex justify-between items-start"
                  >
                    <div className="flex-1 pr-6">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs font-bold uppercase">
                          #{idx + 1}
                        </span>
                        <span className="text-xs font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded">
                          {q.type}
                        </span>
                      </div>
                      <div className="font-semibold line-clamp-2">
                        <FormattedText text={q.question} />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditQ(q)}
                        className="text-blue-600 bg-blue-50 p-2 rounded"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteQ(q.id)}
                        className="text-red-600 bg-red-50 p-2 rounded"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ))}
        {activeTab === "exams" &&
          (examView === "form" ? (
            <div className="bg-white p-6 rounded-lg shadow border">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">
                  {examForm.id ? "Edit" : "Baru"} Paket Ujian
                </h3>
                <button onClick={() => setExamView("list")}>
                  <X />
                </button>
              </div>
              <div className="grid gap-4 mb-4">
                <input
                  value={examForm.title}
                  onChange={(e) =>
                    setExamForm({ ...examForm, title: e.target.value })
                  }
                  className="border p-2 rounded w-full"
                  placeholder="Nama Ujian"
                />
                <input
                  type="number"
                  value={examForm.duration}
                  onChange={(e) =>
                    setExamForm({
                      ...examForm,
                      duration: parseInt(e.target.value),
                    })
                  }
                  className="border p-2 rounded w-full"
                  placeholder="Durasi (menit)"
                />
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={examForm.randomizeQuestions}
                      onChange={(e) =>
                        setExamForm({
                          ...examForm,
                          randomizeQuestions: e.target.checked,
                        })
                      }
                      className="mr-2"
                    />{" "}
                    Acak Soal
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={examForm.randomizeOptions}
                      onChange={(e) =>
                        setExamForm({
                          ...examForm,
                          randomizeOptions: e.target.checked,
                        })
                      }
                      className="mr-2"
                    />{" "}
                    Acak Opsi
                  </label>
                </div>
              </div>
              <div className="border-t pt-4">
                <p className="font-bold mb-2">Pilih Soal:</p>
                <div className="max-h-60 overflow-y-auto border rounded">
                  {questions.map((q, i) => (
                    <div
                      key={q.id}
                      onClick={() => toggleQuestionSelection(q.id)}
                      className={`p-2 flex items-center cursor-pointer hover:bg-gray-50 ${
                        examForm.questionIds.includes(q.id) ? "bg-blue-50" : ""
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={examForm.questionIds.includes(q.id)}
                        readOnly
                        className="mr-3"
                      />{" "}
                      <span className="text-sm truncate">
                        {i + 1}. {q.question}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <button
                  onClick={() => setExamView("list")}
                  className="px-4 py-2 border rounded"
                >
                  Batal
                </button>
                <button
                  onClick={handleSaveExam}
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                  Simpan
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Daftar Paket</h2>
                <button
                  onClick={() => openExamForm()}
                  className="bg-green-600 text-white px-4 py-2 rounded flex items-center"
                >
                  <Plus size={18} className="mr-2" /> Buat Baru
                </button>
              </div>
              <div className="grid gap-4">
                {exams.map((exam) => {
                  const isActive = exam.isActive;
                  return (
                    <div
                      key={exam.id}
                      className={`bg-white p-6 rounded-lg border-2 ${
                        isActive
                          ? "border-green-500 shadow-md"
                          : "border-gray-100"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-lg">{exam.title}</h3>
                          {isActive && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded font-bold">
                              AKTIF
                            </span>
                          )}
                          <p className="text-sm text-gray-500 mt-1">
                            {exam.duration} Menit • {exam.questionIds.length}{" "}
                            Soal
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => toggleExamStatus(exam)}
                            className={`px-3 py-1 rounded text-sm font-bold flex items-center ${
                              isActive
                                ? "bg-red-100 text-red-700"
                                : "bg-gray-100 hover:bg-green-100 text-gray-700 hover:text-green-700"
                            }`}
                          >
                            {isActive ? (
                              <>
                                <StopCircle size={14} className="mr-1" /> Stop
                              </>
                            ) : (
                              <>
                                <PlayCircle size={14} className="mr-1" /> Mulai
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => openExamForm(exam)}
                            className="p-2 text-blue-500"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteExam(exam.id)}
                            className="p-2 text-red-500"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ))}
        {activeTab === "students" &&
          (isEditingStudent ? (
            <div className="bg-white p-6 rounded-lg shadow max-w-md mx-auto">
              <h3 className="font-bold mb-4">
                {studentForm.id ? "Edit" : "Tambah"} Siswa
              </h3>
              <div className="space-y-3">
                <input
                  value={studentForm.name}
                  onChange={(e) =>
                    setStudentForm({ ...studentForm, name: e.target.value })
                  }
                  className="border p-2 w-full rounded"
                  placeholder="Nama"
                />
                <input
                  value={studentForm.username}
                  onChange={(e) =>
                    setStudentForm({ ...studentForm, username: e.target.value })
                  }
                  className="border p-2 w-full rounded"
                  placeholder="Username"
                />
                <input
                  value={studentForm.password}
                  onChange={(e) =>
                    setStudentForm({ ...studentForm, password: e.target.value })
                  }
                  className="border p-2 w-full rounded"
                  placeholder="Password"
                />
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <button
                  onClick={() => setIsEditingStudent(false)}
                  className="px-3 py-2 border rounded"
                >
                  Batal
                </button>
                <button
                  onClick={handleSaveStudent}
                  className="px-3 py-2 bg-blue-600 text-white rounded"
                >
                  Simpan
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Data Peserta</h2>
                <div className="flex gap-2">
                  <input
                    type="file"
                    accept=".csv"
                    ref={fileInputRef}
                    style={{ display: "none" }}
                    onChange={handleFileChange}
                  />
                  <button
                    onClick={handleImportClick}
                    className="bg-green-600 text-white px-3 py-2 rounded flex items-center text-sm"
                  >
                    <Upload size={16} className="mr-2" /> Impor CSV
                  </button>
                  <button
                    onClick={() => {
                      setStudentForm({ name: "", username: "", password: "" });
                      setIsEditingStudent(true);
                    }}
                    className="bg-blue-600 text-white px-3 py-2 rounded flex items-center text-sm"
                  >
                    <Plus size={16} className="mr-2" /> Tambah
                  </button>
                </div>
              </div>
              <div className="bg-white shadow rounded-lg overflow-hidden border">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 font-bold">
                    <tr>
                      <th className="p-4">Nama</th>
                      <th className="p-4">Username</th>
                      <th className="p-4 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {students.map((s) => (
                      <tr key={s.id} className="hover:bg-gray-50">
                        <td className="p-4">{s.name}</td>
                        <td className="p-4 font-mono text-gray-600">
                          {s.username}
                        </td>
                        <td className="p-4 text-center space-x-2">
                          <button
                            onClick={() => {
                              setStudentForm({ ...s });
                              setIsEditingStudent(true);
                            }}
                            className="text-blue-600"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteStudent(s.id)}
                            className="text-red-600"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ))}
        {activeTab === "monitoring" && <MonitoringView />}
      </div>
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

  const { data: questions, loading: qLoading } = useFirestoreCollection(
    "questions",
    firebaseUser
  );
  const { data: exams, loading: eLoading } = useFirestoreCollection(
    "exams",
    firebaseUser
  );
  const { data: students, loading: sLoading } = useFirestoreCollection(
    "students",
    firebaseUser
  );
  const { data: results } = useFirestoreCollection("results", firebaseUser);
  // Fetch data admin juga
  const { data: admins, loading: aLoading } = useFirestoreCollection(
    "admins",
    firebaseUser
  );

  const loading = qLoading || eLoading || sLoading || aLoading;

  const handleLogin = (role, userData) => {
    setUser({ role, ...userData });
  };

  const activeExam = exams.find((e) => e.isActive);

  if (!user)
    return (
      <LoginScreen
        onLogin={handleLogin}
        students={students}
        admins={admins}
        loading={loading}
        isAuthReady={!!firebaseUser}
      />
    );

  if (user.role === "admin")
    return (
      <AdminDashboard
        questions={questions}
        exams={exams}
        students={students}
        results={results}
        onLogout={() => setUser(null)}
      />
    );

  if (user.role === "student")
    return (
      <StudentExam
        questions={questions}
        activeExam={activeExam}
        currentUser={user}
        onLogout={() => setUser(null)}
      />
    );
}
