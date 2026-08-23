#!/usr/bin/env node
/**
 * Creates the single demo project the console manages. Idempotent: the embed key is printed once,
 * when the row is created, and never regenerated afterwards.
 */
import { randomBytes } from "node:crypto";
import { connect } from "./lib/pg-client.mjs";

const SLUG = process.env.PATCHLET_PROJECT_SLUG ?? "not-mistral";

const PROJECT = {
  slug: SLUG,
  name: "Not Mistral",
  siteUrl: "https://not-mistral.vercel.app",
  repoFullName: "AadiDahake/not-mistral",
  repoDefaultBranch: "main",
  settings: { docsThreshold: 0.7, interfaceThreshold: 0.5, voice: "en_paul_neutral" },
};

const client = await connect();

try {
  const existing = await client.query("select embed_key from project where slug = $1", [PROJECT.slug]);
  if (existing.rowCount > 0) {
    console.log("seed exists");
  } else {
    const embedKey = `pk_${randomBytes(12).toString("hex")}`;
    await client.query(
      `insert into project (slug, name, embed_key, site_url, repo_full_name, repo_default_branch, settings)
       values ($1, $2, $3, $4, $5, $6, $7)`,
      [
        PROJECT.slug,
        PROJECT.name,
        embedKey,
        PROJECT.siteUrl,
        PROJECT.repoFullName,
        PROJECT.repoDefaultBranch,
        JSON.stringify(PROJECT.settings),
      ],
    );
    console.log(`created project ${PROJECT.slug}`);
    console.log(`embed key: ${embedKey}`);
    console.log("Set this as NEXT_PUBLIC_PATCHLET_KEY on the host app. It is not printed again.");
  }
} finally {
  await client.end();
}
