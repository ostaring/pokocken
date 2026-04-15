import type { RecipeSummary } from "../../types/recipe";

export const mockRecipes: RecipeSummary[] = [
  {
    id: "1",
    title: "Brown butter pancakes",
    slug: "brown-butter-pancakes",
    description: "Soft, golden pancakes with brown butter, cardamom, and a sharp berry topping.",
    category: "Breakfast",
    prepTimeMinutes: 25,
    servings: 4,
    imageUrl:
      "https://images.unsplash.com/photo-1528207776546-365bb710ee93?auto=format&fit=crop&w=900&q=80",
    isPublished: true,
  },
  {
    id: "2",
    title: "Roasted tomato pasta",
    slug: "roasted-tomato-pasta",
    description: "A quick pasta built around sweet roasted tomatoes, garlic, basil, and olive oil.",
    category: "Dinner",
    prepTimeMinutes: 35,
    servings: 3,
    imageUrl:
      "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=900&q=80",
    isPublished: true,
  },
  {
    id: "3",
    title: "Citrus chicken grain bowl",
    slug: "citrus-chicken-grain-bowl",
    description: "A bright lunch bowl with herbed rice, roast chicken, avocado, and lemon yogurt.",
    category: "Lunch",
    prepTimeMinutes: 30,
    servings: 2,
    imageUrl:
      "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=80",
    isPublished: true,
  },
  {
    id: "4",
    title: "Dark chocolate mousse",
    slug: "dark-chocolate-mousse",
    description: "Deep chocolate flavor, light texture, and just enough sea salt on top.",
    category: "Dessert",
    prepTimeMinutes: 20,
    servings: 6,
    imageUrl:
      "https://images.unsplash.com/photo-1571115177098-24ec42ed204d?auto=format&fit=crop&w=900&q=80",
    isPublished: true,
  },
  {
    id: "5",
    title: "Chili-lime roasted chickpeas",
    slug: "chili-lime-roasted-chickpeas",
    description: "Crisp oven-roasted chickpeas with lime zest, chili, and smoked paprika.",
    category: "Snack",
    prepTimeMinutes: 18,
    servings: 4,
    imageUrl:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=80",
    isPublished: true,
  },
];
