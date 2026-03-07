export type ProductItem = {
  id: number
  title: string
  price: number
  category: string | string[] 
  createdAt: string 
  image: string
}

export const products = [
  {
    id: 1,
    title: "Bape Pants",
    image: "https://i.pinimg.com/736x/e7/e3/03/e7e3034bea7c72672adbf3a41e8b3a76.jpg",
    price: "69,000₮",
    category: "men",
    createdAt: "2026-03-01"
  }, 
  {
    id: 2,
    title: "Stussy Hoodie",
    image: "https://i.pinimg.com/736x/fc/a7/d8/fca7d84a3a3cae3051b84611523d29f3.jpg",
    price: "89,000₮",
    category: "women",
    createdAt: "2026-03-01"
  },
  {
    id: 3,
    title: "Essentials Hoodie",
    image: "https://i.pinimg.com/736x/87/d4/2a/87d42adfe468fa96ca897dfff9e93d7b.jpg",
    price: "69,000₮",
    category: ["men", "women"],
    createdAt: "2026-03-01"
  }, 
  {
    id: 4,
    title: "Corteiz Hoodie",
    image: "https://i.pinimg.com/736x/60/81/e4/6081e42aa0fd567bfe04b95081849dde.jpg",
    price: "89,000₮",
    category: "men",
    createdAt: "2026-03-01"
  },
  {
    id: 5,
    title: "Rolex MC",
    image: "https://i.pinimg.com/1200x/27/54/50/27545014d0cc22a25c236d620dba9221.jpg",
    price: "250,000₮",
    category: "men",
    createdAt: "2026-03-01"
  }, 
  {
    id: 6,
    title: "Seiko mod",
    image: "https://i.pinimg.com/1200x/08/07/12/080712457a4a0926a504e5dc13159e86.jpg",
    price: "999,000₮",
    category: "men",
    createdAt: "2026-03-01"
  },
];