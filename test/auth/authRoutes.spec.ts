import { describe, expect, it } from "vitest";

import { getCurrentRelativeUrl, getSafeReturnTo } from "@/auth/authRoutes";

describe("authentication routes", () => {
  it("preserves internal application destinations.", () => {
    expect(
      getSafeReturnTo({
        returnTo: "/projects/one/requirements?filter=open#details",
      }),
    ).toBe("/projects/one/requirements?filter=open#details");
  });

  it.each([
    undefined,
    null,
    {},
    { returnTo: "https://example.org" },
    { returnTo: "//example.org" },
    { returnTo: "/login" },
    { returnTo: "/login?returnTo=/projects/one" },
  ])("falls back to the workspace for unsafe login state.", (state) => {
    expect(getSafeReturnTo(state)).toBe("/");
  });

  it("builds a relative URL from the current router location.", () => {
    expect(
      getCurrentRelativeUrl({
        pathname: "/projects/one",
        search: "?tab=details",
        hash: "#owner",
      }),
    ).toBe("/projects/one?tab=details#owner");
  });
});
