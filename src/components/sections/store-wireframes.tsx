"use client";

import gsap from "gsap";
import { usePathname, useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { requestRouteCover } from "@/lib/route-cover";
import { STORE_PRODUCTS, type StoreProduct } from "@/lib/store-products";

/**
 * Store catalog — layout/motion mirrored from lml.cc/en/journal masonry:
 * absolute packed columns, blur→focus entrance from bottom, hover scale + radius.
 * White placeholders stand in for product images for now.
 */

/** height / width for placeholder blocks (matches journal natural ratios). */
const ASPECT_RATIO: Record<StoreProduct["aspect"], number> = {
  portrait: 4 / 3,
  square: 1,
  landscape: 3 / 4,
};

const CONTENT_H = 80;
const COL_QUERIES = [
  "(min-width:2000px)",
  "(min-width:1500px)",
  "(min-width:1000px)",
  "(min-width:600px)",
  "(min-width:400px)",
] as const;
const COL_COUNTS = [5, 4, 3, 2, 2] as const;

type PlacedItem = StoreProduct & {
  x: number;
  y: number;
  w: number;
  h: number;
  imgH: number;
};

function useColumnCount() {
  const getCount = useCallback(() => {
    const idx = COL_QUERIES.findIndex((q) => matchMedia(q).matches);
    return idx >= 0 ? COL_COUNTS[idx] : 1;
  }, []);

  const [cols, setCols] = useState(1);

  useEffect(() => {
    setCols(getCount());
    const onChange = () => setCols(getCount());
    const mqls = COL_QUERIES.map((q) => matchMedia(q));
    mqls.forEach((mql) => mql.addEventListener("change", onChange));
    return () => mqls.forEach((mql) => mql.removeEventListener("change", onChange));
  }, [getCount]);

  return cols;
}

function useElementWidth<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [width, setWidth] = useState(0);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setWidth(entry.contentRect.width);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return [ref, width] as const;
}

export function StoreWireframes() {
  const router = useRouter();
  const pathname = usePathname();
  const navLockRef = useRef(false);
  const cols = useColumnCount();
  const [listRef, listWidth] = useElementWidth<HTMLDivElement>();
  const [canHover, setCanHover] = useState(false);
  const enteredRef = useRef(false);
  const prevLayoutRef = useRef<PlacedItem[]>([]);

  useEffect(() => {
    setCanHover(window.matchMedia("(hover: hover)").matches);
  }, []);

  const goProduct = useCallback(
    (id: string) => {
      const target = `/store/${id}`;
      if (target === pathname || navLockRef.current) return;
      navLockRef.current = true;
      requestRouteCover();
      setTimeout(() => {
        router.push(target);
        navLockRef.current = false;
      }, 500);
    },
    [pathname, router],
  );

  const layout = useMemo(() => {
    if (!listWidth) return [] as PlacedItem[];

    const gap = Math.max(20, Math.min(80, 0.05 * listWidth));
    const itemW = Math.max(0, (listWidth - gap * (cols - 1)) / cols);
    const colHeights = Array(cols).fill(0) as number[];

    return STORE_PRODUCTS.map((product) => {
      const col = colHeights.indexOf(Math.min(...colHeights));
      const imgH = Math.round(ASPECT_RATIO[product.aspect] * itemW);
      const h = imgH + CONTENT_H;
      const x = itemW * col + col * gap;
      const y = colHeights[col];
      colHeights[col] += h + gap;
      return { ...product, x, y, w: itemW, h, imgH };
    });
  }, [cols, listWidth]);

  useLayoutEffect(() => {
    if (!listWidth || layout.length === 0) return;

    const list = listRef.current;
    if (!list) return;

    const totalH = layout.reduce((max, item) => Math.max(max, item.y + item.h), 0);
    list.style.height = `${totalH}px`;

    const layoutChanged =
      prevLayoutRef.current.length > 0 &&
      prevLayoutRef.current.some((prev, i) => {
        const next = layout[i];
        return (
          !next ||
          prev.x !== next.x ||
          prev.y !== next.y ||
          prev.w !== next.w ||
          prev.h !== next.h
        );
      });

    layout.forEach((item, index) => {
      const sel = `[data-key="${item.id}"]`;

      if (enteredRef.current) {
        if (layoutChanged) {
          gsap.to(sel, {
            x: item.x,
            y: item.y,
            width: item.w,
            height: item.h,
            opacity: 1,
            filter: "blur(0px)",
            duration: 0.6,
            ease: "power3.out",
            delay: 0.05 * index,
          });
        } else {
          gsap.set(sel, {
            x: item.x,
            y: item.y,
            width: item.w,
            height: item.h,
            opacity: 1,
            filter: "blur(0px)",
          });
        }
      } else {
        gsap.fromTo(
          sel,
          {
            x: item.x,
            y: window.innerHeight + 200,
            opacity: 0,
            filter: "blur(10px)",
            width: item.w,
            height: item.h,
          },
          {
            x: item.x,
            y: item.y,
            width: item.w,
            height: item.h,
            opacity: 1,
            filter: "blur(0px)",
            duration: 0.8,
            ease: "power3.out",
            delay: index * 0.05,
          },
        );
      }
    });

    prevLayoutRef.current = layout;
    enteredRef.current = true;

    return () => {
      layout.forEach((item) => {
        gsap.killTweensOf(`[data-key="${item.id}"]`);
      });
    };
  }, [layout, listWidth, listRef]);

  const onEnter = useCallback(
    (id: string) => {
      if (!canHover) return;
      const sel = `[data-key="${id}"] .item-img`;
      gsap.to(sel, {
        scale: 0.95,
        borderRadius: "12px",
        duration: 0.3,
        ease: "power2.out",
        transformOrigin: "center center",
      });
    },
    [canHover],
  );

  const onLeave = useCallback(
    (id: string) => {
      if (!canHover) return;
      const sel = `[data-key="${id}"] .item-img`;
      gsap.to(sel, {
        scale: 1,
        borderRadius: "0px",
        duration: 0.3,
        ease: "power2.out",
        transformOrigin: "center center",
      });
    },
    [canHover],
  );

  return (
    <section className="relative h-auto min-h-screen w-full bg-black px-5 pt-[130px] pb-40 text-white md:px-6.5">
      <div ref={listRef} className="store-masonry-list relative w-full">
        {layout.map((item) => (
          <article
            key={item.id}
            data-key={item.id}
            className="store-masonry-item absolute cursor-pointer p-0 will-change-[transform,width,height,opacity]"
            style={{ width: item.w, height: item.h, opacity: 0 }}
            onMouseEnter={() => onEnter(item.id)}
            onMouseLeave={() => onLeave(item.id)}
          >
            <button
              type="button"
              onClick={() => goProduct(item.id)}
              className="item-card block h-full w-full cursor-pointer border-0 bg-transparent p-0 text-left text-inherit"
              aria-label={`View ${item.title}`}
            >
              <div
                className="item-img relative w-full overflow-hidden bg-white"
                style={{ height: item.imgH, width: "100%" }}
                aria-hidden
              />
              <div
                className="item-content mt-2.5 box-border pt-3"
                style={{ height: CONTENT_H }}
              >
                <h2 className="mb-1 line-clamp-2 font-swiss text-[14px] leading-[1.2] font-medium text-white md:text-lg">
                  {item.title}
                </h2>
                <p className="mt-2.5 font-swiss text-sm text-white/50">
                  {item.price}
                </p>
              </div>
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
