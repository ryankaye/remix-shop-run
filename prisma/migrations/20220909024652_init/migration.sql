-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "joined" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "firstName" TEXT NOT NULL,
    "middleName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "image" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "lists" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "created" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "accountID" TEXT NOT NULL,
    CONSTRAINT "lists_accountID_fkey" FOREIGN KEY ("accountID") REFERENCES "accounts" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "sublists" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "created" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "listId" TEXT NOT NULL,
    CONSTRAINT "sublists_listId_fkey" FOREIGN KEY ("listId") REFERENCES "lists" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "items" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "created" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "text" TEXT NOT NULL,
    "url1" TEXT NOT NULL,
    "url2" TEXT NOT NULL,
    "url3" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "completed" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "due" TEXT NOT NULL,
    "price" TEXT NOT NULL DEFAULT '',
    "sublistId" TEXT NOT NULL,
    CONSTRAINT "items_sublistId_fkey" FOREIGN KEY ("sublistId") REFERENCES "sublists" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
