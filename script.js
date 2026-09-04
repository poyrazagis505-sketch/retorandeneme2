/* =========================================================
   EMBER SOFRASI — MENÜ ETKİLEŞİMLERİ
   1) Kategori butonuna tıklayınca ilgili bölüme smooth scroll
   2) Sayfa kaydırılırken hangi kategoride olunduğunu takip edip
      üstteki menüde o kategoriyi otomatik aktif hale getirme
   3) Ürün kutucuğuna tıklayınca/dokununca: görsel yukarı kayıp
      kaybolur, içerik ve fiyat aşağıdan yukarı kayarak görünür
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const productCards = document.querySelectorAll(".product-card");

  productCards.forEach((card) => {
    const toggle = () => {
      const isOpen = card.classList.toggle("is-open");
      card.setAttribute("aria-expanded", isOpen ? "true" : "false");
    };

    // Fare tıklaması veya dokunma (tap) — ikisi de "click" olayını tetikler
    card.addEventListener("click", toggle);

    // Klavye ile erişim: Enter veya Boşluk tuşu da aynı şekilde açıp kapatsın
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault(); // sayfanın kaymasını engelle (Boşluk tuşu)
        toggle();
      }
    });
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const categoryButtons = document.querySelectorAll(".category-btn");
  const sections = document.querySelectorAll(".category-section");

  if (!categoryButtons.length || !sections.length) return; // menu.html değilse (ör. index.html) çık

  /* ---- 1) Butona tıklanınca ilgili bölüme kaydır ---- */
  categoryButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-target");
      const targetSection = document.getElementById(targetId);
      if (!targetSection) return;

      targetSection.scrollIntoView({ behavior: "smooth", block: "start" });

      // Tıklanan butonu hemen aktif göster (kullanıcı geri bildirimi)
      setActiveButton(targetId);
    });
  });

  /* ---- 2) Kaydırma sırasında görünen bölüme göre aktif butonu güncelle ---- */
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveButton(entry.target.id);
        }
      });
    },
    {
      // Ekranın üst kısmına yakın bir bölge kesişimi tetiklesin
      // (sticky kategori barının yüksekliğini hesaba katar)
      rootMargin: "-80px 0px -70% 0px",
      threshold: 0,
    }
  );

  sections.forEach((section) => observer.observe(section));

  function setActiveButton(id) {
    categoryButtons.forEach((btn) => {
      const isMatch = btn.getAttribute("data-target") === id;
      btn.classList.toggle("is-active", isMatch);
    });

    // Aktif butonu mobilde yatay menü içinde görünür alana kaydır
    const activeBtn = document.querySelector(`.category-btn[data-target="${id}"]`);
    if (activeBtn) {
      activeBtn.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  }
});
