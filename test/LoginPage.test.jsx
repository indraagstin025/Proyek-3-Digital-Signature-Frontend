import React from "react";
import { vi, describe, test, beforeEach, afterEach, expect } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import LoginPage from "../src/pages/LoginPage/LoginPage.jsx";

/* ✅ Definisikan semua variabel mock SEBELUM vi.mock */
const mockNavigate = vi.fn();
const mockUseSearchParams = vi.fn(() => [new URLSearchParams(), vi.fn()]);
const mockUseLocation = vi.fn();

/* ✅ react-router-dom mock */
vi.mock("react-router-dom", () => {
  return {
    useNavigate: () => mockNavigate,
    useSearchParams: mockUseSearchParams,
    // --- PERBAIKAN ---
    // Hapus '() =>' agar hook-nya menjalankan mock function,
    // bukan mengembalikan mock function-nya.
    useLocation: mockUseLocation, // <-- INI PERBAIKANNYA
    // ------------------
    Link: ({ to, children }) => <a href={to}>{children}</a>,
  };
});

/* ✅ Mock authService dengan path absolut agar tidak gagal resolve */
const mockAuthService = {
  login: vi.fn(),
  loginWithGoogle: vi.fn(),
};
vi.mock("../src/services/authService", () => ({
  default: mockAuthService,
}));

/* ✅ Mock toast */
const mockToast = {
  success: vi.fn(),
  error: vi.fn(),
};
vi.mock("react-hot-toast", () => mockToast);

/* ✅ Setup fake timers */
vi.useFakeTimers();

/* ✅ Helper */
const fillForm = (email, password) => {
  fireEvent.change(screen.getByLabelText(/alamat email/i), {
    target: { value: email },
  });
  fireEvent.change(screen.getByLabelText(/password/i), {
    target: { value: password },
  });
};

describe("LoginPage Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseSearchParams.mockReturnValue([new URLSearchParams(), vi.fn()]);
    // Reset mock location ke state default sebelum setiap tes
    mockUseLocation.mockReturnValue({ state: null });
  });

  afterEach(() => {
    // Jalankan timer yang tersisa setelah setiap tes (jika ada)
    vi.runOnlyPendingTimers();
  });

  test("harus merender semua elemen formulir dasar", () => {
    render(<LoginPage />);
    expect(
      screen.getByRole("heading", { name: /selamat datang kembali/i })
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/alamat email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /lupa password\?/i })
    ).toHaveAttribute("href", "/forgot-password");
    expect(
      screen.getByRole("button", { name: /lanjutkan dengan google/i })
    ).toBeInTheDocument();

    // Majukan timer untuk animasi card
    vi.advanceTimersByTime(100);
  });

  // Salin/tempel kode ini untuk menggantikan tes 'show/hide' Anda
  // Ini memperbaiki cara pencarian tombol
  test("tombol show/hide password harus berfungsi dengan benar", () => {
    render(<LoginPage />);

    // Majukan timer untuk animasi card
    vi.advanceTimersByTime(100);

    const passwordInput = screen.getByLabelText(/password/i);
    // Tombol ikon tidak memiliki 'name', jadi kita cari berdasarkan elemen di sebelahnya
    const toggleButton = passwordInput.parentElement.querySelector("button");

    expect(passwordInput).toHaveAttribute("type", "password");
    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute("type", "text");
    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute("type", "password");
  });

  test("harus menampilkan pesan sukses toast jika ada message verifikasi di URL", () => {
    const params = new URLSearchParams("message=verification");
    mockUseSearchParams.mockReturnValue([params, vi.fn()]);

    render(<LoginPage />);

    expect(mockToast.success).toHaveBeenCalledWith(
      "Email Anda berhasil diverifikasi! Silakan login.",
      expect.any(Object)
    );

    // Majukan timer untuk animasi card
    vi.advanceTimersByTime(100);
  });

  test("harus berhasil login dan mengarahkan ke /dashboard untuk user biasa", async () => {
    const mockUser = { name: "User Test", isSuperAdmin: false };
    mockAuthService.login.mockResolvedValue({ user: mockUser });

    render(<LoginPage />);

    // Majukan timer untuk animasi card
    vi.advanceTimersByTime(100);

    fillForm("user@test.com", "password123");
    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    expect(screen.getByText(/memuat\.\.\./i)).toBeInTheDocument();

    await waitFor(() => {
      expect(mockAuthService.login).toHaveBeenCalledWith(
        "user@test.com",
        "password123"
      );
    });

    // Majukan timer untuk setTimeout navigasi (1500ms)
    vi.advanceTimersByTime(1500);

    expect(mockNavigate).toHaveBeenCalledWith("/dashboard", {
      state: {
        message: "Login berhasil, selamat datang User Test!",
      },
    });
  });

  test("harus mengarahkan ke /admin/dashboard jika user adalah SuperAdmin", async () => {
    const mockAdmin = { name: "Admin Test", isSuperAdmin: true };
    mockAuthService.login.mockResolvedValue({ user: mockAdmin });

    render(<LoginPage />);

    // Majukan timer untuk animasi card
    vi.advanceTimersByTime(100);

    fillForm("admin@test.com", "admin123");
    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(mockAuthService.login).toHaveBeenCalled();
    });

    // Majukan timer untuk setTimeout navigasi (1500ms)
    vi.advanceTimersByTime(1500);

    expect(mockNavigate).toHaveBeenCalledWith(
      "/admin/dashboard",
      expect.any(Object)
    );
  });

  test("harus menangani error 401 (Email/Password Salah)", async () => {
    mockAuthService.login.mockRejectedValue({
      response: { status: 401, data: { message: "Invalid credentials" } },
    });

    render(<LoginPage />);

    // Majukan timer untuk animasi card
    vi.advanceTimersByTime(100);

    fillForm("wrong@test.com", "wrongpassword");
    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith(
        "Email atau Password yang Anda masukkan salah."
      );
      expect(
        screen.getByText(/email atau password yang anda masukkan salah\./i)
      ).toBeInTheDocument();
    });

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test("harus menangani error EMAIL_NOT_VERIFIED", async () => {
    mockAuthService.login.mockRejectedValue({
      response: { status: 403, data: { code: "EMAIL_NOT_VERIFIED" } },
    });

    render(<LoginPage />);

    // Majukan timer untuk animasi card
    vi.advanceTimersByTime(100);

    fillForm("unverified@test.com", "password");
    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith(
        "Email Anda belum dikonfirmasi, silakan periksa kotak masuk Anda."
      );
    });
  });

  test("harus menangani error koneksi jaringan (No Response)", async () => {
    mockAuthService.login.mockRejectedValue({ message: "Network Error" });

    render(<LoginPage />);

    // Maju timer untuk animasi card
    vi.advanceTimersByTime(100);

    fillForm("any@test.com", "anypass");
    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith(
        "Tidak dapat terhubung ke server. Periksa koneksi internet Anda."
      );
    });
  });
});