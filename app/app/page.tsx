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
import { useEffect, useRef, useState } from "react";
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
import getRecipe from "@/lib/gemini/gemini";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { ModeToggle } from "@/components/theme-mode-toggle";

export default function Home() {
  const [items, setItems] = useState<PantryItem[]>([]);
  const [tempSearchItems, setTempSearchItems] = useState<PantryItem[]>([]);
  const [newItemName, setNewItemName] = useState<string>("");
  const [newItemQuantity, setNewItemQuantity] = useState<number>(1);
  const [sortFunction, setSortFunction] = useState<SortFunction>("name");
  const [recipe, setRecipe] = useState<string>("");
  const [recipeTitle, setRecipeTitle] = useState<string>("Generating...");
  const loading = useRef<boolean>(true);
  const search = useRef<string>("");

  useEffect(() => {
    (async () => {
      updateInventory(sortFunction)
        .then((inventory) => {
          setItems(inventory);
        })
        .then(() => (loading.current = false));
    })();
  }, []);

  const refreshInventory = async () => {
    await updateInventory(sortFunction).then((inventory) => {
      console.log(inventory);
      setItems(inventory);
      if (tempSearchItems.length !== 0) {
        setTempSearchItems(inventory);
        filterItemsByName(inventory);
      }
    });
  };

  const onSubmit = async () => {
    addItem({ name: newItemName, quantity: newItemQuantity });
    console.log("Before: ", items);
    setItems(await updateInventory(sortFunction));
    console.log("After: ", items);
    setNewItemName("");
    setNewItemQuantity(1);
  };

  const filterItemsByName = (currentItems: PantryItem[]) => {
    setTempSearchItems(
      currentItems.filter((item) =>
        item.name.toLowerCase().includes(search.current.toLowerCase())
      )
    );
  };

  const generateRecipe = async () => {
    if (items.length === 0)
      toast.error(
        "You need to have items in your pantry to generate a recipe."
      );
    const ingredients = items
      .map((item) => `Item: ${item.name} Quantity: ${item.quantity}`)
      .join(", ");
    const prompt =
      "Instruction: You have the following ingredients: " +
      ingredients +
      ". Please provide a recipe using these exact ingredients and their quantities. YOU CANNOT ADD ANY OTHERS EXCEPT FOR CERTAIN EXCEPTIONS SUCH AS WATER. The recipe should start with a quick overview, then the ingredients list, and finally the instructions on how to cook the dish. Just use plain text, no markdown, JSX, etc. It should just be a simple paragraph. Also, don't use dashes or anything because lists will not be shown to the end user and it will not look good on the page. Just write it as if you are writing a plain text paragraph. Also, include the title at the very start, and once the title is finished, immediately folow it with a backslash so I know where to cut the title off from.";
    let recipe = await getRecipe(prompt);
    let title = "";
    let i = 0;
    for (; recipe[i] !== "\\"; ++i) title += recipe[i];
    recipe = recipe.slice(i + 1);
    setRecipe(recipe);
    setRecipeTitle(title);
  };

  return (
    <div className="p-10 grid gap-10">
      <div className="justify-self-end">
        <ModeToggle />
      </div>
      <h1 className="text-6xl text-center">Pantry</h1>{" "}
      <div className="flex flex-col gap-2 mx-auto">
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Item name..."
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            onKeyUp={(e) => {
              if (e.key === "Enter" && newItemName !== "") onSubmit();
            }}
          />
          <Input
            type="number"
            placeholder="Quantity..."
            value={newItemQuantity}
            onChange={(e) => setNewItemQuantity(parseInt(e.target.value))}
            onKeyUp={(e) => {
              if (e.key === "Enter" && newItemName !== "") onSubmit();
            }}
          />
          <Button
            onClick={() => {
              if (newItemName !== "") onSubmit();
            }}
          >
            Add Item
          </Button>
        </div>
        <div className="flex flex-row gap-2">
          <Input
            type="text"
            placeholder="Search for item name..."
            onChange={async (e) => {
              search.current = e.target.value;
              if (search.current === "") setTempSearchItems([]);
              else filterItemsByName(items);
            }}
          />
          <Select
            defaultValue={sortFunction}
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
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="ascending">Ascending</SelectItem>
                <SelectItem value="descending">Descending</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <Dialog
          onOpenChange={(isOpen) => {
            if (!isOpen) setRecipe("");
          }}
        >
          <DialogTrigger
            onClick={() => generateRecipe()}
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          >
            Generate Recipe
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{recipeTitle}</DialogTitle>
            </DialogHeader>
            <DialogDescription>
              {recipe === "" ? <Skeleton className="h-10" /> : <>{recipe}</>}
            </DialogDescription>
          </DialogContent>
        </Dialog>
      </div>
      {loading.current ? (
        <Skeleton className="min-w-max h-56" />
      ) : (
        <div className="grid gap-4 xl:grid-cols-2 2xl:grid-cols-3">
          {tempSearchItems.length === 0 && search.current !== "" ? (
            <p>No items match your search...</p>
          ) : (
            (tempSearchItems.length === 0 ? items : tempSearchItems).map(
              (item, i) => {
                return (
                  <Card key={i}>
                    <CardHeader>
                      <CardTitle className="font-light">{item.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>Quantity:</p>
                      <CardDescription className="flex mt-2">
                        <Button
                          className="rounded-r-none"
                          onClick={async () => {
                            await removeItem({ name: item.name, quantity: 1 });
                            await refreshInventory();
                          }}
                        >
                          -
                        </Button>
                        <Input
                          type="number"
                          className="rounded-none"
                          defaultValue={item.quantity}
                        />
                        <Button
                          className="rounded-s-none"
                          onClick={async () => {
                            await addItem({ name: item.name, quantity: 1 });
                            await refreshInventory();
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
                          await refreshInventory();
                        }}
                      >
                        Delete
                      </Button>
                    </CardFooter>
                  </Card>
                );
              }
            )
          )}
        </div>
      )}
    </div>
  );
}
