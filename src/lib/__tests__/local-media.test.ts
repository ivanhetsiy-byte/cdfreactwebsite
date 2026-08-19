import { describe, expect, it } from "vitest";

import {
  parsePublicMediaPath,
  publicMediaPath,
  sanitizeFilename,
  sanitizeFolder,
  uniqueFilename,
} from "@/lib/local-media";

describe("sanitizeFilename", () => {
  it("lowercases and hyphenates a photo name", () => {
    expect(sanitizeFilename("My Photo.JPG")).toBe("my-photo.jpg");
  });

  it("uses only the basename", () => {
    expect(sanitizeFilename("../staff/Portrait (1).PNG")).toBe(
      "portrait-1.png",
    );
  });

  it("rejects missing or unknown extensions", () => {
    expect(sanitizeFilename("readme")).toBeNull();
    expect(sanitizeFilename("notes.txt")).toBeNull();
    expect(sanitizeFilename("..")).toBeNull();
  });
});

describe("sanitizeFolder", () => {
  it("treats blank as the images root", () => {
    expect(sanitizeFolder("  ")).toBe("");
  });

  it("allows nested gallery folders", () => {
    expect(sanitizeFolder("gallery/wdc-2026")).toBe("gallery/wdc-2026");
  });

  it("rejects traversal and empty segments", () => {
    expect(sanitizeFolder("../secret")).toBeNull();
    expect(sanitizeFolder("gallery/../staff")).toBeNull();
  });
});

describe("public media paths", () => {
  it("builds and parses a gallery path", () => {
    const publicPath = publicMediaPath("gallery", "leap.jpg");
    expect(publicPath).toBe("/images/gallery/leap.jpg");
    expect(parsePublicMediaPath(publicPath)).toEqual({
      folder: "gallery",
      filename: "leap.jpg",
    });
  });

  it("accepts an existing staff filename as-is", () => {
    expect(parsePublicMediaPath("/images/staff/mykhaylo-hetsiy.jpg")).toEqual({
      folder: "staff",
      filename: "mykhaylo-hetsiy.jpg",
    });
  });

  it("rejects paths outside /images", () => {
    expect(parsePublicMediaPath("/icons/cdf-black.svg")).toBeNull();
    expect(parsePublicMediaPath("/images/../package.json")).toBeNull();
  });
});

describe("uniqueFilename", () => {
  it("appends -2 when the name is taken", () => {
    expect(uniqueFilename("leap.jpg", new Set(["leap.jpg"]))).toBe(
      "leap-2.jpg",
    );
  });
});
