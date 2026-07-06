import { loadGalleryData } from "./supabaseClient.js";

const nav = document.querySelector("#categoryNav");
const gallery = document.querySelector("#gallery");
const lightbox = document.querySelector("#lightbox");
const lightboxImage = document.querySelector("#lightboxImage");
const lightboxLabel = document.querySelector("#lightboxLabel");
const closeLightbox = document.querySelector("#closeLightbox");
const prevPhoto = document.querySelector("#prevPhoto");
const nextPhoto = document.querySelector("#nextPhoto");

let activeCategory = "all";
let photos = [];
let categories = [];
let visiblePhotos = [];
let currentIndex = 0;

function categoryName(photo) {
  return photo.categories?.name || "Sin categoria";
}

function categorySlug(photo) {
  return photo.categories?.slug || "sin-categoria";
}

function renderNav() {
  const allButton = document.createElement("button");
  allButton.type = "button";
  allButton.textContent = "Todas";
  allButton.className = activeCategory === "all" ? "active" : "";
  allButton.addEventListener("click", () => setCategory("all"));
  nav.replaceChildren(allButton);

  categories.forEach((category) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = category.name;
    button.className = activeCategory === category.slug ? "active" : "";
    button.addEventListener("click", () => setCategory(category.slug));
    nav.append(button);
  });
}

function renderGallery() {
  visiblePhotos = photos.filter((photo) => activeCategory === "all" || categorySlug(photo) === activeCategory);

  if (!visiblePhotos.length) {
    gallery.innerHTML = '<p class="empty-state">No hay fotos publicadas en esta categoria.</p>';
    return;
  }

  const items = visiblePhotos.map((photo, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "photo-item";
    button.addEventListener("click", () => openLightbox(index));

    const img = document.createElement("img");
    img.src = photo.public_url;
    img.alt = photo.alt || photo.title || categoryName(photo);
    img.loading = "lazy";

    const overlay = document.createElement("span");
    overlay.className = "photo-overlay";
    overlay.innerHTML = `<span class="photo-category">${categoryName(photo)}</span>`;

    button.append(img, overlay);
    return button;
  });

  gallery.replaceChildren(...items);
}

function setCategory(slug) {
  activeCategory = slug;
  renderNav();
  renderGallery();
}

function openLightbox(index) {
  currentIndex = index;
  updateLightbox();
  lightbox.classList.add("visible");
  document.body.style.overflow = "hidden";
}

function close() {
  lightbox.classList.remove("visible");
  document.body.style.overflow = "";
}

function moveLightbox(direction) {
  if (!visiblePhotos.length || !lightbox.classList.contains("visible")) return;
  currentIndex = (currentIndex + direction + visiblePhotos.length) % visiblePhotos.length;
  updateLightbox();
}

function updateLightbox() {
  const photo = visiblePhotos[currentIndex];
  if (!photo) return;
  lightboxImage.src = photo.public_url;
  lightboxImage.alt = photo.alt || photo.title || categoryName(photo);
  lightboxLabel.textContent = categoryName(photo);
}

async function init() {
  try {
    const data = await loadGalleryData();
    categories = data.categories;
    photos = data.photos;
    renderNav();
    renderGallery();
  } catch (error) {
    gallery.innerHTML = '<p class="empty-state">Falta conectar Supabase en config.js para cargar la galeria.</p>';
    console.error(error);
  }
}

closeLightbox.addEventListener("click", close);
prevPhoto.addEventListener("click", () => moveLightbox(-1));
nextPhoto.addEventListener("click", () => moveLightbox(1));
lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) close();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") close();
  if (event.key === "ArrowLeft") moveLightbox(-1);
  if (event.key === "ArrowRight") moveLightbox(1);
});

init();

