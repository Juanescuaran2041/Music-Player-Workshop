import Image from "next/image";

// Light version of the BloomMod artwork behind the app. It is fixed, so it
// stays in place while the page scrolls.
export default function AppBackground() {
  return (
    <div aria-hidden="true" className="fixed inset-0 -z-10">
      <Image
        src="/brand/bloommod-bg-light.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="theme-light-only object-cover"
      />
      <Image
        src="/brand/bloommod-bg.jpg"
        alt=""
        fill
        sizes="100vw"
        className="theme-dark-only object-cover"
      />
      {/* Softens the artwork so text and panels on top stay easy to read */}
      <div className="absolute inset-0 bg-background/55" />
    </div>
  );
}
