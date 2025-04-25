function main() {
  console.log("Hello, World!");
}

main();


import { getStorage, ref, listAll } from "firebase/storage";

const storage = getStorage();

// Create a reference under which you want to list
const listRef = ref(storage, 'files/uid');

// Find all the prefixes and items.
listAll(listRef)
  .then((res) => {
    res.prefixes.forEach((folderRef) => {
      // All the prefixes under listRef.
      // You may call listAll() recursively on them.
    });
    res.items.forEach((itemRef) => {
      // All the items under listRef.
    });
  }).catch((error) => {
    // Uh-oh, an error occurred!
  });
