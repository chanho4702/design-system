import { describe, expect, it } from "vitest";
import { mailPath, normalizeBasePath } from "./paths";

describe("normalizeBasePath", () => {
  it("앞 슬래시를 보충하고 뒤 슬래시를 떼어 낸다", () => {
    expect(normalizeBasePath("admin/org")).toBe("/admin/org");
    expect(normalizeBasePath("/settings/org/")).toBe("/settings/org");
    expect(normalizeBasePath("  /admin/org//  ")).toBe("/admin/org");
  });

  it("빈 값은 빈 앞머리로 둔다(루트 마운트)", () => {
    expect(normalizeBasePath("")).toBe("");
    expect(normalizeBasePath("/")).toBe("");
  });
});

describe("mailPath", () => {
  it("정규화한 앞머리에 메일 설정 경로를 붙인다", () => {
    expect(mailPath("/admin/org")).toBe("/admin/org/mail");
    expect(mailPath("settings/org/")).toBe("/settings/org/mail");
    expect(mailPath("")).toBe("/mail");
  });
});
