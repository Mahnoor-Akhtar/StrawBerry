import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Menu,
  X,
  Heart,
  ShoppingBag,
  Sparkles,
  FileText,
  Package,
  Truck,
  ChevronRight,
} from "lucide-react";

interface NavbarProps {
  isPastVideo?: boolean;
  likedCount?: number;
  cartCount?: number;
  onOpenCart?: () => void;
}

const NAV_LINKS = [
  { label: "Best Sellers", hash: "best-sellers", icon: Sparkles },
  { label: "Product Notes", hash: "product-notes", icon: FileText },
  { label: "Bundles", hash: "bundles", icon: Package },
  { label: "Delivery", hash: "delivery", icon: Truck },
];

export function Navbar({
  isPastVideo = true,
  likedCount = 0,
  cartCount = 0,
  onOpenCart,
}: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Prevent scrolling when mobile drawer is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  // Handle ESC key press to close menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMobileMenuOpen]);

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleCartClick = () => {
    closeMobileMenu();
    onOpenCart?.();
  };

  const handleNavLinkClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    hash: string,
  ) => {
    setIsMobileMenuOpen(false);

    // If section exists on the current page, perform smooth scrolling
    const targetElement = document.getElementById(hash);
    if (targetElement) {
      e.preventDefault();
      targetElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <header
        className={`fixed left-0 top-0 z-40 w-full transition-all duration-300 ${
          isPastVideo
            ? "bg-[#f8f4ed]/95 text-[#2f1f1d] shadow-[0_8px_24px_rgba(48,23,22,0.12)] backdrop-blur-md"
            : "bg-black/30 text-white backdrop-blur-md border-b border-white/10"
        }`}
      >
        <nav
          className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8"
          aria-label="Main navigation"
        >
          {/* Logo */}
          <Link
            to="/"
            onClick={closeMobileMenu}
            className="group inline-flex items-center gap-2.5 transition-transform active:scale-95"
            aria-label="Berry Bliss home"
          >
            <img
              src="/logo.svg"
              alt="Berry Bliss"
              className="h-10 w-auto rounded-lg shadow-[0_4px_14px_rgba(48,23,22,0.16)] transition-transform duration-300 group-hover:scale-105 sm:h-12 md:h-14"
              loading="eager"
            />
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden items-center gap-7 lg:gap-9 md:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                to="/shop"
                hash={link.hash}
                onClick={(e) => handleNavLinkClick(e, link.hash)}
                className={`relative text-xs font-semibold uppercase tracking-[0.08em] transition-colors duration-200 after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-0 after:rounded-full after:transition-all after:duration-300 hover:after:w-full ${
                  isPastVideo
                    ? "text-[#3d2a28] hover:text-[#c9626d] after:bg-[#c9626d]"
                    : "text-white/90 hover:text-white after:bg-white"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Right Actions */}
          <div className="hidden items-center gap-3 md:flex">
            {/* Liked Count Badge */}
            <div
              className={`inline-flex h-9 items-center justify-center gap-1.5 rounded-full px-3.5 text-xs font-semibold shadow-xs transition-colors ${
                isPastVideo
                  ? "bg-[#ead8c6] text-[#563634]"
                  : "bg-white/20 text-white backdrop-blur-md"
              }`}
              aria-label={`Liked items: ${likedCount}`}
              title="Saved items"
            >
              <Heart className="h-3.5 w-3.5 fill-current text-[#c9626d]" />
              <span>{likedCount}</span>
            </div>

            {/* Cart Button */}
            <button
              type="button"
              onClick={onOpenCart}
              className={`inline-flex h-9 items-center justify-center gap-2 rounded-full px-4 text-xs font-semibold transition-all hover:scale-[1.02] active:scale-95 ${
                isPastVideo
                  ? "bg-[#ead8c6] text-[#563634] hover:bg-[#e2ceb9]"
                  : "bg-white/20 text-white backdrop-blur-md hover:bg-white/30"
              }`}
              aria-label={`Open shopping cart with ${cartCount} items`}
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              <span>Cart ({cartCount})</span>
            </button>

            {/* CTA Button */}
            <Link
              to="/shop"
              className={`rounded-full px-5 py-2.5 text-xs font-bold uppercase tracking-[0.06em] text-white shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg ${
                isPastVideo
                  ? "bg-[#c9626d] shadow-[0_6px_20px_rgba(201,98,109,0.35)] hover:bg-[#d36e79]"
                  : "bg-[#ff4f79] shadow-[0_6px_20px_rgba(255,79,121,0.45)] hover:bg-[#ff5c84]"
              }`}
            >
              Shop Strawberry
            </Link>
          </div>

          {/* Mobile Right Controls */}
          <div className="flex items-center gap-2 md:hidden">
            {/* Mobile Wishlist Icon Button */}
            <div
              className={`relative inline-flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                isPastVideo
                  ? "bg-[#ead8c6]/90 text-[#563634]"
                  : "bg-white/20 text-white backdrop-blur-md"
              }`}
              aria-label={`Liked items: ${likedCount}`}
            >
              <Heart
                className={`h-4 w-4 ${likedCount > 0 ? "fill-current text-[#c9626d]" : ""}`}
              />
              {likedCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#c9626d] text-[10px] font-bold text-white shadow-sm">
                  {likedCount}
                </span>
              )}
            </div>

            {/* Mobile Cart Icon Button */}
            <button
              type="button"
              onClick={handleCartClick}
              className={`relative inline-flex h-9 w-9 items-center justify-center rounded-full transition-colors active:scale-95 ${
                isPastVideo
                  ? "bg-[#ead8c6]/90 text-[#563634]"
                  : "bg-white/20 text-white backdrop-blur-md"
              }`}
              aria-label={`Open cart with ${cartCount} items`}
            >
              <ShoppingBag className="h-4 w-4" />
              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#ff4f79] text-[10px] font-bold text-white shadow-sm">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Hamburger / Menu Toggle Button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              aria-expanded={isMobileMenuOpen}
              aria-label={
                isMobileMenuOpen
                  ? "Close navigation menu"
                  : "Open navigation menu"
              }
              className={`inline-flex h-10 w-10 items-center justify-center rounded-full transition-all duration-200 active:scale-90 ${
                isPastVideo
                  ? "bg-[#ead8c6] text-[#301716] hover:bg-[#e2ceb9]"
                  : "bg-white/20 text-white backdrop-blur-md hover:bg-white/30"
              }`}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5 transition-transform duration-200 rotate-90" />
              ) : (
                <Menu className="h-5 w-5 transition-transform duration-200" />
              )}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Backdrop Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs transition-opacity duration-300 md:hidden"
          onClick={closeMobileMenu}
          aria-hidden="true"
        />
      )}

      {/* Mobile Drawer / Slide-down Menu */}
      <div
        className={`fixed left-0 right-0 top-[60px] sm:top-[68px] z-40 overflow-hidden bg-[#f8f4ed] text-[#2f1f1d] shadow-2xl transition-all duration-300 ease-in-out md:hidden border-b border-[#e7d7c9] ${
          isMobileMenuOpen
            ? "max-h-[85vh] opacity-100 py-5 px-4 sm:px-6"
            : "max-h-0 opacity-0 py-0 px-4 sm:px-6 pointer-events-none"
        }`}
      >
        <div className="mx-auto max-w-md space-y-4">
          {/* Quick Info / Welcome header in Mobile Menu */}
          <div className="flex items-center justify-between rounded-2xl bg-[#eee5d8] p-3.5">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">🍓</span>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#b04b5b]">
                  Berry Bliss
                </p>
                <p className="text-xs text-[#6d514d]">Sweet choices for baby</p>
              </div>
            </div>
            <span className="rounded-full bg-[#c9626d] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
              Official Store
            </span>
          </div>

          {/* Mobile Nav Links List */}
          <nav
            className="flex flex-col gap-1.5"
            aria-label="Mobile navigation links"
          >
            {NAV_LINKS.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.label}
                  to="/shop"
                  hash={link.hash}
                  onClick={(e) => handleNavLinkClick(e, link.hash)}
                  className="flex items-center justify-between rounded-xl p-3 text-sm font-semibold text-[#301716] transition-colors hover:bg-[#ede3d7] active:bg-[#e4d6c7]"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#e8dbcc] text-[#b04b5b]">
                      <Icon className="h-4 w-4" />
                    </div>
                    <span>{link.label}</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[#9c827c]" />
                </Link>
              );
            })}
          </nav>

          {/* Wishlist & Cart Cards Row in Mobile Drawer */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <div className="flex items-center justify-between rounded-xl border border-[#e5d6c8] bg-[#fdfbf7] p-3">
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-[#c9626d] fill-[#c9626d]" />
                <span className="text-xs font-medium text-[#563634]">
                  Saved Items
                </span>
              </div>
              <span className="rounded-full bg-[#ead8c6] px-2 py-0.5 text-xs font-bold text-[#563634]">
                {likedCount}
              </span>
            </div>

            <button
              type="button"
              onClick={handleCartClick}
              className="flex items-center justify-between rounded-xl border border-[#e5d6c8] bg-[#fdfbf7] p-3 text-left transition-colors hover:bg-[#f6efe6]"
            >
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 text-[#b04b5b]" />
                <span className="text-xs font-medium text-[#563634]">Cart</span>
              </div>
              <span className="rounded-full bg-[#c9626d] px-2 py-0.5 text-xs font-bold text-white">
                {cartCount}
              </span>
            </button>
          </div>

          {/* Primary Mobile CTA Button */}
          <div className="pt-2">
            <Link
              to="/shop"
              onClick={closeMobileMenu}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-[#c9626d] py-3.5 text-sm font-bold uppercase tracking-wider text-white shadow-[0_8px_20px_rgba(201,98,109,0.35)] transition-all active:scale-98 hover:bg-[#d36e79]"
            >
              <span>Shop Strawberry Collection</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
