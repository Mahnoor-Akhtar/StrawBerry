import { useEffect, useRef, useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { ScrollVideo } from "@/components/ScrollVideo";
import { Navbar } from "@/components/Navbar";

const STRAWBERRY_PRODUCTS = [
  {
    id: "strawberry-blanket",
    tag: "Bestseller",
    category: "Sleep",
    name: "Strawberry Cloud Swaddle Blanket",
    rating: "4.9",
    reviews: "128",
    price: "Rs 2,499",
    oldPrice: "Rs 2,999",
    image: "/images/OIP.webp",
  },
  {
    id: "strawberry-sleep-sack",
    tag: "New",
    category: "Sleep",
    name: "Dreamy Strawberry Sleep Sack 0.5 TOG",
    rating: "4.8",
    reviews: "86",
    price: "Rs 3,499",
    oldPrice: "",
    image: "/images/OIP%20(1).webp",
  },
  {
    id: "strawberry-pacifier",
    tag: "Fresh",
    category: "Feeding",
    name: "Natural Strawberry Pacifier (2-pack)",
    rating: "4.7",
    reviews: "213",
    price: "Rs 1,499",
    oldPrice: "",
    image: "/images/OIP%20(2).webp",
  },
  {
    id: "strawberry-bottle",
    tag: "Sale",
    category: "Feeding",
    name: "Anti-Colic Strawberry Baby Bottle 240ml",
    rating: "4.6",
    reviews: "304",
    price: "Rs 1,899",
    oldPrice: "Rs 2,299",
    image: "/images/OIP%20(3).webp",
  },
  {
    id: "strawberry-gift-set",
    tag: "Popular",
    category: "Gift",
    name: "Berry Bliss Newborn Gift Set",
    rating: "4.8",
    reviews: "67",
    price: "Rs 4,299",
    oldPrice: "",
    image: "/images/OIP%20(4).webp",
  },
  {
    id: "strawberry-stroller",
    tag: "Premium",
    category: "Travel",
    name: "Strawberry Stroller Organizer Kit",
    rating: "4.7",
    reviews: "91",
    price: "Rs 2,899",
    oldPrice: "Rs 3,199",
    image: "/images/pexels-nietjuh-934055.jpg",
  },
  {
    id: "strawberry-splash-care",
    tag: "Limited",
    category: "Care",
    name: "Strawberry Splash Baby Care Bundle",
    rating: "4.6",
    reviews: "52",
    price: "Rs 2,199",
    oldPrice: "",
    image: "/images/strawberry-milk-splash-background_1198109-1061.avif",
  },
] as const;

const CHECKOUT_STORAGE_KEY = "berry-bliss-checkout";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Berry Bliss" },
      {
        name: "description",
        content: "Berry Bliss - an immersive scroll video experience.",
      },
    ],
  }),
});

function Index() {
  const productsSectionRef = useRef<HTMLElement | null>(null);
  const [isPastVideo, setIsPastVideo] = useState(false);
  const [likedProductIds, setLikedProductIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [cartItems, setCartItems] = useState<Record<string, number>>({});
  const [isCartOpen, setIsCartOpen] = useState(false);

  const likedCount = likedProductIds.size;
  const cartCount = Object.values(cartItems).reduce((sum, qty) => sum + qty, 0);

  const cartProducts = STRAWBERRY_PRODUCTS.filter(
    (product) => (cartItems[product.id] ?? 0) > 0,
  );
  const subtotal = cartProducts.reduce((sum, product) => {
    const numericPrice = Number(product.price.replace(/[^\d]/g, ""));
    return sum + numericPrice * (cartItems[product.id] ?? 0);
  }, 0);

  const toggleLike = (productId: string) => {
    setLikedProductIds((current) => {
      const next = new Set(current);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });
  };

  const addToCart = (productId: string) => {
    setCartItems((current) => ({
      ...current,
      [productId]: (current[productId] ?? 0) + 1,
    }));
    setIsCartOpen(true);
  };

  const increaseCartItem = (productId: string) => {
    setCartItems((current) => ({
      ...current,
      [productId]: (current[productId] ?? 0) + 1,
    }));
  };

  const decreaseCartItem = (productId: string) => {
    setCartItems((current) => {
      const qty = current[productId] ?? 0;
      if (qty <= 1) {
        const { [productId]: _, ...rest } = current;
        return rest;
      }
      return {
        ...current,
        [productId]: qty - 1,
      };
    });
  };

  const removeCartItem = (productId: string) => {
    setCartItems((current) => {
      const { [productId]: _, ...rest } = current;
      return rest;
    });
  };

  const formatPrice = (value: number) => `Rs ${value.toLocaleString("en-IN")}`;

  const handleCheckout = () => {
    if (cartProducts.length === 0 || typeof window === "undefined") return;

    const checkoutPayload = {
      items: cartProducts.map((product) => ({
        id: product.id,
        name: product.name,
        category: product.category,
        image: product.image,
        price: product.price,
        quantity: cartItems[product.id] ?? 0,
      })),
      subtotal,
      shipping: 0,
      total: subtotal,
      createdAt: Date.now(),
    };

    window.localStorage.setItem(
      CHECKOUT_STORAGE_KEY,
      JSON.stringify(checkoutPayload),
    );
    window.location.assign("/checkout");
  };

  useEffect(() => {
    const updateNavbarState = () => {
      const productsSectionTop =
        productsSectionRef.current?.getBoundingClientRect().top;
      if (typeof productsSectionTop !== "number") return;

      // Switch navbar styling once the products section reaches the top area.
      const nextIsPastVideo = productsSectionTop <= 88;
      setIsPastVideo((current) =>
        current === nextIsPastVideo ? current : nextIsPastVideo,
      );
    };

    updateNavbarState();
    window.addEventListener("scroll", updateNavbarState, { passive: true });
    window.addEventListener("resize", updateNavbarState);

    return () => {
      window.removeEventListener("scroll", updateNavbarState);
      window.removeEventListener("resize", updateNavbarState);
    };
  }, []);

  return (
    <>
      <Navbar
        isPastVideo={isPastVideo}
        likedCount={likedCount}
        cartCount={cartCount}
        onOpenCart={() => setIsCartOpen(true)}
      />

      <ScrollVideo src="/video.mp4" scrollPerLoop={2400} afterEndScroll={420} />

      <section
        ref={productsSectionRef}
        id="best-sellers"
        className="relative z-10 bg-[#f5f0e9] px-4 py-16 text-[#2f1f1d] sm:px-8 sm:py-20"
        aria-label="Strawberry best sellers"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex flex-col gap-3 sm:mb-12 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#b04b5b]">
                Berry Bliss Store
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-[#301716] sm:text-4xl">
                Strawberry Picks For Your Little One
              </h2>
            </div>
            <Link
              to="/shop"
              className="w-fit rounded-full bg-[#ce6874] px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(206,104,116,0.35)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#d87480]"
            >
              Explore Full Collection
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {STRAWBERRY_PRODUCTS.map((product, index) => {
              const isLiked = likedProductIds.has(product.id);
              const cartQuantity = cartItems[product.id] ?? 0;

              return (
                <article
                  key={product.id}
                  className="product-card overflow-hidden rounded-[1.25rem] border border-[#eadbca] bg-[#f8f4ed] p-2.5 shadow-[0_6px_18px_rgba(48,23,22,0.08)] motion-safe:animate-[cardIn_700ms_cubic-bezier(0.16,1,0.3,1)_both]"
                  style={{ animationDelay: `${index * 110}ms` }}
                >
                  <div className="relative overflow-hidden rounded-[1rem] bg-[#ede3d7]">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-52 w-full object-cover transition-transform duration-500 ease-out product-card-media"
                      loading="lazy"
                    />
                    <div className="absolute left-3 top-3 rounded-full bg-[#f3e2a8] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#463a1d]">
                      {product.tag}
                    </div>
                    <button
                      type="button"
                      aria-label={`${isLiked ? "Remove" : "Save"} ${product.name}`}
                      onClick={() => toggleLike(product.id)}
                      className={`absolute right-3 top-3 inline-flex h-10 w-10 items-center justify-center rounded-full shadow-sm transition-colors ${
                        isLiked
                          ? "bg-[#c9626d] text-white hover:bg-[#d36e79]"
                          : "bg-white/90 text-[#b14a5a] hover:bg-white"
                      }`}
                    >
                      <span aria-hidden="true">♥</span>
                    </button>
                  </div>

                  <div className="px-1 pb-1 pt-4">
                    <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#7d5d57]">
                      {product.category}
                    </p>
                    <h3 className="mt-2 min-h-12 text-[1.05rem] font-semibold leading-[1.25] text-[#2c1615]">
                      {product.name}
                    </h3>

                    <p className="mt-2 flex items-center gap-2 text-[0.95rem] text-[#4f3430]">
                      <span className="text-[#e2c56a]" aria-hidden="true">
                        ★
                      </span>
                      <span>
                        {product.rating}{" "}
                        <span className="text-[#7b605d]">
                          ({product.reviews})
                        </span>
                      </span>
                    </p>

                    <p className="mt-3 flex items-center gap-2.5 text-[1.45rem] font-semibold text-[#2d1716]">
                      <span>{product.price}</span>
                      {product.oldPrice ? (
                        <span className="text-[1rem] font-normal text-[#8f7571] line-through">
                          {product.oldPrice}
                        </span>
                      ) : null}
                    </p>

                    <button
                      type="button"
                      onClick={() => addToCart(product.id)}
                      className="mt-4 inline-flex items-center justify-center rounded-full bg-[#c9626d] px-3.5 py-2 text-[0.82rem] font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#d36e79]"
                    >
                      {cartQuantity > 0
                        ? `Add to Cart (${cartQuantity})`
                        : "Add to Cart"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Product Notes, Bundles, and Delivery Feature Cards */}
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <section
              id="product-notes"
              className="rounded-3xl border border-[#eadbca] bg-[#f8f4ed] p-6 shadow-[0_6px_18px_rgba(48,23,22,0.06)]"
            >
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#e8dbcc] text-[#b04b5b]">
                📝
              </div>
              <h3 className="text-xl font-semibold text-[#301716]">
                Product Notes
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#6d514d]">
                Crafted from 100% organic, breathable cotton that is
                hypoallergenic and ultra-soft on delicate newborn skin.
              </p>
            </section>

            <section
              id="bundles"
              className="rounded-3xl border border-[#eadbca] bg-[#f8f4ed] p-6 shadow-[0_6px_18px_rgba(48,23,22,0.06)]"
            >
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#e8dbcc] text-[#b04b5b]">
                🎁
              </div>
              <h3 className="text-xl font-semibold text-[#301716]">
                Bundles & Savings
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#6d514d]">
                Save up to 25% when you order our complete Strawberry Nursery &
                Sleep bundle sets.
              </p>
            </section>

            <section
              id="delivery"
              className="rounded-3xl border border-[#eadbca] bg-[#f8f4ed] p-6 shadow-[0_6px_18px_rgba(48,23,22,0.06)]"
            >
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#e8dbcc] text-[#b04b5b]">
                🚚
              </div>
              <h3 className="text-xl font-semibold text-[#301716]">
                Fast Express Delivery
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#6d514d]">
                Free nationwide tracked shipping on orders over Rs 2,000.
                Express 24-hour dispatch guaranteed.
              </p>
            </section>
          </div>
        </div>
      </section>

      {isCartOpen ? (
        <div className="fixed inset-0 z-40">
          <button
            type="button"
            className="absolute inset-0 bg-black/35"
            aria-label="Close cart"
            onClick={() => setIsCartOpen(false)}
          />

          <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col overflow-hidden border-l border-[#e1c8cb] bg-[#f4f1ea] text-[#2c1c1b] shadow-[-20px_0_40px_rgba(0,0,0,0.22)] sm:right-4 sm:top-4 sm:h-[calc(100%-2rem)] sm:rounded-2xl sm:border">
            <header className="flex items-center justify-between border-b border-[#e1c8cb] px-5 py-4 sm:px-6">
              <h2 className="text-2xl font-semibold tracking-tight">
                Your Cart
              </h2>
              <button
                type="button"
                onClick={() => setIsCartOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#d39da6] text-lg text-[#7f5d61] transition-colors hover:bg-[#eddde0]"
                aria-label="Close cart drawer"
              >
                ×
              </button>
            </header>

            <div className="flex-1 overflow-y-auto px-5 py-4 sm:px-6">
              {cartProducts.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[#d6c2c5] bg-[#f8f5ef] p-6 text-center">
                  <p className="text-lg font-medium text-[#4a3432]">
                    Your cart is empty
                  </p>
                  <p className="mt-2 text-sm text-[#7e6461]">
                    Add strawberry products to see them here.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cartProducts.map((product) => {
                    const qty = cartItems[product.id] ?? 0;
                    const lineTotal =
                      Number(product.price.replace(/[^\d]/g, "")) * qty;

                    return (
                      <article
                        key={product.id}
                        className="grid grid-cols-[4.25rem_1fr_auto] gap-3 border-b border-[#e4d4ce] pb-4"
                      >
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-17 w-17 rounded-2xl object-cover"
                          loading="lazy"
                        />

                        <div>
                          <h3 className="text-[1.15rem] font-medium leading-tight">
                            {product.name}
                          </h3>
                          <p className="mt-1 text-[1.05rem] text-[#7d6761]">
                            {product.category}
                          </p>

                          <div className="mt-3 inline-flex items-center gap-4 rounded-full border border-[#d8c7bf] px-4 py-1.5 text-base">
                            <button
                              type="button"
                              onClick={() => decreaseCartItem(product.id)}
                              className="text-[#684e4c] transition-colors hover:text-[#3c2a28]"
                              aria-label={`Decrease quantity for ${product.name}`}
                            >
                              −
                            </button>
                            <span>{qty}</span>
                            <button
                              type="button"
                              onClick={() => increaseCartItem(product.id)}
                              className="text-[#684e4c] transition-colors hover:text-[#3c2a28]"
                              aria-label={`Increase quantity for ${product.name}`}
                            >
                              +
                            </button>
                          </div>
                        </div>

                        <div className="flex min-w-20 flex-col items-end justify-between">
                          <button
                            type="button"
                            onClick={() => removeCartItem(product.id)}
                            className="text-xl text-[#795c58] transition-colors hover:text-[#4c3734]"
                            aria-label={`Remove ${product.name} from cart`}
                          >
                            🗑
                          </button>
                          <p className="text-[1.85rem] font-semibold tracking-tight">
                            {formatPrice(lineTotal)}
                          </p>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>

            <footer className="border-t border-[#dfd7cd] bg-[#ecefe8] px-5 py-5 sm:px-6">
              <div className="space-y-2 text-[1.1rem] text-[#6a504b]">
                <div className="flex items-center justify-between">
                  <span>Subtotal</span>
                  <span className="font-medium text-[#3a2624]">
                    {formatPrice(subtotal)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Shipping</span>
                  <span className="font-medium text-[#3a2624]">Free</span>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-[#d7cec5] pt-3 text-[1.85rem] font-semibold text-[#2f1f1d]">
                <span>Total</span>
                <span>{formatPrice(subtotal)}</span>
              </div>

              <button
                type="button"
                onClick={handleCheckout}
                disabled={cartProducts.length === 0}
                className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-[#c9626d] px-5 py-3 text-[1.5rem] font-semibold text-white transition-colors hover:bg-[#d16e79]"
              >
                Checkout →
              </button>

              <button
                type="button"
                onClick={() => setIsCartOpen(false)}
                className="mt-3 w-full text-center text-[1.25rem] text-[#6f5a57] transition-colors hover:text-[#422d2b]"
              >
                Continue shopping
              </button>
            </footer>
          </aside>
        </div>
      ) : null}
    </>
  );
}
