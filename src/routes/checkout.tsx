import { useEffect, useMemo, useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";

const CHECKOUT_STORAGE_KEY = "berry-bliss-checkout";

type CheckoutItem = {
  id: string;
  name: string;
  category: string;
  image: string;
  price: string;
  quantity: number;
};

type CheckoutSession = {
  items: CheckoutItem[];
  subtotal: number;
  shipping: number;
  total: number;
  createdAt: number;
};

export const Route = createFileRoute("/checkout")({
  component: Checkout,
  head: () => ({
    meta: [
      { title: "Checkout | Berry Bliss" },
      { name: "description", content: "Complete your Berry Bliss purchase." },
    ],
  }),
});

function Checkout() {
  const [session, setSession] = useState<CheckoutSession | null>(null);
  const [isPlaced, setIsPlaced] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const raw = window.localStorage.getItem(CHECKOUT_STORAGE_KEY);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw) as CheckoutSession;
      if (!Array.isArray(parsed.items)) return;
      setSession(parsed);
    } catch {
      // Keep empty state if payload is invalid.
    }
  }, []);

  const itemCount = useMemo(() => {
    if (!session) return 0;
    return session.items.reduce((sum, item) => sum + item.quantity, 0);
  }, [session]);

  const formatPrice = (value: number) => `Rs ${value.toLocaleString("en-IN")}`;

  const placeOrder = () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(CHECKOUT_STORAGE_KEY);
    }
    setIsPlaced(true);
  };

  if (isPlaced) {
    return (
      <>
        <Navbar isPastVideo={true} cartCount={0} />
        <main className="min-h-screen bg-[#f5f0e9] px-4 pb-14 pt-24 text-[#2f1f1d] sm:px-8 sm:pt-28">
          <div className="mx-auto max-w-2xl rounded-3xl border border-[#e7d7c9] bg-[#fbf8f2] p-8 text-center shadow-[0_12px_30px_rgba(48,23,22,0.08)]">
            <h1 className="text-3xl font-semibold tracking-tight text-[#301716]">
              Order Confirmed
            </h1>
            <p className="mt-3 text-base text-[#6d514d]">
              Thanks for your purchase. Your strawberry goodies will be on their
              way soon.
            </p>
            <Link
              to="/shop"
              className="mt-6 inline-flex rounded-full bg-[#c9626d] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#d36e79]"
            >
              Continue Shopping
            </Link>
          </div>
        </main>
      </>
    );
  }

  if (!session || session.items.length === 0) {
    return (
      <>
        <Navbar isPastVideo={true} cartCount={0} />
        <main className="min-h-screen bg-[#f5f0e9] px-4 pb-14 pt-24 text-[#2f1f1d] sm:px-8 sm:pt-28">
          <div className="mx-auto max-w-2xl rounded-3xl border border-dashed border-[#d8c7bf] bg-[#fbf8f2] p-8 text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-[#301716]">
              Your checkout is empty
            </h1>
            <p className="mt-3 text-base text-[#6d514d]">
              Add products to cart, then click Checkout to continue.
            </p>
            <Link
              to="/shop"
              className="mt-6 inline-flex rounded-full bg-[#c9626d] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#d36e79]"
            >
              Browse Products
            </Link>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar isPastVideo={true} cartCount={itemCount} />
      <main className="min-h-screen bg-[#f5f0e9] px-4 pb-10 pt-24 text-[#2f1f1d] sm:px-8 sm:pt-28">
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.25fr_0.95fr]">
          <section className="rounded-3xl border border-[#e7d7c9] bg-[#fbf8f2] p-6 shadow-[0_10px_26px_rgba(48,23,22,0.07)] sm:p-7">
            <h1 className="text-3xl font-semibold tracking-tight text-[#301716]">
              Checkout
            </h1>
            <p className="mt-2 text-sm text-[#6d514d]">
              {itemCount} items ready for delivery
            </p>

            <div className="mt-6 space-y-4">
              {session.items.map((item) => (
                <article
                  key={item.id}
                  className="grid grid-cols-[4.5rem_1fr_auto] gap-3 rounded-2xl border border-[#eadbca] bg-[#f8f4ed] p-3"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-18 w-18 rounded-2xl object-cover"
                    loading="lazy"
                  />
                  <div>
                    <h2 className="text-lg font-semibold text-[#2c1615]">
                      {item.name}
                    </h2>
                    <p className="text-sm text-[#7d6761]">{item.category}</p>
                    <p className="mt-1 text-sm text-[#5a403d]">
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <p className="self-center text-lg font-semibold text-[#2d1716]">
                    {item.price}
                  </p>
                </article>
              ))}
            </div>
          </section>

          <aside className="h-fit rounded-3xl border border-[#dfd7cd] bg-[#ecefe8] p-6 shadow-[0_10px_26px_rgba(48,23,22,0.08)] sm:p-7">
            <h2 className="text-2xl font-semibold tracking-tight text-[#301716]">
              Payment Summary
            </h2>
            <div className="mt-4 space-y-2 text-base text-[#6a504b]">
              <div className="flex items-center justify-between">
                <span>Subtotal</span>
                <span className="font-medium text-[#3a2624]">
                  {formatPrice(session.subtotal)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Shipping</span>
                <span className="font-medium text-[#3a2624]">Free</span>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-[#d7cec5] pt-4 text-2xl font-semibold text-[#2f1f1d]">
              <span>Total</span>
              <span>{formatPrice(session.total)}</span>
            </div>

            <button
              type="button"
              onClick={placeOrder}
              className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-[#c9626d] px-5 py-3 text-lg font-semibold text-white transition-colors hover:bg-[#d16e79]"
            >
              Place Order
            </button>

            <Link
              to="/"
              className="mt-3 inline-flex w-full items-center justify-center rounded-full border border-[#d8c7bf] bg-white/70 px-5 py-3 text-sm font-semibold text-[#5a403d] transition-colors hover:bg-white"
            >
              Back to Home
            </Link>
          </aside>
        </div>
      </main>
    </>
  );
}
