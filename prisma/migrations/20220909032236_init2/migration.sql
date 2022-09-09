-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_accounts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL DEFAULT '',
    "joined" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "firstName" TEXT NOT NULL DEFAULT '',
    "middleName" TEXT NOT NULL DEFAULT '',
    "lastName" TEXT NOT NULL DEFAULT '',
    "fullName" TEXT NOT NULL DEFAULT '',
    "image" TEXT NOT NULL DEFAULT ''
);
INSERT INTO "new_accounts" ("email", "firstName", "fullName", "id", "image", "joined", "lastName", "middleName", "password") SELECT "email", "firstName", "fullName", "id", "image", "joined", "lastName", "middleName", "password" FROM "accounts";
DROP TABLE "accounts";
ALTER TABLE "new_accounts" RENAME TO "accounts";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
