import { HomeHero } from "@/components/home/hero";
import { HomeTrending } from "@/components/home/trending";
import { HomeCategories } from "@/components/home/categories";
import { HomeFeatured } from "@/components/home/featured";
import { HomeSpotlight } from "@/components/home/spotlight";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-[1500px] space-y-6 sm:space-y-7 px-4 sm:px-6 lg:px-8 py-5">
      {/* Top Section: Hero Banner + Trending Now */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] xl:grid-cols-[1fr_280px] gap-4 items-stretch">
        <HomeHero />
        <HomeTrending />
      </div>

      {/* Categories Section */}
      <HomeCategories />

      {/* Featured Stories Section */}
      <HomeFeatured />

      {/* Story of the Week */}
      <HomeSpotlight />
    </div>
  );
}