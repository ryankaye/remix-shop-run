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
  getUserLists
*/
export const getUserLists = async (userId) => {
  const lists = await prisma.lists.findMany({
    where: {
      accountID: userId,
    },
    orderBy: {
      order: "asc",
    },
  });

  return { lists: lists };
};

/*
  updateItem
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
  updateItem
*/
export const addList = async (data, userId) => {
  const { order, ...obj } = { ...Object.fromEntries(data) };
  const checkedOrder = isNaN(order) ? { order: 0 } : { order: Number(order) };

  const obj2 = { ...obj, ...checkedOrder, ...{ accountID: userId } };

  const result = await prisma.lists.create({
    data: obj2,
  });

  return result;
};

/*
  getAllUserData
*/
export const getAllUserData = async (userId, currentListId) => {
  const lists = await prisma.lists.findMany({
    where: {
      accountID: userId,
    },
    orderBy: {
      order: "asc",
    },
    include: {
      subLists: {
        include: {
          items: {
            orderBy: {
              order: "asc",
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
  const { id, transaction, order, completed, ...obj } = { ...Object.fromEntries(data) };

  const c = completed === "on" ? { completed: "on" } : { completed: "off" };
  const checkedOrder = isNaN(order) ? { order: 0 } : { order: Number(order) };
  const o = { ...obj, ...c, ...checkedOrder };

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

  const result = await prisma.sublists.create({
    data: { ...obj, ...checkedOrder },
  });

  return result;
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
