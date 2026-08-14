import { describe, expect, it } from "vitest";
import { ApiError } from "@/lib/api-client";
import { getApiErrorMessage } from "@/lib/api-errors";

describe("getApiErrorMessage", () => {
  it("maps known API error codes", () => {
    const error = new ApiError(403, "SKILL_LOCKED");
    expect(getApiErrorMessage(error)).toBe(
      "This skill is locked. Complete the previous skill first.",
    );
  });

  it("falls back for unknown codes", () => {
    const error = new ApiError(400, "UNKNOWN_THING");
    expect(getApiErrorMessage(error)).toBe("unknown thing");
  });

  it("detects network fetch failures", () => {
    const error = new TypeError("Failed to fetch");
    expect(getApiErrorMessage(error)).toBe(
      "Cannot reach the server. Make sure the backend is running.",
    );
  });
});
