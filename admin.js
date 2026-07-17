import { bucketName, isSupabaseConfigured, loadGalleryData, slugify, supabase } from "./supabaseClient.js";

const loginView = document.querySelector("#loginView");
const adminView = document.querySelector("#adminView");
const loginForm = document.querySelector("#loginForm");
const loginStatus = document.querySelector("#loginStatus");
const adminStatus = document.querySelector("#adminStatus");
const logoutButton = document.querySelector("#logoutButton");
const photoForm = document.querySelector("#photoForm");
const photoFile = document.querySelector("#photoFile");
const photoTitle = document.querySelector("#photoTitle");
const photoCategory = document.querySelector("#photoCategory");
const photoOrder = document.querySelector("#photoOrder");
const photoList = document.querySelector("#photoList");
const categoryForm = document.querySelector("#categoryForm");
const categoryName = document.querySelector("#categoryName");
const categoryOrder = document.querySelector("#categoryOrder");
const categoryList = document.querySelector("#categoryList");

let categories = [];
let photos = [];

function createPhotoId() {
  if (window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }

  if (window.crypto?.getRandomValues) {
    const bytes = new Uint8Array(16);
    window.crypto.getRandomValues(bytes);
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;

    return [...bytes]
      .map((byte, index) => {
        const value = byte.toString(16).padStart(2, "0");
        return [4, 6, 8, 10].includes(index) ? `-${value}` : value;
      })
      .join("");
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
}

function setStatus(message) {
  adminStatus.textContent = message || "";
}

async function optimizePhoto(file) {
  if (!file.type.startsWith("image/") || file.type === "image/gif") return file;

  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const maxSide = 2200;
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));

  // Evita recomprimir archivos que ya tienen un tamaño razonable.
  if (scale === 1 && file.size < 1_500_000) {
    bitmap.close();
    return file;
  }

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const context = canvas.getContext("2d");
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/webp", 0.84));
  if (!blob) return file;

  return new File([blob], `${file.name.replace(/\.[^.]+$/, "")}.webp`, {
    type: "image/webp",
    lastModified: Date.now()
  });
}

function showAdmin(isLoggedIn) {
  loginView.classList.toggle("hidden", isLoggedIn);
  adminView.classList.toggle("hidden", !isLoggedIn);
}

function renderCategoryOptions() {
  photoCategory.replaceChildren();
  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category.id;
    option.textContent = category.name;
    photoCategory.append(option);
  });
}

function renderCategories() {
  if (!categories.length) {
    categoryList.innerHTML = '<p class="status">Todavia no hay categorias.</p>';
    return;
  }

  const items = categories.map((category) => {
    const pill = document.createElement("span");
    pill.className = "category-pill";
    pill.textContent = category.name;

    const button = document.createElement("button");
    button.type = "button";
    button.textContent = "x";
    button.title = "Borrar categoria";
    button.addEventListener("click", () => deleteCategory(category.id));

    pill.append(button);
    return pill;
  });

  categoryList.replaceChildren(...items);
}

function renderPhotos() {
  if (!photos.length) {
    photoList.innerHTML = '<p class="status">Todavia no hay fotos publicadas.</p>';
    return;
  }

  const rows = photos.map((photo) => {
    const row = document.createElement("article");
    row.className = "photo-row";

    const img = document.createElement("img");
    img.src = photo.public_url;
    img.alt = photo.alt || photo.title || "Foto";

    const details = document.createElement("div");
    const title = document.createElement("strong");
    title.textContent = photo.title || "Sin titulo";
    const meta = document.createElement("span");
    meta.textContent = `${photo.categories?.name || "Sin categoria"} · orden ${photo.sort_order}`;
    details.append(title, meta);

    const actions = document.createElement("div");
    actions.className = "row-actions";

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.className = "secondary-button";
    editButton.textContent = "Editar";
    editButton.addEventListener("click", () => editPhoto(photo));

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "danger-button";
    deleteButton.textContent = "Borrar";
    deleteButton.addEventListener("click", () => deletePhoto(photo));

    actions.append(editButton, deleteButton);
    row.append(img, details, actions);
    return row;
  });

  photoList.replaceChildren(...rows);
}

async function refresh() {
  const data = await loadGalleryData();
  categories = data.categories;
  photos = data.photos;
  renderCategoryOptions();
  renderCategories();
  renderPhotos();
}

async function uploadPhoto(event) {
  event.preventDefault();
  const file = photoFile.files[0];
  if (!file) return;

  setStatus("Optimizando foto...");
  let optimizedFile = file;
  try {
    optimizedFile = await optimizePhoto(file);
  } catch (error) {
    // Algunos navegadores antiguos no pueden convertir imágenes; se sube el original.
    console.warn("No se pudo optimizar la foto antes de subirla.", error);
  }
  setStatus("Subiendo foto...");
  const extension = optimizedFile.name.split(".").pop() || "jpg";
  const path = `${Date.now()}-${createPhotoId()}.${extension}`;

  const { error: uploadError } = await supabase.storage.from(bucketName).upload(path, optimizedFile, {
    cacheControl: "31536000",
    contentType: optimizedFile.type,
    upsert: false
  });
  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from(bucketName).getPublicUrl(path);
  const title = photoTitle.value.trim();
  const { error: insertError } = await supabase.from("photos").insert({
    title,
    alt: title,
    image_path: path,
    public_url: data.publicUrl,
    category_id: photoCategory.value,
    sort_order: Number(photoOrder.value || 0)
  });
  if (insertError) throw insertError;

  photoForm.reset();
  photoOrder.value = "0";
  await refresh();
  setStatus("Foto publicada.");
}

async function editPhoto(photo) {
  const title = window.prompt("Titulo de la foto", photo.title || "");
  if (title === null) return;

  const order = window.prompt("Orden", String(photo.sort_order || 0));
  if (order === null) return;

  const categoryNames = categories.map((category) => category.name).join(", ");
  const category = window.prompt(`Categoria (${categoryNames})`, photo.categories?.name || "");
  if (category === null) return;

  const selectedCategory = categories.find((item) => item.name.toLowerCase() === category.trim().toLowerCase());
  if (!selectedCategory) {
    setStatus("Categoria no encontrada.");
    return;
  }

  const { error } = await supabase
    .from("photos")
    .update({
      title: title.trim(),
      alt: title.trim(),
      sort_order: Number(order || 0),
      category_id: selectedCategory.id
    })
    .eq("id", photo.id);
  if (error) throw error;

  await refresh();
  setStatus("Foto actualizada.");
}

async function deletePhoto(photo) {
  if (!window.confirm("Borrar esta foto de la galeria?")) return;

  const { error: dbError } = await supabase.from("photos").delete().eq("id", photo.id);
  if (dbError) throw dbError;

  await supabase.storage.from(bucketName).remove([photo.image_path]);
  await refresh();
  setStatus("Foto borrada.");
}

async function createCategory(event) {
  event.preventDefault();
  const name = categoryName.value.trim();
  if (!name) return;

  const { error } = await supabase.from("categories").insert({
    name,
    slug: slugify(name),
    sort_order: Number(categoryOrder.value || 0)
  });
  if (error) throw error;

  categoryForm.reset();
  categoryOrder.value = "0";
  await refresh();
  setStatus("Categoria agregada.");
}

async function deleteCategory(id) {
  if (!window.confirm("Borrar esta categoria? Las fotos quedaran sin categoria.")) return;
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw error;
  await refresh();
  setStatus("Categoria borrada.");
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!isSupabaseConfigured) {
    loginStatus.textContent = "Falta configurar Supabase en config.js.";
    return;
  }

  loginStatus.textContent = "Ingresando...";
  const form = new FormData(loginForm);
  const { error } = await supabase.auth.signInWithPassword({
    email: form.get("email"),
    password: form.get("password")
  });

  if (error) {
    loginStatus.textContent = "No se pudo ingresar. Revisar email y password.";
    return;
  }

  loginStatus.textContent = "";
  showAdmin(true);
  await refresh();
});

logoutButton.addEventListener("click", async () => {
  await supabase.auth.signOut();
  showAdmin(false);
});

photoForm.addEventListener("submit", (event) => {
  uploadPhoto(event).catch((error) => {
    console.error(error);
    setStatus(error.message || "No se pudo subir la foto.");
  });
});

categoryForm.addEventListener("submit", (event) => {
  createCategory(event).catch((error) => {
    console.error(error);
    setStatus(error.message || "No se pudo guardar la categoria.");
  });
});

if (!isSupabaseConfigured) {
  loginStatus.textContent = "Falta configurar Supabase en config.js.";
} else {
  const { data } = await supabase.auth.getSession();
  showAdmin(Boolean(data.session));
  if (data.session) {
    refresh().catch((error) => {
      console.error(error);
      setStatus("No se pudieron cargar los datos.");
    });
  }
}
