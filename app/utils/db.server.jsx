import { createClient } from "@supabase/supabase-js";
import { getSession } from "./session.server";
import { prisma } from "~/utils/prisma.server";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

export const supabaseClient = createClient(supabaseUrl, supabaseKey);

export const hasAuthSession = async (request) => {
  const session = await getSession(request.headers.get("Cookie"));
  if (!session.has("access_token")) throw Error("No session");
  supabaseClient.auth.setAuth(session.get("access_token"));
};

/*
  Get User Account
*/
export const getUserAccount = async (userId) => {
  const account = await prisma.accounts.findMany({
    where: {
      id: userId,
    },
  });
  return account;
};

/*
  Create User Account
*/
export const createUserAccount = async (userId, userEmail) => {
  const obj = { id: userId, email: userEmail, password: "" };
  const account = await prisma.accounts.create({
    data: obj,
  });
  return account;
};

/*
  Get User Lists
*/
export const getUserLists = async (userId) => {
  const lists = await prisma.lists.findMany({
    where: {
      accountID: userId,
    },
    orderBy: {
      name: "asc",
    },
  });
  return { lists: lists };
};

/*
  Update List
*/
export const updateList = async (data, userId) => {
  const { id, order, ...obj } = { ...Object.fromEntries(data) };
  const checkedOrder = isNaN(order) ? { order: 0 } : { order: Number(order) };

  const obj2 = { ...obj, ...checkedOrder };

  const result = await prisma.lists.updateMany({
    where: {
      id: id,
    },
    data: obj2,
  });

  return result;
};

/*
  Add List
*/
export const addList = async (data, userId) => {
  const { order, ...obj } = { ...Object.fromEntries(data) };
  const checkedOrder = isNaN(order) ? { order: 900 } : { order: Number(order) };

  const manyResult = await prisma.lists.updateMany({
    where: {
      accountID: userId,
    },
    data: { order: { decrement: 1 } },
  });

  const obj2 = { ...obj, ...checkedOrder, ...{ accountID: userId } };

  const result = await prisma.lists.create({
    data: obj2,
  });

  return result;
};

/*
  Get All User Data
*/
export const getAllUserData = async (userId, currentListId) => {
  const lists = await prisma.lists.findMany({
    where: {
      accountID: userId,
    },
    orderBy: {
      name: "asc",
    },
    include: {
      subLists: {
        include: {
          items: {
            orderBy: {
              status: "desc",
            },
          },
        },
        orderBy: {
          order: "asc",
        },
      },
    },
  });

  const currentListIndexes = lists.map((el, index) => (el.id === currentListId ? index : -1)).filter((el) => el !== -1);
  const currentList = !currentListIndexes.length ? -1 : currentListIndexes[0];

  return { lists: lists, currentList: currentList };
};

/*
  updateItem
*/
export const updateItem = async (data) => {
  const { id, transaction, order, ...obj } = { ...Object.fromEntries(data) };

  //const c = completed === "on" ? { completed: "on" } : { completed: "off" };
  const checkedOrder = isNaN(order) ? { order: 0 } : { order: Number(order) };
  const o = { ...obj, ...checkedOrder };

  const result = await prisma.items.updateMany({
    where: {
      id: id,
    },
    data: o,
  });

  return result;
};

/*
  addItem
*/
export const addItem = async (data) => {
  const { id, transaction, completed, order, ...obj } = { ...Object.fromEntries(data) };

  const c = completed === "on" ? { completed: "on" } : { completed: "off" };
  const checkedOrder = isNaN(order) ? { order: 0 } : { order: Number(order) };
  const o = { ...obj, ...c, ...checkedOrder };

  const sublistId = data.get("sublistId");

  const manyResult = await prisma.items.updateMany({
    where: {
      sublistId: sublistId,
    },
    data: { order: { decrement: 1 } },
  });

  const result = await prisma.items.create({
    data: o,
  });

  return result;
};

/*
  addSubList
*/
export const addSubList = async (data) => {
  const { id, transaction, order, ...obj } = { ...Object.fromEntries(data) };
  const checkedOrder = isNaN(order) ? { order: 0 } : { order: Number(order) };
  const listId = data.get("listId");

  const manyResult = await prisma.sublists.updateMany({
    where: {
      listId: id,
    },
    data: { order: { increment: 1 } },
  });

  const result = await prisma.sublists.create({
    data: { ...obj, ...checkedOrder },
  });

  return result;
};

/*
  update List Sub Lists - Batch updater
*/
export const updateListSubLists = async (data) => {
  const { transaction, listId, noOfItems, ...obj } = { ...Object.fromEntries(data) };
  const items = new Array(Number(noOfItems)).fill({ index: -1 });

  for (const key in obj) {
    const newKeys = key.split("|");
    items[newKeys[1]] = { ...items[newKeys[1]], ...{ [newKeys[0]]: obj[key] }, ...{ index: newKeys[1] }, ...{ listId: listId } };
  }

  const amendedItem = items.filter((el) => el.order !== el.hiddenorder);
  const amended = amendedItem.length ? amendedItem[0] : {};

  const items2 = items
    .map((el) => {
      if (amendedItem.length) {
        const direction = Number(amended.hiddenorder) - Number(amended.order);
        if (el.id !== amended.id && el.order >= amended.order) {
          direction < 0 ? el.order-- : el.order++;
        }
      }
      return el;
    })
    .sort((a, b) => {
      return a.order - b.order;
    });

  const results = [];
  for (let i = 0; i < noOfItems; i++) {
    let myitem = items2[i];
    results[i] = await prisma.sublists.update({
      where: { id: myitem.id },
      data: { name: myitem.name, order: i },
    });
  }

  return results;
};

/*
  addSubList
*/
export const updateSubList = async (data) => {
  const { id, transaction, order, ...obj } = { ...Object.fromEntries(data) };
  const checkedOrder = isNaN(order) ? { order: 0 } : { order: Number(order) };

  const result = await prisma.sublists.updateMany({
    where: {
      id: id,
    },
    data: { ...obj, ...checkedOrder },
  });

  return result;
};
