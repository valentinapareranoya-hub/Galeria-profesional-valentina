const config = window.GALERIA_CONFIG || {};

export const isSupabaseConfigured = Boolean(
  config.supabaseUrl &&
  config.supabaseAnonKey &&
  !config.supabaseUrl.includes("TU-PROYECTO") &&
  !config.supabaseAnonKey.includes("TU-ANON")
);

if (!isSupabaseConfigured) {
  console.warn("Falta configurar Supabase en config.js");
}

export const bucketName = config.storageBucket || "photos";
export const supabase = isSupabaseConfigured
  ? window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey)
  : null;

export function slugify(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function loadGalleryData() {
  if (!isSupabaseConfigured) {
    throw new Error("Falta configurar Supabase en config.js");
  }

  const [{ data: categories, error: categoriesError }, { data: photos, error: photosError }] = await Promise.all([
    supabase.from("categories").select("*").order("sort_order", { ascending: true }).order("name"),
    supabase
      .from("photos")
      .select("*, categories(name, slug)")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false })
  ]);

  if (categoriesError) throw categoriesError;
  if (photosError) throw photosError;

  return {
    categories: categories || [],
    photos: photos || []
  };
}
