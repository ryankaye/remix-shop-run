-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_items" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "created" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "text" TEXT NOT NULL,
    "url1" TEXT NOT NULL DEFAULT '',
    "url2" TEXT NOT NULL DEFAULT '',
    "url3" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT '',
    "completed" TEXT NOT NULL DEFAULT 'off',
    "order" INTEGER NOT NULL,
    "due" TEXT NOT NULL DEFAULT '',
    "price" TEXT NOT NULL DEFAULT '',
    "sublistId" TEXT NOT NULL,
    CONSTRAINT "items_sublistId_fkey" FOREIGN KEY ("sublistId") REFERENCES "sublists" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_items" ("completed", "created", "due", "id", "order", "price", "status", "sublistId", "text", "url1", "url2", "url3") SELECT "completed", "created", "due", "id", "order", "price", "status", "sublistId", "text", "url1", "url2", "url3" FROM "items";
DROP TABLE "items";
ALTER TABLE "new_items" RENAME TO "items";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
