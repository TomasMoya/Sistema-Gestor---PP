import { describe, expect, it } from "vitest";
import { budgetTone } from "./budget";

describe("budgetTone", () => {
  it("success por debajo del 80 %", () => {
    expect(budgetTone(0)).toBe("success");
    expect(budgetTone(0.79)).toBe("success");
  });

  it("warning entre 80 % y 100 % (inclusive)", () => {
    expect(budgetTone(0.8)).toBe("warning");
    expect(budgetTone(0.82)).toBe("warning");
    expect(budgetTone(1)).toBe("warning");
  });

  it("danger por encima del 100 %", () => {
    expect(budgetTone(1.01)).toBe("danger");
    expect(budgetTone(2)).toBe("danger");
  });
});
