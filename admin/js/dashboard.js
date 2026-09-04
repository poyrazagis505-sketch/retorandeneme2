/**
 * Dashboard - Ana sayfa
 * Restoran istatistikleri, hızlı işlemler, QR kod
 */

import { 
  supabase,
  getCurrentUser,
  getRestaurantInfo,
  getCategories,
  getProducts,
  signOut
} from './supabase-client.js';

// DOM Elementleri
const restaurantName = document.getElementById('restaurantName');
const statsGrid = document.getElementById('statsGrid');
const quickActions = document.getElementById('quickActions');
const loading = document.getElementById('loading');
const errorMessage = document.getElementById('error');
const logoutBtn = document.getElementById('logoutBtn');
const qrBtn = document.getElementById('qrBtn');
const qrModal = document.getElementById('qrModal');
const closeQrModal = document.getElementById('closeQrModal');
const copyQrBtn = document.getElementById('copyQrBtn');
const qrLink = document.getElementById('qrLink');

/**
 * Hata Mesajını Göster
 */
function showError(message) {
  errorMessage.textContent = message;
  errorMessage.style.display = 'block';
}

/**
 * Hata Mesajını Gizle
 */
function hideError() {
  errorMessage.style.display = 'none';
}

/**
 * Sayfa Yükle
 */
async function loadDashboard() {
  loading.style.display = 'flex';
  hideError();

  try {
    // Giriş yapan kullanıcıyı kontrol et
    const user = await getCurrentUser();
    if (!user) {
      window.location.href = 'login.html';
      return;
    }

    // Restoran bilgilerini getir
    const restaurant = await getRestaurantInfo();
    restaurantName.textContent = `Merhaba, ${restaurant.name}!`;

    // Kategorileri getir
    const categories = await getCategories();

    // Ürünleri getir
    const products = await getProducts();

    // İstatistikleri hesapla
    const totalProducts = products.length;
    const activeProducts = products.filter(p => p.is_active).length;
    const productsWithImages = products.filter(p => p.image_url).length;

    // İstatistikleri göster
    document.getElementById('categoryCount').textContent = categories.length;
    document.getElementById('totalProducts').textContent = totalProducts;
    document.getElementById('activeProducts').textContent = activeProducts;
    document.getElementById('productsWithImages').textContent = productsWithImages;

    // QR linkini hazırla
    const qrLinkValue = `${window.location.origin}/menu/${restaurant.slug}`;
    qrLink.value = qrLinkValue;

    // Sayfayı göster
    loading.style.display = 'none';
    statsGrid.style.display = 'grid';
    quickActions.style.display = 'block';
  } catch (error) {
    loading.style.display = 'none';
    console.error('Dashboard yüklemesi başarısız:', error);
    showError(error.message || 'Sayfa yüklenirken bir hata oluştu.');
  }
}

/**
 * QR Modal'ı Aç
 */
qrBtn.addEventListener('click', () => {
  qrModal.style.display = 'flex';
});

/**
 * QR Modal'ı Kapat
 */
closeQrModal.addEventListener('click', () => {
  qrModal.style.display = 'none';
});

/**
 * Modal dışında tıklanınca kapat
 */
qrModal.addEventListener('click', (e) => {
  if (e.target === qrModal) {
    qrModal.style.display = 'none';
  }
});

/**
 * QR Linki Kopyala
 */
copyQrBtn.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(qrLink.value);
    
    // Buton metnini değiştir
    const originalText = copyQrBtn.textContent;
    copyQrBtn.textContent = '✓ Kopyalandı!';
    
    setTimeout(() => {
      copyQrBtn.textContent = originalText;
    }, 2000);
  } catch (error) {
    showError('Linki kopyalama başarısız oldu.');
    console.error('Kopyalama hatası:', error);
  }
});

/**
 * Çıkış Yap
 */
logoutBtn.addEventListener('click', async () => {
  if (confirm('Çıkış yapmak istediğinizden emin misiniz?')) {
    try {
      await signOut();
      window.location.href = 'login.html';
    } catch (error) {
      showError('Çıkış yapılırken bir hata oluştu.');
      console.error('Çıkış hatası:', error);
    }
  }
});

/**
 * Sayfa yüklendiğinde
 */
document.addEventListener('DOMContentLoaded', loadDashboard);
