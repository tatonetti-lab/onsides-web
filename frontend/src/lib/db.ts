import "server-only";
import { Database } from "bun:sqlite";

export const db = new Database(
  "/Users/zietzm/projects/onsides_v3/database/onsides.db",
);
