/**
 * Supabase İstemcisi
 * Veritabanı ve Storage işlemleri için merkezi bağlantı
 */

// Supabase URL ve API Keys (.env.local'dan gelecek)
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Supabase kütüphanesini import et
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// Supabase istemcisini oluştur
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Giriş Yapan Kullanıcının Restoran ID'sini Al
 */
export async function getRestaurantId() {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('Kullanıcı giriş yapmamış');
  }

  const { data, error } = await supabase
    .from('users')
    .select('restaurant_id')
    .eq('id', user.id)
    .single();

  if (error) throw error;
  return data.restaurant_id;
}

/**
 * Giriş Yapan Kullanıcının Restoran Bilgilerini Al
 */
export async function getRestaurantInfo() {
  const restaurantId = await getRestaurantId();
  
  const { data, error } = await supabase
    .from('restaurants')
    .select('*')
    .eq('id', restaurantId)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Kullanıcı Giriş Yap (Email + Şifre)
 */
export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

/**
 * Kullanıcı Çıkış Yap
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/**
 * Şifremi Unuttum (Email Gönder)
 */
export async function resetPassword(email) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/admin/reset-password.html`,
  });

  if (error) throw error;
}

/**
 * Giriş Yapan Kullanıcıyı Kontrol Et
 */
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

/**
 * Kategorileri Getir (Restoran ID'sine göre)
 */
export async function getCategories() {
  const restaurantId = await getRestaurantId();

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return data;
}

/**
 * Kategori Ekle
 */
export async function addCategory(name) {
  const restaurantId = await getRestaurantId();

  const { data, error } = await supabase
    .from('categories')
    .insert([
      {
        restaurant_id: restaurantId,
        name,
        sort_order: 0,
        is_active: true,
      },
    ])
    .select();

  if (error) throw error;
  return data[0];
}

/**
 * Kategori Güncelle
 */
export async function updateCategory(categoryId, updates) {
  const { data, error } = await supabase
    .from('categories')
    .update(updates)
    .eq('id', categoryId)
    .select();

  if (error) throw error;
  return data[0];
}

/**
 * Kategori Sil
 */
export async function deleteCategory(categoryId) {
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', categoryId);

  if (error) throw error;
}

/**
 * Ürünleri Getir (Restoran ID'sine göre)
 */
export async function getProducts() {
  const restaurantId = await getRestaurantId();

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .order('category_id', { ascending: true })
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return data;
}

/**
 * Kategoriye göre Ürünleri Getir
 */
export async function getProductsByCategory(categoryId) {
  const restaurantId = await getRestaurantId();

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .eq('category_id', categoryId)
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return data;
}

/**
 * Ürün Ekle
 */
export async function addProduct(productData) {
  const restaurantId = await getRestaurantId();

  const { data, error } = await supabase
    .from('products')
    .insert([
      {
        restaurant_id: restaurantId,
        ...productData,
        is_active: true,
      },
    ])
    .select();

  if (error) throw error;
  return data[0];
}

/**
 * Ürün Güncelle
 */
export async function updateProduct(productId, updates) {
  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', productId)
    .select();

  if (error) throw error;
  return data[0];
}

/**
 * Ürün Sil
 */
export async function deleteProduct(productId) {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', productId);

  if (error) throw error;
}

/**
 * Fotoğrafı Storage'a Yükle
 */
export async function uploadProductImage(file, fileName) {
  const filePath = `${Date.now()}-${fileName}`;

  const { data, error } = await supabase.storage
    .from('product-images')
    .upload(filePath, file);

  if (error) throw error;

  // Yüklenen dosyanın public URL'sini oluştur
  const { data: publicData } = supabase.storage
    .from('product-images')
    .getPublicUrl(data.path);

  return publicData.publicUrl;
}

/**
 * Fotoğrafı Storage'dan Sil
 */
export async function deleteProductImage(imageUrl) {
  if (!imageUrl) return;

  // URL'den dosya adını çıkar
  const fileName = imageUrl.split('/').pop();
  
  const { error } = await supabase.storage
    .from('product-images')
    .remove([fileName]);

  if (error) {
    console.warn('Fotoğraf silinemedi:', error);
  }
}
