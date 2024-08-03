import { toast } from "@/components/ui/use-toast";
import { firestore } from "@/firebase";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
} from "firebase/firestore";

export interface PantryItem {
  name: string;
  quantity: number;
}

export type SortFunction = "name" | "ascending" | "descending";

export const sortItems = (
  items: Array<PantryItem>,
  sortFunction: SortFunction
) => {
  switch (sortFunction) {
    case "name":
      items.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "ascending":
      items.sort((a, b) => a.quantity - b.quantity);
      break;
    case "descending":
      items.sort((a, b) => b.quantity - a.quantity);
      break;
  }

  return items;
};

export const updateInventory = async (
  sortFunction: SortFunction
): Promise<PantryItem[]> => {
  const snapshot = query(collection(firestore, "inventory"));
  const docs = await getDocs(snapshot);
  let docsItems: Array<PantryItem> = [];
  docs.forEach((doc) => {
    docsItems.push({ name: doc.id, quantity: doc.data().quantity });
  });
  docsItems = sortItems(docsItems, sortFunction);
  return docsItems;
};

export const addItem = async (item: PantryItem) => {
  const docRef = doc(collection(firestore, "inventory"), item.name);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const { quantity } = docSnap.data();
    await setDoc(docRef, {
      quantity: quantity + item.quantity,
    });
  } else await setDoc(docRef, { quantity: 1 });

  toast({
    title: "Item added to inventory",
    description: `${item.name} has been added to your inventory.`,
  });
};

export const removeItem = async (item: PantryItem) => {
  const docRef = doc(collection(firestore, "inventory"), item.name);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const { quantity } = docSnap.data();
    if (quantity === 1 || quantity === item.quantity) await deleteDoc(docRef);
    else await setDoc(docRef, { quantity: quantity - item.quantity });
  }
};
