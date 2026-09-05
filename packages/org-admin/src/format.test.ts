import { describe, expect, it } from "vitest";
import { formatDate, formatDateTime, isValidEmail, memberEventLabel, splitEmails } from "./format";

describe("splitEmails", () => {
  it("쉼표·줄바꿈·공백이 섞인 붙여넣기를 주소 목록으로 나눈다", () => {
    expect(splitEmails("a@x.com, b@x.com\nc@x.com  d@x.com;e@x.com")).toEqual([
      "a@x.com",
      "b@x.com",
      "c@x.com",
      "d@x.com",
      "e@x.com",
    ]);
  });

  it("빈 입력은 빈 배열이다", () => {
    expect(splitEmails("   \n ")).toEqual([]);
  });
});

describe("isValidEmail", () => {
  it("점 있는 도메인만 통과시킨다", () => {
    expect(isValidEmail("a@x.com")).toBe(true);
    expect(isValidEmail("a@localhost")).toBe(false);
    expect(isValidEmail("not-an-email")).toBe(false);
    expect(isValidEmail("a b@x.com")).toBe(false);
  });
});

describe("formatDate", () => {
  it("값이 없거나 파싱할 수 없으면 Invalid Date 대신 -를 준다", () => {
    expect(formatDate(null)).toBe("-");
    expect(formatDate(undefined)).toBe("-");
    expect(formatDate("")).toBe("-");
    expect(formatDate("망가진 값")).toBe("-");
    expect(formatDateTime("망가진 값")).toBe("-");
  });

  it("ISO 문자열을 YYYY-MM-DD로 준다", () => {
    expect(formatDate("2026-09-05T01:02:03Z")).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(formatDateTime("2026-09-05T01:02:03Z")).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/);
  });
});

describe("memberEventLabel", () => {
  it("모르는 이벤트 종류는 원문을 그대로 보여 준다", () => {
    expect(memberEventLabel("APPROVED")).toBe("승인됨");
    expect(memberEventLabel("SOMETHING_NEW")).toBe("SOMETHING_NEW");
  });
});
