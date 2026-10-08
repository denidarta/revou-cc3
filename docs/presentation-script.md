# Script Demo & Code Walkthrough — Refactor Todo App (8 menit)

Format dari assessor: tampilkan **kode asli (Before)** berdampingan dengan **hasil refactor (After)**, lalu jelaskan masalah utama yang ditemukan dan cara memperbaikinya.

## Persiapan (sebelum mulai)

1. Siapkan file Before di samping file After (split view):
   ```bash
   git show aabc330:src/App.jsx > App.before.jsx
   ```
   ```bash
   code --diff App.before.jsx src/App.jsx
   ```
   Alternatif lain: buka GitHub compare `https://github.com/denidarta/revou-cc3/compare/aabc330...main`.
   (Hapus `App.before.jsx` setelah presentasi, jangan di-commit.)
2. Jalankan `pnpm dev` dan buka http://localhost:5173 di browser.
3. Siapkan satu terminal untuk menjalankan `pnpm test`.

Catatan baris: **B:xx** = baris di file Before, **A:xx** = baris di file After.

---

## 0:00 – 0:45 | Pembuka

> "Saya akan menunjukkan refactor aplikasi todo list dari `technical-test-3`. Di sebelah kiri ada kode asli, di sebelah kanan hasil refactor.
>
> Aturan yang saya pegang: tidak menambah fitur dan tidak menulis ulang semuanya. Setiap masalah saya beri prioritas Critical, High, Medium, atau Low, lalu dikerjakan satu per satu: satu issue, satu branch, satu commit, dan selalu ada test-nya.
>
> Hasilnya, `App.jsx` turun dari 150 baris menjadi 112 baris, dan jumlah test naik dari 5 menjadi 22."

---

## 0:45 – 2:15 | Critical: Keamanan

### 1. API key yang di-hardcode dan debug log — B:3-4, B:143-145

> "Di baris 4 ada API key yang ditulis langsung di kode. Di baris 144–145, key itu dicetak ke console **setiap kali render**, bersama seluruh isi todo. Siapa pun yang membuka DevTools bisa melihatnya.
>
> Key itu tidak dipakai di mana pun, jadi saya **hapus**, bukan dipindah ke `.env`. Di aplikasi frontend, isi `.env` tetap ikut masuk ke bundle dan tetap bisa dibaca. Di file After, semuanya sudah hilang."

### 2. Stored XSS — B:128 vs A:93

> "Ini masalah paling serius. Kode lama memakai `dangerouslySetInnerHTML`, sehingga teks yang diketik user dijalankan sebagai HTML."

**Demo di browser:** ketik `<img src=x onerror=alert(1)>`, lalu klik **Add**.

> "Di versi lama, perintah ini memunculkan alert. Karena todo disimpan ke `localStorage`, alert itu juga muncul lagi setiap kali aplikasi dibuka. Sekarang yang tampil hanya teks biasa.
>
> Perbaikannya cukup satu baris: `<span>{todo.text}</span>`. React sudah melakukan escape secara default, jadi saya tidak perlu menambah library seperti DOMPurify."

---

## 2:15 – 4:15 | Re-render dan `useEffect`

### 3. `useEffect` tanpa dependency array — B:21-24 vs A:15-17

> "Ini masalah re-render yang paling jelas. `useEffect` di baris 22 **tidak punya dependency array**, sehingga berjalan setelah *setiap* render. Artinya setiap huruf yang diketik di input memicu `JSON.stringify` seluruh list dan menulisnya ke `localStorage`.
>
> Effect ini memang tidak sampai menjadi infinite loop karena tidak memanggil `setState`. Tapi kalau suatu saat ada orang yang menambahkan `setState` di dalamnya, hasilnya langsung menjadi loop tak berujung.
>
> Perbaikannya: tambahkan `[todos]`. Sekarang effect hanya berjalan saat isi list benar-benar berubah."

### 4. Load data: flash list kosong dan crash — B:8, B:13-19 vs A:4-11

> "Di kode lama, state dimulai dari `[]`, lalu sebuah effect terpisah membaca `localStorage` dan memanggil `setTodos`. Akibatnya ada **render ekstra**: layar sempat menampilkan list kosong. Selain itu, kalau data yang tersimpan rusak, `JSON.parse` melempar error dan seluruh halaman menjadi putih.
>
> Sekarang saya memakai **lazy initializer** di `useState`. Data dibaca satu kali saat mount, tanpa render tambahan, dan dibungkus `try/catch` plus pengecekan `Array.isArray`. Kalau datanya rusak, aplikasi mulai dengan list kosong, bukan crash. Effect load yang lama jadi bisa dihapus."

### 5. Kalkulasi ulang setiap render — B:56-72 vs A:46-51

> "`getFilteredTodos()` dan objek `stats` dihitung ulang di setiap render, termasuk saat user mengetik. Daftar todo bahkan di-filter tiga kali.
>
> Sekarang filter dan jumlah completed dibungkus `useMemo` dengan dependency `[todos, filter]`, sehingga hanya dihitung ulang saat datanya berubah. Nilai `active` cukup didapat dari `total - completed`.
>
> Saat mengerjakan bagian ini, saya juga menemukan bug: todo lama yang tidak punya field `completed` hilang dari filter Active. Sekarang pengecekannya memakai `Boolean(t.completed)`, dan sudah ada test untuk kasus ini."

---

## 4:15 – 6:00 | Kualitas kode dan aksesibilitas

### 6. ID bisa bentrok — B:33-39 vs A:25-29
> "`Date.now()` bisa menghasilkan ID yang sama kalau dua todo ditambahkan dalam milidetik yang sama. Akibatnya, mencentang satu todo bisa ikut mengubah todo lain. Sekarang saya memakai `crypto.randomUUID()` bawaan browser. Field `createdAt` yang tidak pernah dipakai juga saya hapus."

### 7. `onKeyPress` deprecated → `<form>` — B:80-93 vs A:57-66
> "`onKeyPress` sudah deprecated. Sekarang input dan tombol dibungkus `<form onSubmit>`, sehingga menekan Enter dan mengklik Add menjalankan jalur yang sama. Ini cara standar browser, tanpa perlu handler keyboard buatan sendiri."

### 8. Tombol filter copy-paste dan inline style — B:95-115 vs A:68-80
> "Tiga tombol yang hampir identik, masing-masing dengan inline style warna. Sekarang semuanya di-render dari satu array `['all','active','completed']`. Style dipindah ke `index.css` lewat class `.active`, dan saya tambahkan `aria-pressed` supaya screen reader tahu filter mana yang sedang aktif."

### 9. Label aksesibilitas — A:60, A:91, A:97
> "Sebelumnya screen reader hanya membaca 'checkbox' dan 'Delete' tanpa konteks. Sekarang yang dibaca adalah *Complete "Buy milk"* dan *Delete "Buy milk"*, dan input juga punya `aria-label`."

### 10. Error boundary — `src/main.jsx`, `src/ErrorBoundary.jsx`
> "Satu-satunya file baru adalah `ErrorBoundary`, 18 baris. File ini membungkus `<App />`, sehingga kalau ada error saat render, user melihat pesan ramah, bukan layar putih."

---

## 6:00 – 7:00 | Yang sengaja tidak dikerjakan

> "Ada beberapa poin di audit yang sengaja tidak saya kerjakan:
>
> - **Prop drilling**: di aplikasi ini memang tidak ada. Semuanya berada di satu komponen sekitar 110 baris. Memecahnya menjadi beberapa komponen justru *menciptakan* prop drilling, padahal belum dibutuhkan.
> - **`useCallback` dan custom hook `useTodos`**: tidak ada child component yang di-memo, jadi `useCallback` tidak memberi manfaat apa pun dan hanya menambah kerumitan.
> - **Mengganti `key` dari index ke ID**: ternyata kodenya sudah memakai `todo.id`. Ini false alarm.
> - **`try/catch` di `deleteTodo`**: kode itu tidak mungkin melempar error.
> - **TypeScript dan empty state**: itu tool atau fitur baru, sehingga di luar scope."

---

## 7:00 – 8:00 | Bukti dan penutup

**Demo di terminal:** jalankan `pnpm test`.

> "Ada 22 test dan semuanya lulus, padahal sebelumnya hanya 5. Setiap perbaikan punya test sendiri, jadi kalau bug yang sama muncul lagi, test akan gagal.
>
> Ringkasnya: masalah keamanan saya perbaiki lebih dulu, lalu re-render dan stabilitas, terakhir aksesibilitas dan kerapian. Kodenya jadi lebih pendek, lebih aman, dan semuanya teruji. Terima kasih, saya siap menjawab pertanyaan."

---

## Cadangan Q&A

**"Mana prop drilling-nya?"**
> Di aplikasi ini tidak ada prop drilling karena hanya ada satu komponen. Saya memilih tidak memecahnya, karena memecah komponen justru akan memunculkan prop drilling. Kalau aplikasinya bertambah besar, langkah pertama saya adalah memecah komponen, lalu memakai Context kalau props mulai melewati lebih dari dua level.

**"Apakah `useEffect` tanpa dependency itu infinite loop?"**
> Di kode ini tidak, karena effect tersebut tidak memanggil `setState`. Tapi effect itu berjalan di setiap render, dan cukup satu `setState` ditambahkan di dalamnya untuk menjadikannya infinite loop. Karena itu dependency `[todos]` tetap wajib ditambahkan.

**"Kenapa tidak memakai `useCallback`?"**
> `useCallback` hanya berguna kalau fungsi tersebut dikirim ke child component yang dibungkus `React.memo`. Di aplikasi ini tidak ada child seperti itu, jadi `useCallback` hanya menambah biaya tanpa manfaat.

**"Kenapa tidak memakai DOMPurify?"**
> Todo tidak butuh HTML sama sekali. Render sebagai teks sudah cukup dan React melakukannya secara default.

**"Kalau ada waktu lebih?"**
> Saya akan membersihkan sisa komentar `// Issue 7`, `{/* Issue 13 */}`, dan `// Issue 14` (A:35, A:83, A:85), menyisakan satu lockfile saja, dan memasang CI supaya `pnpm test` berjalan otomatis di setiap PR.
