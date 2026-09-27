import React from 'react';
import ReactDOM from 'react-dom/client';

/*
 * Urutan cascade global (per area, bukan satu file raksasa):
 *   fondasi → tema → UI bersama → [CSS komponen eager] → primitif halaman →
 *   shell peta → responsif → cetak.
 *
 * `import App` sengaja ditaruh SETELAH ui.css: App memuat CSS komponen eager
 * (Login + shell Sidebar/Topbar/AppLayout) yang posisinya pada desain asli berada
 * di antara ui dan primitif halaman. CSS halaman lazy (Rekap, Peta)
 * ikut chunk masing-masing dan mengikuti urutan setelah seluruh CSS eager.
 */
import './index.css';              // fondasi: tailwind, token, base, scrollbar, skeleton, logo
import './styles/theme.css';       // mode gelap (scope body.dark-mode — bebas urutan)
import './styles/ui.css';          // UI bersama: tombol, form, toast, modal, galeri, switch
import App from './App';
import './styles/dashboard.css';   // primitif halaman: tabel, kartu, filter, panel, foto
import './styles/peta-shell.css';  // kontainer/legenda peta + layout responsif shell
import './styles/responsive.css';  // override responsif sidebar + halaman
import './styles/print.css';       // layout cetak + header/nav/footer

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
