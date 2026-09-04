/**
 * Giriş Sayfası - Lojik
 * Admin kullanıcılarının giriş yapması
 */

import { supabase, signIn, getCurrentUser } from './supabase-client.js';

// DOM Elementleri
const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const loginBtn = document.getElementById('loginBtn');
const btnText = document.querySelector('.btn-text');
const btnLoader = document.getElementById('btnLoader');
const errorMessage = document.getElementById('errorMessage');

/**
 * Hata Mesajını Göster
 */
function showError(message) {
  errorMessage.textContent = message;
  errorMessage.classList.add('show');
}

/**
 * Hata Mesajını Gizle
 */
function hideError() {
  errorMessage.textContent = '';
  errorMessage.classList.remove('show');
}

/**
 * Loading Durumunu Göster
 */
function setLoading(isLoading) {
  loginBtn.disabled = isLoading;
  if (isLoading) {
    btnText.style.display = 'none';
    btnLoader.style.display = 'inline-flex';
  } else {
    btnText.style.display = 'inline';
    btnLoader.style.display = 'none';
  }
}

/**
 * Form Submit İşleyicisi
 */
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  hideError();

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  // Validasyon
  if (!email || !password) {
    showError('Lütfen e-posta ve şifre alanlarını doldurun.');
    return;
  }

  setLoading(true);

  try {
    // Supabase'te giriş yap
    await signIn(email, password);

    // Giriş başarılı, dashboard'a yönlendir
    window.location.href = 'dashboard.html';
  } catch (error) {
    // Hata mesajını göster
    const errorMsg = error.message || 'Giriş başarısız. Lütfen e-posta ve şifreyi kontrol edin.';
    
    if (error.message.includes('Invalid login credentials')) {
      showError('Hatalı e-posta veya şifre. Lütfen tekrar deneyin.');
    } else if (error.message.includes('Email not confirmed')) {
      showError('E-posta adresinizi henüz doğrulamadınız. Lütfen e-posta adresinizi kontrol edin.');
    } else {
      showError(errorMsg);
    }

    console.error('Giriş hatası:', error);
  } finally {
    setLoading(false);
  }
});

/**
 * Sayfa Yüklendiğinde
 * Eğer zaten giriş yapmışsa, dashboard'a yönlendir
 */
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const user = await getCurrentUser();
    if (user) {
      // Zaten giriş yapılmış
      window.location.href = 'dashboard.html';
    }
  } catch (error) {
    console.log('Kullanıcı giriş yapmamış:', error.message);
  }
});
