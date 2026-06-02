import { describe, expect, it } from "vitest";
import { resolvePublicFileUrlWithBase } from "./public-file-url";

describe("resolvePublicFileUrlWithBase", () => {
  it("resolves root-relative uploaded file URLs against the API base URL", () => {
    expect(
      resolvePublicFileUrlWithBase(
        "/uploads/avatar.png",
        "https://api.multica.ai/",
      ),
    ).toBe("https://api.multica.ai/uploads/avatar.png");
  });

  it("keeps absolute and local image URLs unchanged", () => {
    expect(
      resolvePublicFileUrlWithBase(
        "https://cdn.example.com/avatar.png",
        "https://api.multica.ai",
      ),
    ).toBe("https://cdn.example.com/avatar.png");
    expect(
      resolvePublicFileUrlWithBase(
        "file:///tmp/avatar.png",
        "https://api.multica.ai",
      ),
    ).toBe("file:///tmp/avatar.png");
  });

  it("returns null for empty avatar values", () => {
    expect(resolvePublicFileUrlWithBase("", "https://api.multica.ai")).toBeNull();
    expect(resolvePublicFileUrlWithBase(null, "https://api.multica.ai")).toBeNull();
  });
});
