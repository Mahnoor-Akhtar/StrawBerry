import { useEffect, useMemo, useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";

const IMAGE_POOL = [
  "/images/OIP.webp",
  "/images/OIP%20(1).webp",
  "/images/OIP%20(2).webp",
  "/images/OIP%20(3).webp",
  "/images/OIP%20(4).webp",
  "/images/pexels-nietjuh-934055.jpg",
  "/images/strawberry-milk-splash-background_1198109-1061.avif",
] as const;

const TAG_POOL = [
  "Bestseller",
  "New",
  "Fresh",
  "Popular",
  "Limited",
  "Hot Pick",
] as const;
const CATEGORY_POOL = [
  "Sleep",
  "Feeding",
  "Toys",
  "Travel",
  "Care",
  "Gift",
] as const;
const NAME_POOL = [
  "Cloud Blanket",
  "Sleep Sack",
  "Teether Set",
  "Baby Bottle",
  "Stroller Kit",
  "Care Bundle",
  "Nursery Wrap",
  "Play Mat",
] as const;

const SHOP_PRODUCTS = Array.from({ length: 36 }, (_, index) => {
  const productNumber = index + 1;
  const basePrice = 1499 + (index % 9) * 300;

  return {
    id: `shop-product-${productNumber}`,
    tag: TAG_POOL[index % TAG_POOL.length],
    category: CATEGORY_POOL[index % CATEGORY_POOL.length],
    name: `Strawberry ${NAME_POOL[index % NAME_POOL.length]} ${productNumber}`,
    rating: (4.4 + (index % 5) * 0.1).toFixed(1),
    reviews: `${44 + index * 9}`,
    price: `Rs ${basePrice.toLocaleString("en-IN")}`,
    image: IMAGE_POOL[index % IMAGE_POOL.length],
  };
});

const BEST_SELLERS = SHOP_PRODUCTS.slice(0, 4);
const CHECKOUT_STORAGE_KEY = "berry-bliss-checkout";

type CartItems = Record<string, number>;

export const Route = createFileRoute("/shop")({
  component: Shop,
  head: () => ({
    meta: [
      { title: "Shop Strawberry | Berry Bliss" },
      {
        name: "description",
        content: "Browse Berry Bliss strawberry products.",
      },
    ],
  }),
});

function Shop() {
  const [cartItems, setCartItems] = useState<CartItems>({});
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const raw = window.localStorage.getItem(CHECKOUT_STORAGE_KEY);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw) as {
        items?: Array<{ id?: string; quantity?: number }>;
      };
      const items = parsed.items ?? [];

      const hydrated = items.reduce<CartItems>((acc, item) => {
        if (!item.id || !item.quantity || item.quantity < 1) return acc;
        acc[item.id] = item.quantity;
        return acc;
      }, {});

      setCartItems(hydrated);
    } catch {
      // Ignore invalid localStorage payload.
    }
  }, []);

  const cartCount = useMemo(
    () => Object.values(cartItems).reduce((sum, qty) => sum + qty, 0),
    [cartItems],
  );

  const cartProducts = useMemo(
    () => SHOP_PRODUCTS.filter((product) => (cartItems[product.id] ?? 0) > 0),
    [cartItems],
  );

  const subtotal = useMemo(
    () =>
      cartProducts.reduce((sum, product) => {
        const numericPrice = Number(product.price.replace(/[^\d]/g, ""));
        return sum + numericPrice * (cartItems[product.id] ?? 0);
      }, 0),
    [cartItems, cartProducts],
  );

  const persistCheckout = (nextCart: CartItems) => {
    if (typeof window === "undefined") return;

    const selectedProducts = SHOP_PRODUCTS.filter(
      (product) => (nextCart[product.id] ?? 0) > 0,
    );
    const subtotal = selectedProducts.reduce((sum, product) => {
      const numericPrice = Number(product.price.replace(/[^\d]/g, ""));
      return sum + numericPrice * (nextCart[product.id] ?? 0);
    }, 0);

    const payload = {
      items: selectedProducts.map((product) => ({
        id: product.id,
        name: product.name,
        category: product.category,
        image: product.image,
        price: product.price,
        quantity: nextCart[product.id] ?? 0,
      })),
      subtotal,
      shipping: 0,
      total: subtotal,
      createdAt: Date.now(),
    };

    window.localStorage.setItem(CHECKOUT_STORAGE_KEY, JSON.stringify(payload));
  };

  const addToCart = (productId: string) => {
    setCartItems((current) => {
      const next = {
        ...current,
        [productId]: (current[productId] ?? 0) + 1,
      };
      persistCheckout(next);
      return next;
    });
    setIsCartOpen(true);
  };

  const increaseCartItem = (productId: string) => {
    setCartItems((current) => {
      const next = {
        ...current,
        [productId]: (current[productId] ?? 0) + 1,
      };
      persistCheckout(next);
      return next;
    });
  };

  const decreaseCartItem = (productId: string) => {
    setCartItems((current) => {
      const qty = current[productId] ?? 0;
      let next: CartItems;

      if (qty <= 1) {
        const { [productId]: _, ...rest } = current;
        next = rest;
      } else {
        next = {
          ...current,
          [productId]: qty - 1,
        };
      }

      persistCheckout(next);
      return next;
    });
  };

  const removeCartItem = (productId: string) => {
    setCartItems((current) => {
      const { [productId]: _, ...rest } = current;
      persistCheckout(rest);
      return rest;
    });
  };

  const formatPrice = (value: number) => `Rs ${value.toLocaleString("en-IN")}`;

  return (
    <>
      <Navbar
        isPastVideo={true}
        cartCount={cartCount}
        onOpenCart={() => setIsCartOpen(true)}
      />

      <main className="min-h-screen bg-[#f5f0e9] px-4 pb-8 pt-24 text-[#2f1f1d] sm:px-8 sm:pb-10 sm:pt-28">
        <div className="mx-auto max-w-7xl">
          <header className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#b04b5b]">
                Berry Bliss Shop
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#301716] sm:text-4xl">
                Strawberry Collection
              </h1>
              <p className="mt-2 text-sm text-[#6d514d]">
                Choose from 36 products crafted for your little one.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <Link
                to="/checkout"
                className="inline-flex items-center justify-center rounded-full border border-[#d8c7bf] bg-white/70 px-4 py-2.5 text-xs font-semibold text-[#5a403d] transition-colors hover:bg-white sm:text-sm sm:py-3"
              >
                Checkout ({cartCount})
              </Link>
              <button
                type="button"
                onClick={() => setIsCartOpen(true)}
                className="inline-flex items-center justify-center rounded-full border border-[#d8c7bf] bg-white/70 px-4 py-2.5 text-xs font-semibold text-[#5a403d] transition-colors hover:bg-white sm:text-sm sm:py-3"
              >
                Cart ({cartCount})
              </button>
              <Link
                to="/"
                className="inline-flex items-center justify-center rounded-full bg-[#c9626d] px-5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#d16e79] sm:text-sm sm:px-6 sm:py-3"
              >
                Back to Home
              </Link>
            </div>
          </header>

          <section
            id="best-sellers"
            className="mb-10 rounded-3xl border border-[#e7d7c9] bg-[#fbf8f2] p-4 shadow-[0_10px_26px_rgba(48,23,22,0.08)] sm:mb-12 sm:p-6"
            aria-label="Best sellers"
          >
            <div className="mb-4 flex items-center justify-between sm:mb-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#b04b5b]">
                  Top Picks
                </p>
                <h2 className="mt-1 text-2xl font-semibold tracking-tight text-[#301716] sm:text-3xl">
                  Best Sellers
                </h2>
              </div>
              <span className="rounded-full bg-[#f3e2a8] px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-[#4b3d22]">
                Most Loved
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {BEST_SELLERS.map((product) => (
                <article
                  key={`best-${product.id}`}
                  className="overflow-hidden rounded-3xl border border-[#eadbca] bg-[#f8f4ed] p-2.5 shadow-[0_6px_18px_rgba(48,23,22,0.08)]"
                >
                  <div className="relative overflow-hidden rounded-2xl bg-[#ede3d7]">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-44 w-full object-cover transition-transform duration-500 ease-out hover:scale-[1.03]"
                      loading="lazy"
                    />
                    <div className="absolute left-3 top-3 rounded-full bg-[#c9626d] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-white">
                      Bestseller
                    </div>
                  </div>

                  <div className="px-1 pb-1 pt-3">
                    <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#7d5d57]">
                      {product.category}
                    </p>
                    <h3 className="mt-1 min-h-11 text-base font-semibold leading-tight text-[#2c1615]">
                      {product.name}
                    </h3>
                    <p className="mt-2 text-xl font-semibold text-[#2d1716]">
                      {product.price}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section
            id="product-notes"
            className="mb-6 rounded-3xl border border-[#eadbca] bg-[#f8f4ed] p-5 sm:mb-8 sm:p-6"
            aria-label="Product notes"
          >
            <h2 className="text-xl font-semibold tracking-tight text-[#301716] sm:text-2xl">
              Product Notes
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[#6d514d]">
              All Berry Bliss picks are gentle on baby skin, easy to clean, and
              crafted for everyday comfort.
            </p>
          </section>

          <section
            id="bundles"
            className="mb-6 rounded-3xl border border-[#eadbca] bg-[#f8f4ed] p-5 sm:mb-8 sm:p-6"
            aria-label="Bundles"
          >
            <h2 className="text-xl font-semibold tracking-tight text-[#301716] sm:text-2xl">
              Bundles
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[#6d514d]">
              Save more with curated bundle packs made for sleep, feeding, and
              travel routines.
            </p>
          </section>

          <section
            id="delivery"
            className="mb-6 rounded-3xl border border-[#eadbca] bg-[#f8f4ed] p-5 sm:mb-8 sm:p-6"
            aria-label="Delivery"
          >
            <h2 className="text-xl font-semibold tracking-tight text-[#301716] sm:text-2xl">
              Delivery
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[#6d514d]">
              We dispatch within 24 hours and provide tracked delivery so your
              essentials arrive right on time.
            </p>
          </section>

          <section
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
            aria-label="Shop products"
          >
            {SHOP_PRODUCTS.map((product, index) => {
              const quantity = cartItems[product.id] ?? 0;

              return (
                <article
                  key={product.id}
                  className="overflow-hidden rounded-[1.25rem] border border-[#eadbca] bg-[#f8f4ed] p-2.5 shadow-[0_8px_20px_rgba(48,23,22,0.08)]"
                  style={{ animationDelay: `${index * 40}ms` }}
                >
                  <div className="relative overflow-hidden rounded-[1rem] bg-[#ede3d7]">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-52 w-full object-cover transition-transform duration-500 ease-out hover:scale-[1.03]"
                      loading="lazy"
                    />
                    <div className="absolute left-3 top-3 rounded-full bg-[#f3e2a8] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#463a1d]">
                      {product.tag}
                    </div>
                  </div>

                  <div className="px-1 pb-1 pt-4">
                    <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#7d5d57]">
                      {product.category}
                    </p>
                    <h2 className="mt-2 min-h-12 text-[1.05rem] font-semibold leading-[1.25] text-[#2c1615]">
                      {product.name}
                    </h2>

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

                    <p className="mt-3 text-[1.4rem] font-semibold text-[#2d1716]">
                      {product.price}
                    </p>

                    <button
                      type="button"
                      onClick={() => addToCart(product.id)}
                      className="mt-4 inline-flex items-center justify-center rounded-full bg-[#c9626d] px-3.5 py-2 text-[0.82rem] font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#d36e79]"
                    >
                      {quantity > 0
                        ? `Add to Cart (${quantity})`
                        : "Add to Cart"}
                    </button>
                  </div>
                </article>
              );
            })}
          </section>
        </div>

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
                            <h3 className="text-[1.05rem] font-medium leading-tight">
                              {product.name}
                            </h3>
                            <p className="mt-1 text-[0.95rem] text-[#7d6761]">
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
                            <p className="text-[1.45rem] font-semibold tracking-tight">
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

                <div className="mt-3 flex items-center justify-between border-t border-[#d7cec5] pt-3 text-[1.65rem] font-semibold text-[#2f1f1d]">
                  <span>Total</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>

                <Link
                  to="/checkout"
                  className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-[#c9626d] px-5 py-3 text-[1.2rem] font-semibold text-white transition-colors hover:bg-[#d16e79]"
                >
                  Checkout →
                </Link>

                <button
                  type="button"
                  onClick={() => setIsCartOpen(false)}
                  className="mt-3 w-full text-center text-[1rem] text-[#6f5a57] transition-colors hover:text-[#422d2b]"
                >
                  Continue shopping
                </button>
              </footer>
            </aside>
          </div>
        ) : null}
      </main>
    </>
  );
}
