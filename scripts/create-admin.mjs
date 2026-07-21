// Usage: node scripts/create-admin.mjs <username> <password> [role]
//   role defaults to "admin" — pass "superadmin" for the top role.
//
// Requires SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_URL to be
// set in your environment (e.g. run via: node -r dotenv/config
// scripts/create-admin.mjs ... , or export them in your shell first).

import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const [, , username, password, roleArg] = process.argv;

if (!username || !password) {
  console.error("Usage: node scripts/create-admin.mjs <username> <password> [admin|superadmin]");
  process.exit(1);
}
if (password.length < 8) {
  console.error("Password must be at least 8 characters.");
  process.exit(1);
}

const role = roleArg === "superadmin" ? "superadmin" : "admin";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in your environment.");
  process.exit(1);
}

function hashPassword(pw) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(pw, salt, 64).toString("hex");
  return { hash, salt };
}

const sb = createClient(url, serviceKey);
const { hash, salt } = hashPassword(password);

const { error } = await sb.from("admin_users").insert({
  username,
  password_hash: hash,
  password_salt: salt,
  role,
});

if (error) {
  console.error("Failed to create admin:", error.message);
  process.exit(1);
}

console.log(`✅ Admin account "${username}" (${role}) created. Log in at /admin/login.`);
