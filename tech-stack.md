# Technical Specification: Nikken Paint Reservation System

**Document Date:** November 21, 2025
**Project Name:** Nikken Paint Reservation Mobile Application
**Subject:** Technology Stack and Versioning Overview

---

## 1. Executive Summary
Dokumen ini merangkum arsitektur teknis dan versi perangkat lunak yang digunakan dalam pengembangan sistem reservasi Nikken Paint. Sistem dibangun menggunakan pendekatan *Modern Software Architecture* untuk menjamin skalabilitas, keamanan data, dan pengalaman pengguna yang responsif.

---

## 2. Client-Side Architecture (Mobile Application)
Pengembangan aplikasi *mobile* berfokus pada kompatibilitas lintas platform (Android & iOS) dengan performa mendekati aplikasi *native*.

* **Core Framework:** **Flutter SDK v3.6.1**
    * *Fungsi:* Framework pengembangan utama yang memungkinkan aplikasi berjalan lancar di berbagai jenis perangkat dengan satu basis kode.
* **Programming Language:** **Dart** (Latest Stable Release)
    * *Fungsi:* Bahasa pemrograman yang dioptimalkan untuk antarmuka pengguna (UI) yang cepat dan fluid.
* **State Management:** **BLoC (Business Logic Component) v9.0.0**
    * *Fungsi:* Standar industri untuk memisahkan logika bisnis dari tampilan antarmuka. Ini menjamin aplikasi tetap stabil dan mudah dipelihara (maintainable) saat fitur bertambah kompleks.
* **Key Modules:**
    * **Networking:** HTTP & Socket.IO Client (Untuk komunikasi data *real-time* dengan server).
    * **Geolocation:** Google Maps Flutter & Geolocator (Layanan pemetaan lokasi bengkel presisi).
    * **Local Storage:** Shared Preferences (Manajemen sesi pengguna secara lokal).

---

## 3. Server-Side Infrastructure (Backend API)
Sisi *backend* dirancang untuk menangani beban transaksi tinggi dengan latensi rendah, didukung oleh validasi data yang ketat.

* **Runtime Environment:** **Node.js (Support v22)**
    * *Fungsi:* Lingkungan eksekusi server yang mampu menangani ribuan permintaan konkuren (I/O non-blocking).
* **Language:** **TypeScript v5.7**
    * *Fungsi:* Pengembangan menggunakan *Static Typing* untuk meningkatkan keandalan kode, meminimalisir *bug* runtime, dan memudahkan audit sistem.
* **Web Framework:** **Express.js v4.21**
    * *Fungsi:* Framework server yang ringan dan fleksibel untuk manajemen API (Application Programming Interface).
* **Database Management:**
    * **Database:** PostgreSQL (Relational Database Management System).
    * **ORM (Object-Relational Mapping):** **Prisma v6.4**.
    * *Fungsi:* Prisma v6 merupakan teknologi terbaru untuk interaksi database yang aman (Type-Safe Database Access), memastikan integritas data pesanan dan pengguna terjaga dengan ketat.

---

## 4. Third-Party Integrations & Services
Sistem ini terintegrasi dengan berbagai layanan eksternal terpercaya untuk mendukung operasional bisnis.

* **Payment Gateway:** **Midtrans Client v1.4**
    * *Fungsi:* Memfasilitasi transaksi pembayaran digital yang aman dan otomatis.
* **Authentication & Notification:** **Firebase Admin SDK v13**
    * *Fungsi:* Mengelola notifikasi (Push Notification) ke perangkat pengguna dan verifikasi keamanan.
* **Media Content Delivery:** **ImageKit & Cloudinary**
    * *Fungsi:* Optimalisasi penyimpanan dan pengiriman aset gambar (foto kondisi kendaraan) agar aplikasi tetap ringan saat dimuat.

---

## 5. DevOps, Monitoring, and Reliability
Untuk memastikan ketersediaan layanan (uptime) yang tinggi, kami menerapkan standar infrastruktur modern.

* **Containerization:** **Docker**
    * *Fungsi:* Membungkus aplikasi dalam kontainer terisolasi untuk memastikan konsistensi berjalan di lingkungan development maupun production.
* **Logging:** **Winston Logger**
    * *Fungsi:* Pencatatan aktivitas sistem secara terperinci untuk keperluan audit dan *debugging*.

---
