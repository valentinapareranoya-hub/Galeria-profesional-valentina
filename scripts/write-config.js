const fs = require("fs");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_PUBLISHABLE_KEY;
const storageBucket = process.env.SUPABASE_STORAGE_BUCKET || "photos";

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_PUBLISHABLE_KEY");
}

const config = `window.GALERIA_CONFIG = {
  supabaseUrl: ${JSON.stringify(supabaseUrl)},
  supabaseAnonKey: ${JSON.stringify(supabaseAnonKey)},
  storageBucket: ${JSON.stringify(storageBucket)}
};
`;

fs.writeFileSync("config.js", config);

