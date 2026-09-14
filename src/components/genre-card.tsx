import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  Clapperboard,
  Drama,
  Laugh,
  Ghost,
  Wand2,
  Compass,
  Landmark,
  Baby,
  Film,
  Bot,
  ScrollText,
} from "lucide-react";

const genreIcons = {
  Folklore: BookOpen,
  Animation: Wand2,
  Drama: Drama,
  Comedy: Laugh,
  Horror: Ghost,
  Fantasy: ScrollText,
  Adventure: Compass,
  History: Landmark,
  Kids: Baby,
  Documentary: Film,
  "AI Stories": Bot,
  "Short Films": Clapperboard,
  "African Legends": Landmark,
};

export interface Genre {
  name: string;
  color: string;
  gradient: string;
}

export const genres: Genre[] = [
  { name: "Folklore", color: "text-amber-300", gradient: "from-amber-600/40 to-orange-800/40" },
  { name: "Animation", color: "text-sky-300", gradient: "from-sky-600/40 to-blue-900/40" },
  { name: "Drama", color: "text-rose-300", gradient: "from-rose-600/40 to-red-900/40" },
  { name: "Comedy", color: "text-lime-300", gradient: "from-lime-600/40 to-emerald-900/40" },
  { name: "Horror", color: "text-red-300", gradient: "from-red-800/50 to-black" },
  { name: "Fantasy", color: "text-violet-300", gradient: "from-violet-600/40 to-purple-950/40" },
  { name: "Adventure", color: "text-emerald-300", gradient: "from-emerald-600/40 to-teal-900/40" },
  { name: "History", color: "text-yellow-300", gradient: "from-yellow-600/40 to-amber-900/40" },
  { name: "Kids", color: "text-pink-300", gradient: "from-pink-600/40 to-fuchsia-900/40" },
  { name: "Documentary", color: "text-orange-300", gradient: "from-orange-600/40 to-red-900/40" },
  { name: "AI Stories", color: "text-cyan-300", gradient: "from-cyan-600/40 to-blue-900/40" },
  { name: "Short Films", color: "text-purple-300", gradient: "from-purple-600/40 to-indigo-950/40" },
  { name: "African Legends", color: "text-gold", gradient: "from-amber-500/40 to-yellow-900/40" },
];

export function GenreCard({
  genre,
  className,
}: {
  genre: Genre;
  className?: string;
}) {
  const Icon = genreIcons[genre.name as keyof typeof genreIcons] ?? Compass;

  return (
    <Link
      href={`/explore?genre=${encodeURIComponent(genre.name)}`}
      className={cn(
        "group flex aspect-[4/5] min-w-[130px] flex-col justify-between overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br p-4 transition-transform duration-300 hover:-translate-y-1",
        genre.gradient,
        className
      )}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm">
        <Icon className={cn("h-5 w-5", genre.color)} />
      </div>
      <div>
        <h3 className={cn("font-display text-base font-bold", genre.color)}>
          {genre.name}
        </h3>
        <p className="mt-0.5 text-[11px] text-white/50">
          Explore stories →
        </p>
      </div>
    </Link>
  );
}