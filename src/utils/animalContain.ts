import { ItemProps } from "../components/Item";

export function animalContain(itens: ItemProps[], animalName: string) {
   for (const item of itens) {
      if (item.name.toLocaleLowerCase() === animalName.toLocaleLowerCase()) {
         return true;
      }
   }

   return false;
}
