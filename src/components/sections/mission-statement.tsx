"use client";

import Image from "next/image";
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";

import {
  MISSION_LOCKED_TITLE,
  useLanguage,
} from "@/context/LanguageContext";

/** Figma frame 64:6 — desktop canvas (unchanged). */
const FRAME_W = 1422;
const FRAME_H = 1247;

function pct(n: number, total: number) {
  return `${((n / total) * 100).toFixed(3)}%`;
}

const fadeMaskH: CSSProperties = {
  maskImage:
    "linear-gradient(to right, transparent, black 12%, black 88%, transparent)",
  WebkitMaskImage:
    "linear-gradient(to right, transparent, black 12%, black 88%, transparent)",
};

const fadeMaskV: CSSProperties = {
  maskImage:
    "linear-gradient(to bottom, transparent, black 12%, black 88%, transparent)",
  WebkitMaskImage:
    "linear-gradient(to bottom, transparent, black 12%, black 88%, transparent)",
};

function GrowsUnderline({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 601.148 14.289"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`pointer-events-none absolute left-0 bottom-[-0.12em] h-auto w-full text-black dark:text-white ${className}`}
      aria-hidden="true"
      preserveAspectRatio="none"
    >
      <path
        fill="currentColor"
        d="M588.814 3.868C584.126 3.808 579.635 3.557 581.473 3.458C582.409 3.40244 583.342 3.33843 584.273 3.266C585.779 3.148 585.893 3.121 585.062 3.071C584.249 3.02984 583.432 3.00814 582.614 3.006C581.661 3.001 581.205 2.963 581.352 2.898C581.514 2.823 582.996 2.796 586.51 2.804C589.383 2.809 591.588 2.777 591.79 2.727C592.213 2.623 588.333 2.301 585.867 2.233C584.58 2.19128 583.297 2.12957 582.019 2.048C580.278 1.93 580.09 1.896 580.839 1.828C582.5 1.682 581.831 1.576 579.635 1.634C577.292 1.697 576.624 1.55 578.845 1.461C580.269 1.405 580.392 1.364 579.659 1.184C579.333 1.102 579.456 1.032 580.058 0.962C580.539 0.907 580.798 0.837 580.619 0.811C580.351 0.767 572.37 0.65 564.421 0.571C560.083 0.527 555.486 0.411 555.201 0.339C555.046 0.301 554.476 0.267 553.933 0.267C552.703 0.267 552.198 0.139 552.785 0C547.617 0.015846 542.449 0.0661845 537.284 0.151L536.242 0.181C529.969 0.231 522.085 0.327 517.162 0.426C513.914 0.485231 510.665 0.532566 507.416 0.568C504.226 0.601 499.368 0.657 496.617 0.688C493.867 0.722 485.577 0.778 478.206 0.816C462.722 0.893 452.055 1.013 443.446 1.203C439.589 1.287 433.609 1.266 427.043 1.141C420.386 1.013 416.693 0.999 416.676 1.102C416.661 1.189 415.642 1.249 414.415 1.234L412.185 1.208L413.91 1.393C414.862 1.494 415.513 1.61 415.366 1.651C414.749 1.814 394.977 1.668 374.847 1.352C363.032 1.167 352.537 1.042 351.519 1.073C350.503 1.107 343.879 1.097 336.81 1.056C314.328 0.922 312.253 0.936 310.935 1.236C310.283 1.386 309.429 1.502 309.03 1.494C308.631 1.487 305.052 1.524 301.081 1.576C297.11 1.629 289.724 1.675 284.661 1.682C269.047 1.702 256.81 1.781 250.202 1.911C246.721 1.978 240.935 2.053 237.348 2.077C233.759 2.101 230.611 2.154 230.368 2.195C230.115 2.235 223.37 2.178 215.371 2.07C200.448 1.867 177.341 1.884 141.403 2.125C138.577 2.145 110.443 2.132 97.5307 2.108C92.6081 2.098 66.7914 1.757 35.7005 1.288C18.7281 1.032 12.7636 1.054 8.88286 1.388C5.12943 1.711 2.10511 1.759 1.225 1.511C0.810829 1.393 0.282328 1.345 0.0622997 1.405C-0.157729 1.465 0.224086 1.655 0.9079 1.831C1.59171 2.005 2.53654 2.262 3.00033 2.401C4.79076 2.938 6.8573 3.171 11.3722 3.343C13.9521 3.442 18.4692 3.61 21.4115 3.718C24.3582 3.827 26.8713 3.976 26.9942 4.05C27.4019 4.277 24.1209 4.344 21.2907 4.166C17.9795 3.959 2.11374 3.629 2.07923 3.766C2.03177 4.005 14.1161 4.609 24.1878 4.869C30.2256 5.025 39.2641 5.316 44.2837 5.514C54.6596 5.925 71.1186 6.248 114.803 6.898C131.59 7.148 145.307 7.408 145.292 7.478C145.249 7.668 140.971 7.726 134.916 7.613C131.411 7.548 129.564 7.572 129.75 7.675C129.914 7.767 132.444 7.882 135.552 7.94C139.677 8.017 140.995 8.09 140.807 8.231C139.97 8.859 124.486 8.915 116.749 8.315C112.59 7.993 109.678 7.882 92.7612 7.396C88.8805 7.286 84.9739 7.134 84.0809 7.061C82.7046 6.951 82.3875 6.982 82.0208 7.266C81.6239 7.574 81.2982 7.593 78.2458 7.49C73.6985 7.336 73.966 7.526 78.6039 7.74C80.6532 7.836 82.6162 7.99 82.9484 8.087C83.9493 8.371 85.2608 8.421 101.362 8.823C117.025 9.213 119.995 9.37 116.473 9.627C115.114 9.726 118.686 9.81 129.825 9.945C151.116 10.202 175.714 10.635 175.941 10.761C176.243 10.927 173.988 11.013 170.604 10.965C168.009 10.927 167.674 10.951 168.708 11.098C170.049 11.288 176.683 11.293 178.456 11.105C179.049 11.042 182.134 10.965 185.322 10.937C191.01 10.881 191.149 10.888 193.256 11.314C195.208 11.707 196.373 11.786 206.218 12.171C216.974 12.595 230.368 13.247 231.839 13.421C232.262 13.471 228.122 13.401 222.636 13.269C217.153 13.134 212.312 13.083 211.889 13.153C211.4 13.235 213.223 13.329 216.868 13.411C220.033 13.483 227.21 13.668 232.807 13.825C247.208 14.227 256.695 14.385 257.241 14.231C257.511 14.155 256.883 14.123 255.736 14.155C254.655 14.183 253.654 14.147 253.516 14.07C253.108 13.842 256.575 13.84 270.048 14.058C277.096 14.171 283.051 14.236 283.278 14.2C283.507 14.164 286.704 14.162 290.381 14.198C299.39 14.285 313.791 14.268 323.107 14.162C327.489 14.1134 331.872 14.0894 336.255 14.09C339.29 14.097 342.366 14.082 343.089 14.056C343.814 14.029 349.265 13.986 355.197 13.959C361.129 13.933 366.809 13.895 367.825 13.875C368.841 13.856 375.123 13.762 381.788 13.668C388.452 13.574 396.873 13.444 400.501 13.379C404.13 13.314 409.469 13.223 412.364 13.179C418.466 13.086 430.395 12.799 433.486 12.672C435.585 12.585 435.741 12.527 435.203 12.027C434.975 11.813 435.691 11.738 439.328 11.594C441.746 11.497 444.788 11.423 446.091 11.43C447.391 11.435 448.815 11.396 449.264 11.343C449.71 11.29 452.804 11.177 456.147 11.095C459.491 11.013 463.292 10.9 464.601 10.847C465.91 10.794 468.564 10.737 470.501 10.717C472.99 10.693 474.12 10.614 474.381 10.441C474.934 10.075 474.511 10.031 471.737 10.169C470.337 10.239 467.88 10.309 466.292 10.323C464.698 10.34 462.086 10.393 460.492 10.443C449.736 10.78 449.507 10.778 450.549 10.267C451.298 9.901 453.902 9.747 459.581 9.731C462.129 9.72248 464.675 9.69014 467.22 9.634C468.963 9.589 473.706 9.534 477.757 9.514C481.88 9.49438 486.002 9.46238 490.124 9.418C492.875 9.384 501.516 9.293 509.327 9.211C517.138 9.129 523.899 9.001 524.362 8.927C524.925 8.833 524.177 8.799 522.037 8.821C520.296 8.838 516.155 8.869 512.826 8.891C509.498 8.912 504.169 8.948 500.988 8.971C497.806 8.991 489.287 9.018 482.061 9.028C474.837 9.038 465.488 9.083 461.29 9.134C457.09 9.184 452.234 9.237 450.491 9.252C446.073 9.288 437.596 9.497 428.581 9.793C424.366 9.933 419.599 10.087 418.002 10.137C416.4 10.188 412.469 10.325 409.272 10.443C403.015 10.672 391.543 10.941 382.61 11.069C379.566 11.112 376.361 11.163 375.489 11.179C374.62 11.196 371.186 11.204 367.866 11.196C364.546 11.189 360.633 11.226 359.175 11.278C357.719 11.331 352.276 11.372 347.069 11.372C341.87 11.372 336.337 11.375 334.775 11.382C333.212 11.387 331.503 11.312 330.983 11.213C330.291 11.086 329.583 11.093 328.427 11.24C327.003 11.423 326.833 11.418 326.882 11.201C326.915 11.028 326.736 10.999 326.248 11.103C325.873 11.182 323.856 11.201 321.772 11.143C319.688 11.088 317.973 11.1 317.956 11.173C317.939 11.245 318.226 11.317 318.582 11.329C319.095 11.349 319.095 11.367 318.575 11.42C318.209 11.456 317.24 11.324 316.41 11.122C315.085 10.799 314.246 10.746 309.267 10.672C294.256 10.443 281.913 10.154 281.936 10.032C281.96 9.894 286.175 9.887 306.638 9.991C312.846 10.021 321.235 10.034 325.288 10.015C329.339 9.995 337.849 9.971 344.213 9.955C360.836 9.916 361.731 9.911 365.506 9.889C367.385 9.878 371.177 9.839 373.928 9.801C376.678 9.764 381.161 9.735 383.887 9.738C386.612 9.74 389.248 9.688 389.752 9.618C390.257 9.548 390.762 9.524 390.876 9.562C391.079 9.632 393.601 9.605 407.905 9.389C411.673 9.331 416.889 9.259 419.499 9.225C422.933 9.175 426.364 9.10433 429.793 9.013C448.148 8.51 453.984 8.426 475.374 8.356C496.22 8.286 508.904 8.156 527.236 7.824C530.571 7.764 535.552 7.711 538.293 7.704C541.044 7.699 544.176 7.673 545.265 7.644L555.039 7.699C555.181 7.70264 555.322 7.6928 555.455 7.6701C555.588 7.6474 555.709 7.61231 555.811 7.567C556.073 7.567 556.316 7.562 556.601 7.562C558.35 7.562 559.651 7.528 559.498 7.49C559.099 7.389 562.093 7.324 569.684 7.268C573.289 7.242 577.657 7.184 579.383 7.138C580.876 7.0969 582.37 7.06256 583.865 7.035C584.599 7.023 585.541 6.98 585.966 6.936C586.501 6.881 585.72 6.845 583.322 6.811C580.783 6.775 580.213 6.746 581.082 6.698C583.362 6.573 581.678 6.498 577.146 6.525C573.964 6.544 572.165 6.515 571.254 6.438C570.53 6.375 570.189 6.323 570.489 6.323C570.791 6.323 571.034 6.25 571.034 6.166C571.034 6.034 570.735 6.016 569.05 6.053C567.764 6.079 567.063 6.063 567.063 6.003C567.063 5.945 568.073 5.909 569.652 5.909C571.938 5.909 572.255 5.887 572.402 5.723C572.564 5.54 572.743 5.535 580.066 5.513C584.754 5.499 587.446 5.461 587.243 5.41C587.073 5.367 586.348 5.33 585.647 5.33C584.948 5.33 584.37 5.295 584.37 5.251C584.37 5.114 586.104 5.025 589.09 5.011C590.577 5.00444 592.063 4.98277 593.549 4.946L595.119 4.893L591.458 4.695L592.718 4.59C593.728 4.505 594.549 4.503 596.804 4.582C599.627 4.682 601.148 4.621 601.148 4.407C601.148 4.214 595.266 3.964 588.82 3.882L588.814 3.868Z"
      />
    </svg>
  );
}

/** Desktop Figma grid line (static). */
function GridLine({
  orientation,
  left,
  top,
  length,
}: {
  orientation: "horizontal" | "vertical";
  left: number;
  top: number;
  length: number;
}) {
  const isH = orientation === "horizontal";
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute bg-black dark:bg-white ${isH ? "h-px" : "w-px"}`}
      style={{
        left: pct(left, FRAME_W),
        top: pct(top, FRAME_H),
        ...(isH
          ? { width: pct(length, FRAME_W), ...fadeMaskH }
          : { height: pct(length, FRAME_H), ...fadeMaskV }),
      }}
    />
  );
}

export function MissionStatement() {
  const { t } = useLanguage();
  const desktopImageRef = useRef<HTMLImageElement>(null);
  const [imageInView, setImageInView] = useState(false);

  const wordClass =
    "font-swiss text-[clamp(5rem,25vw,14rem)] font-black leading-[0.86] tracking-tighter text-black dark:text-white";

  useEffect(() => {
    const el = desktopImageRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        setImageInView(entries.some((e) => e.isIntersecting));
      },
      { root: null, rootMargin: "-20% 0px -20% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="mission-section"
      aria-labelledby="mission-heading"
      className="relative w-full bg-white text-black dark:bg-black dark:text-white swiss-no-select"
    >
      <h2 id="mission-heading" className="sr-only">
        {MISSION_LOCKED_TITLE.full}
      </h2>

      {/* ── Mobile only — static layout ── */}
      <div className="relative px-5 pt-32 pb-28 md:hidden">
        <div className="relative z-10 flex flex-col gap-32">
          <div className="-ml-4 flex flex-col gap-10" aria-hidden="true">
            <div className="mr-auto text-left">
              <p className={wordClass}>{MISSION_LOCKED_TITLE.where}</p>
            </div>

            <div className="mr-auto pl-[8%] text-left">
              <p className={wordClass}>{MISSION_LOCKED_TITLE.talent}</p>
            </div>

            <div className="mr-auto pl-[14%] text-left">
              <p className={`${wordClass} italic`}>
                <span className="relative inline-block">
                  {MISSION_LOCKED_TITLE.grows}
                  <span className="absolute inset-x-0 bottom-0 block">
                    <GrowsUnderline />
                  </span>
                </span>
              </p>
            </div>
          </div>

          <div className="flex flex-col">
            <div className="border-t border-black py-5 dark:border-white">
              <p className="text-right font-swiss text-[clamp(1.375rem,6vw,2rem)] font-black leading-[1.05] tracking-tight text-black dark:text-white">
                {t.mission.professionalPedagogy}
              </p>
            </div>

            <div className="border-t border-black py-5 dark:border-white">
              <p className="text-right font-swiss text-[clamp(1.375rem,6vw,2rem)] font-black leading-[1.05] tracking-tight text-[#666666]">
                {t.mission.danceForAllAges}
              </p>
            </div>

            <div
              aria-hidden="true"
              className="h-0.5 w-full bg-black dark:bg-white"
            />
          </div>
        </div>
      </div>

      {/* ── Desktop — original Figma canvas ── */}
      {/* overflow visible so 10vw title type isn’t clipped at the right edge */}
      <div className="relative mx-auto hidden w-full max-w-[1422px] pt-44 pb-32 md:block">
        <div
          className="relative w-full"
          style={{ aspectRatio: `${FRAME_W} / ${FRAME_H}` }}
        >
          <p
            className="absolute font-alt font-normal leading-none tracking-tight text-black dark:text-white whitespace-nowrap text-[clamp(1.125rem,3.87vw,3.4375rem)]"
            style={{ left: pct(0, FRAME_W), top: pct(10, FRAME_H) }}
          >
            {t.mission.jazzBalletAcro}
          </p>

          <div
            className="absolute overflow-hidden swiss-diamond"
            style={{
              left: pct(1067, FRAME_W),
              top: pct(0, FRAME_H),
              width: pct(333, FRAME_W),
              height: pct(512, FRAME_H),
            }}
          >
            <Image
              ref={desktopImageRef}
              src="/images/mission-dancer.jpg"
              alt="Dancer in a dynamic leap"
              fill
              sizes="24vw"
              className={`object-cover object-[38.34%_100%] transform-gpu backface-hidden [will-change:transform,filter] ${
                imageInView
                  ? "grayscale-0 brightness-100 contrast-100"
                  : "grayscale hover:grayscale-0 brightness-95 contrast-105 hover:brightness-100 hover:contrast-100"
              }`}
            />
          </div>

          <GridLine orientation="vertical" left={185} top={223} length={681} />
          <GridLine orientation="vertical" left={1067} top={0} length={504} />
          <GridLine orientation="vertical" left={516} top={421} length={826} />
          <GridLine
            orientation="horizontal"
            left={79}
            top={512}
            length={915}
          />
          <GridLine
            orientation="horizontal"
            left={1161}
            top={512}
            length={261}
          />
          <GridLine
            orientation="horizontal"
            left={224}
            top={795}
            length={997}
          />
          <GridLine
            orientation="horizontal"
            left={415}
            top={1060}
            length={997}
          />

          <div
            className="absolute flex items-center justify-center"
            style={{
              left: pct(99, FRAME_W),
              top: pct(276, FRAME_H),
              width: pct(77, FRAME_W),
              height: pct(690, FRAME_H),
            }}
          >
            <p className="-rotate-90 font-swiss text-[clamp(0.875rem,4.7vw,4.1875rem)] leading-none whitespace-nowrap text-black dark:text-white">
              {t.mission.professionalPedagogy}
            </p>
          </div>

          <p
            aria-hidden="true"
            className="absolute font-swiss text-[10vw] font-black leading-none tracking-tighter text-black dark:text-white whitespace-nowrap"
            style={{ left: pct(274, FRAME_W), top: pct(275, FRAME_H) }}
          >
            {MISSION_LOCKED_TITLE.where}
          </p>
          <p
            aria-hidden="true"
            className="absolute font-swiss text-[10vw] font-black leading-none tracking-tighter text-black dark:text-white whitespace-nowrap"
            style={{ left: pct(595, FRAME_W), top: pct(549, FRAME_H) }}
          >
            {MISSION_LOCKED_TITLE.talent}
          </p>
          <p
            aria-hidden="true"
            className="absolute font-swiss text-[10vw] font-black italic leading-none tracking-tighter text-black dark:text-white whitespace-nowrap"
            style={{ left: pct(846, FRAME_W), top: pct(795, FRAME_H) }}
          >
            <span className="relative inline-block whitespace-nowrap">
              {MISSION_LOCKED_TITLE.grows}
              <GrowsUnderline />
            </span>
          </p>

          <p
            className="absolute font-swiss text-[clamp(0.75rem,2.39vw,2.125rem)] leading-none whitespace-nowrap text-black dark:text-white"
            style={{ left: pct(524, FRAME_W), top: pct(1022, FRAME_H) }}
          >
            {t.mission.danceForAllAges}
          </p>
        </div>
      </div>
    </section>
  );
}
