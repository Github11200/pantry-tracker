"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import {
  updateInventory,
  addItem,
  removeItem,
  PantryItem,
  SortFunction,
  sortItems,
} from "@/lib/firebase/crud";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowBigDown } from "lucide-react";

export default function Home() {
  const [items, setItems] = useState<PantryItem[]>([]);
  const [tempSearchItems, setTempSearchItems] = useState<PantryItem[]>([]);
  const [newItemName, setNewItemName] = useState<string>("");
  const [sortFunction, setSortFunction] = useState<SortFunction>("name");

  useEffect(() => {
    (async () => {
      setItems(await updateInventory(sortFunction));
    })();
  }, []);

  const onSubmit = async () => {
    addItem({ name: newItemName, quantity: 1 });
    setItems(await updateInventory(sortFunction));
    setNewItemName("");
  };

  return (
    <div>
      <h1 className="text-6xl">Pantry List</h1>{" "}
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="Item name..."
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
          onKeyUp={(e) => {
            if (e.key === "Enter") onSubmit();
          }}
        />
        <Button onClick={() => onSubmit()}>Add Item</Button>
      </div>
      <Input
        type="text"
        placeholder="Search for item name..."
        onChange={async (e) => {
          const search = e.target.value;
          if (search === "") setTempSearchItems([]);
          else
            setTempSearchItems(
              items.filter((item) =>
                item.name.toLowerCase().includes(search.toLowerCase())
              )
            );
        }}
      />
      <Select
        defaultvalue={sortFunction}
        onValueChange={(e: SortFunction) => {
          sortItems(items, e);
          if (tempSearchItems.length !== 0) sortItems(tempSearchItems, e);
          setSortFunction(e);
        }}
      >
        <SelectTrigger>
          <SelectValue placeholder="Sort" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="name">Item Name</SelectItem>
            <SelectItem value="ascending">Ascending</SelectItem>
            <SelectItem value="descending">Descending</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
      {(tempSearchItems.length === 0 ? items : tempSearchItems).map(
        (item, i) => {
          return (
            <Card key={i}>
              <CardHeader>
                <CardTitle>{item.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Quantity:</p>
                <CardDescription className="flex">
                  <Button
                    className="rounded-r-none"
                    onClick={async () => {
                      await removeItem({ name: item.name, quantity: 1 });
                      setItems(await updateInventory(sortFunction));
                    }}
                  >
                    -
                  </Button>
                  <Input
                    type="number"
                    className="rounded-none"
                    value={item.quantity}
                  />
                  <Button
                    className="rounded-s-none"
                    onClick={async () => {
                      await addItem({ name: item.name, quantity: 1 });
                      setItems(await updateInventory(sortFunction));
                    }}
                  >
                    +
                  </Button>
                </CardDescription>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button
                  variant="destructive"
                  onClick={async () => {
                    await removeItem({
                      name: item.name,
                      quantity: item.quantity,
                    });
                    setItems(await updateInventory(sortFunction));
                  }}
                >
                  Delete
                </Button>
              </CardFooter>
            </Card>
          );
        }
      )}
    </div>
  );
}
