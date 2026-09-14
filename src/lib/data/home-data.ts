export interface CategoryItem {
  id: string;
  name: string;
  count: string;
  image: string;
  iconImage: string;
  borderClass: string;
  bgGradient: string;
  href: string;
}

export interface TrendingStory {
  id: string;
  title: string;
  price: number;
  status: "Completed" | "In Progress";
  image: string;
  href: string;
}

export interface FeaturedStoryItem {
  id: string;
  title: string;
  author: string;
  status: "Completed" | "In Progress";
  tags: string[];
  price: number;
  image: string;
  fullCard: string;
  href: string;
}

export const homeCategories: CategoryItem[] = [
  {
    id: "cat-love-romance",
    name: "Love & Romance",
    count: "412 stories",
    image: "/home-assets/categories/cat-1.jpg",
    iconImage: "/home-assets/categories/icon-1.jpg",
    borderClass: "border-pink-500/25 hover:border-pink-500/60",
    bgGradient: "from-pink-950/40 via-purple-950/20 to-[#070a18]",
    href: "/explore?category=romance",
  },
  {
    id: "cat-comedy",
    name: "Comedy",
    count: "368 stories",
    image: "/home-assets/categories/cat-2.jpg",
    iconImage: "/home-assets/categories/icon-2.jpg",
    borderClass: "border-amber-500/25 hover:border-amber-500/60",
    bgGradient: "from-amber-950/40 via-yellow-950/20 to-[#070a18]",
    href: "/explore?category=comedy",
  },
  {
    id: "cat-action-adventure",
    name: "Action & Adventure",
    count: "295 stories",
    image: "/home-assets/categories/cat-3.jpg",
    iconImage: "/home-assets/categories/icon-3.jpg",
    borderClass: "border-sky-500/25 hover:border-sky-500/60",
    bgGradient: "from-sky-950/40 via-blue-950/20 to-[#070a18]",
    href: "/explore?category=action",
  },
  {
    id: "cat-drama",
    name: "Drama",
    count: "487 stories",
    image: "/home-assets/categories/cat-4.jpg",
    iconImage: "/home-assets/categories/icon-4.jpg",
    borderClass: "border-purple-500/25 hover:border-purple-500/60",
    bgGradient: "from-purple-950/40 via-violet-950/20 to-[#070a18]",
    href: "/explore?category=drama",
  },
  {
    id: "cat-fantasy-mythology",
    name: "Fantasy & Mythology",
    count: "243 stories",
    image: "/home-assets/categories/cat-5.jpg",
    iconImage: "/home-assets/categories/icon-5.jpg",
    borderClass: "border-teal-500/25 hover:border-teal-500/60",
    bgGradient: "from-teal-950/40 via-emerald-950/20 to-[#070a18]",
    href: "/explore?category=fantasy",
  },
  {
    id: "cat-thriller-mystery",
    name: "Thriller & Mystery",
    count: "196 stories",
    image: "/home-assets/categories/cat-6.jpg",
    iconImage: "/home-assets/categories/icon-6.jpg",
    borderClass: "border-cyan-600/25 hover:border-cyan-500/60",
    bgGradient: "from-cyan-950/40 via-slate-950/20 to-[#070a18]",
    href: "/explore?category=thriller",
  },
  {
    id: "cat-family-life",
    name: "Family & Life",
    count: "322 stories",
    image: "/home-assets/categories/cat-7.jpg",
    iconImage: "/home-assets/categories/icon-7.jpg",
    borderClass: "border-emerald-500/25 hover:border-emerald-500/60",
    bgGradient: "from-emerald-950/40 via-green-950/20 to-[#070a18]",
    href: "/explore?category=family",
  },
  {
    id: "cat-spiritual-faith",
    name: "Spiritual & Faith",
    count: "210 stories",
    image: "/home-assets/categories/cat-8.jpg",
    iconImage: "/home-assets/categories/icon-8.jpg",
    borderClass: "border-amber-600/25 hover:border-amber-500/60",
    bgGradient: "from-amber-950/40 via-stone-950/20 to-[#070a18]",
    href: "/explore?category=spiritual",
  },
  {
    id: "cat-history-culture",
    name: "History & Culture",
    count: "178 stories",
    image: "/home-assets/categories/cat-9.jpg",
    iconImage: "/home-assets/categories/icon-9.jpg",
    borderClass: "border-orange-600/25 hover:border-orange-500/60",
    bgGradient: "from-orange-950/40 via-amber-950/20 to-[#070a18]",
    href: "/explore?category=history",
  },
  {
    id: "cat-sci-fi",
    name: "Sci-Fi",
    count: "142 stories",
    image: "/home-assets/categories/cat-10.jpg",
    iconImage: "/home-assets/categories/icon-10.jpg",
    borderClass: "border-fuchsia-600/25 hover:border-fuchsia-500/60",
    bgGradient: "from-fuchsia-950/40 via-purple-950/20 to-[#070a18]",
    href: "/explore?category=scifi",
  },
];

export const trendingStories: TrendingStory[] = [
  {
    id: "queen-amina",
    title: "The Legend of Queen Amina",
    price: 480,
    status: "Completed",
    image: "/home-assets/trending/queen-amina.jpg",
    href: "/watch/v_hero_lastkingdom",
  },
  {
    id: "baobab-tree",
    title: "Tales of the Baobab Tree",
    price: 320,
    status: "In Progress",
    image: "/home-assets/trending/baobab.jpg",
    href: "/watch/v_redcanoe",
  },
  {
    id: "rain-boy",
    title: "The Boy Who Spoke to Rain",
    price: 400,
    status: "Completed",
    image: "/home-assets/trending/rain-boy.jpg",
    href: "/watch/v_swahili_coast",
  },
];

export const featuredStories: FeaturedStoryItem[] = [
  {
    id: "love-beyond-borders",
    title: "Love Beyond Borders",
    author: "By Adaeze Okafor",
    status: "Completed",
    tags: ["Romance", "Drama"],
    price: 520,
    image: "/home-assets/stories/art-1.jpg",
    fullCard: "/home-assets/stories/card-1.jpg",
    href: "/watch/v_hero_lastkingdom",
  },
  {
    id: "the-village-comedian",
    title: "The Village Comedian",
    author: "By Emeka Chukwu",
    status: "Completed",
    tags: ["Comedy"],
    price: 320,
    image: "/home-assets/stories/art-2.jpg",
    fullCard: "/home-assets/stories/card-2.jpg",
    href: "/watch/v_redcanoe",
  },
  {
    id: "the-last-warrior",
    title: "The Last Warrior",
    author: "By Tunde Adeyemi",
    status: "In Progress",
    tags: ["Action", "Adventure"],
    price: 450,
    image: "/home-assets/stories/art-3.jpg",
    fullCard: "/home-assets/stories/card-3.jpg",
    href: "/watch/v_hero_lastkingdom",
  },
  {
    id: "tears-of-a-queen",
    title: "Tears of a Queen",
    author: "By Chinenye Uzo",
    status: "Completed",
    tags: ["Drama", "Royalty"],
    price: 480,
    image: "/home-assets/stories/art-4.jpg",
    fullCard: "/home-assets/stories/card-4.jpg",
    href: "/watch/v_swahili_coast",
  },
  {
    id: "tales-of-the-baobab-tree",
    title: "Tales of the Baobab Tree",
    author: "By Ifeoma Nwosu",
    status: "In Progress",
    tags: ["Fantasy", "Adventure"],
    price: 320,
    image: "/home-assets/stories/art-5.jpg",
    fullCard: "/home-assets/stories/card-5.jpg",
    href: "/watch/v_redcanoe",
  },
  {
    id: "the-boy-who-spoke-to-rain",
    title: "The Boy Who Spoke to Rain",
    author: "By Kelechi Nwosu",
    status: "Completed",
    tags: ["Spiritual", "Drama"],
    price: 400,
    image: "/home-assets/stories/art-6.jpg",
    fullCard: "/home-assets/stories/card-6.jpg",
    href: "/watch/v_swahili_coast",
  },
  {
    id: "sisters-by-choice",
    title: "Sisters by Choice",
    author: "By Zainab Musa",
    status: "In Progress",
    tags: ["Family", "Drama"],
    price: 350,
    image: "/home-assets/stories/art-7.jpg",
    fullCard: "/home-assets/stories/card-7.jpg",
    href: "/watch/v_ani_tobi",
  },
  {
    id: "the-ceos-daughter",
    title: "The CEO's Daughter",
    author: "By Precious Daniel",
    status: "Completed",
    tags: ["Romance", "Drama"],
    price: 500,
    image: "/home-assets/stories/art-8.jpg",
    fullCard: "/home-assets/stories/card-8.jpg",
    href: "/watch/v_matatu_54",
  },
  {
    id: "jokes-at-the-market",
    title: "Jokes at the Market",
    author: "By Seyi Ojo",
    status: "Completed",
    tags: ["Comedy", "Slice of Life"],
    price: 280,
    image: "/home-assets/stories/art-9.jpg",
    fullCard: "/home-assets/stories/card-9.jpg",
    href: "/watch/v_redcanoe",
  },
  {
    id: "rise-of-the-orishas",
    title: "Rise of the Orishas",
    author: "By Tayo Oladipo",
    status: "In Progress",
    tags: ["Fantasy", "Mythology"],
    price: 460,
    image: "/home-assets/stories/art-10.jpg",
    fullCard: "/home-assets/stories/card-10.jpg",
    href: "/watch/v_matatu_54",
  },
  {
    id: "the-lost-kingdom",
    title: "The Lost Kingdom",
    author: "By Daniel Ibe",
    status: "Completed",
    tags: ["History", "Adventure"],
    price: 420,
    image: "/home-assets/stories/art-11.jpg",
    fullCard: "/home-assets/stories/card-11.jpg",
    href: "/watch/v_hero_lastkingdom",
  },
  {
    id: "campus-love",
    title: "Campus Love",
    author: "By Bayo Adekunle",
    status: "In Progress",
    tags: ["Romance", "Comedy"],
    price: 310,
    image: "/home-assets/stories/art-12.jpg",
    fullCard: "/home-assets/stories/card-12.jpg",
    href: "/watch/v_ani_tobi",
  },
  {
    id: "the-price-of-power",
    title: "The Price of Power",
    author: "By Faith Martins",
    status: "Completed",
    tags: ["Drama", "Thriller"],
    price: 530,
    image: "/home-assets/stories/art-13.jpg",
    fullCard: "/home-assets/stories/card-13.jpg",
    href: "/watch/v_matatu_54",
  },
  {
    id: "the-village-healer",
    title: "The Village Healer",
    author: "By Beatrice Okoro",
    status: "Completed",
    tags: ["Spiritual", "Drama"],
    price: 360,
    image: "/home-assets/stories/art-14.jpg",
    fullCard: "/home-assets/stories/card-14.jpg",
    href: "/watch/v_swahili_coast",
  },
  {
    id: "galactic-africa",
    title: "Galactic Africa",
    author: "By Femi Alabi",
    status: "In Progress",
    tags: ["Sci-Fi", "Adventure"],
    price: 490,
    image: "/home-assets/stories/art-15.jpg",
    fullCard: "/home-assets/stories/card-15.jpg",
    href: "/watch/v_ani_tobi",
  },
];
