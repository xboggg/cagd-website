export default function SkipLinks() {
  return (
    <div className="sr-only focus-within:not-sr-only">
      <a
        href="#main-content"
        className="fixed top-0 left-0 z-[9999] bg-primary text-primary-foreground px-4 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transform -translate-y-full focus:translate-y-0 transition-transform"
      >
        Skip to main content
      </a>
      <a
        href="#main-navigation"
        className="fixed top-0 left-32 z-[9999] bg-primary text-primary-foreground px-4 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transform -translate-y-full focus:translate-y-0 transition-transform"
      >
        Skip to navigation
      </a>
      <a
        href="#footer"
        className="fixed top-0 left-64 z-[9999] bg-primary text-primary-foreground px-4 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transform -translate-y-full focus:translate-y-0 transition-transform"
      >
        Skip to footer
      </a>
    </div>
  );
}
