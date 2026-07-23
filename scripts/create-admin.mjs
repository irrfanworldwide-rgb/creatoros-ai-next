// Usage: node scripts/create-admin.mjs <username> <password> [role]
//   role defaults to "admin" — pass "superadmin" for the top role.
//
// Automatically loads NEXT_PUBLIC_SUPABASE_URL and
// SUPABASE_SERVICE_ROLE_KEY from .env.local (falling back to .env) —
// no manual export needed, and no dotenv dependency added; this file
// resolves those .env files relative to its own location, not your
// current working directory, so it works the same whether you run it
// from the project root or anywhere else, on Windows, macOS, or Linux.

import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, ".."); // scripts/ -> project root

/**
 * Minimal .env file parser — reads KEY=VALUE lines, skips comments (#)
 * and blank lines, strips surrounding quotes, and handles both LF and
 * CRLF line endings (Windows-safe). Only sets a variable if it isn't
 * already present in process.env, matching how Next.js's own env
 * loading treats .env.local as a default rather than an override of
 * real environment variables.
 */
function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, "utf-8");
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const eqIndex = line.indexOf("=");
    if (eqIndex === -1) continue;

    const key = line.slice(0, eqIndex).trim().replace(/^export\s+/, "");
    let value = line.slice(eqIndex + 1).trim();

    // Strip matching surrounding quotes, if present.
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

// .env.local takes precedence; .env fills in anything still missing.
loadEnvFile(path.join(projectRoot, ".env.local"));
loadEnvFile(path.join(projectRoot, ".env"));

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
  console.error(
    "NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set.\n" +
      `Looked for them in:\n  ${path.join(projectRoot, ".env.local")}\n  ${path.join(projectRoot, ".env")}\n` +
      "and in your shell's environment. Confirm one of those files actually contains both variables " +
      "(no typos in the variable names, values not empty)."
  );
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
