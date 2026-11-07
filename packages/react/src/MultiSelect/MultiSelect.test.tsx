import { render, screen } from "@testing-library/react";
import { useState } from "react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { MultiSelect } from "./MultiSelect";

const OPTIONS = [
  { value: "todo", label: "할 일" },
  { value: "doing", label: "진행 중" },
  { value: "review", label: "검토 중", disabled: true },
  { value: "done", label: "완료" },
];

describe("MultiSelect", () => {
  it("라벨을 이름으로 가진 combobox이고, 열면 여러 개 고르는 listbox가 뜬다", async () => {
    render(<MultiSelect label="상태" options={OPTIONS} placeholder="전체" />);
    const trigger = screen.getByRole("combobox", { name: "상태" });
    expect(trigger).toHaveTextContent("전체");
    await userEvent.click(trigger);
    const list = screen.getByRole("listbox", { name: "상태" });
    expect(list).toHaveAttribute("aria-multiselectable", "true");
    expect(screen.getByRole("combobox", { name: "상태 검색" })).toHaveFocus();
  });

  it("클릭으로 여러 개를 켜고 끄며, 고를 때 닫히지 않는다", async () => {
    const onValueChange = vi.fn();
    render(<MultiSelect label="상태" options={OPTIONS} onValueChange={onValueChange} />);
    await userEvent.click(screen.getByRole("combobox", { name: "상태" }));
    await userEvent.click(screen.getByRole("option", { name: "완료" }));
    await userEvent.click(screen.getByRole("option", { name: "할 일" }));
    // 옵션 순서대로 정렬된다
    expect(onValueChange).toHaveBeenLastCalledWith(["todo", "done"]);
    expect(screen.getByRole("option", { name: "할 일" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("option", { name: "할 일" }));
    expect(onValueChange).toHaveBeenLastCalledWith(["done"]);
  });

  it("키보드: 화살표·Enter로 켜고, 비활성 항목은 건너뛴다", async () => {
    const onValueChange = vi.fn();
    render(<MultiSelect label="상태" options={OPTIONS} onValueChange={onValueChange} />);
    screen.getByRole("combobox", { name: "상태" }).focus();
    await userEvent.keyboard("{ArrowDown}");
    // 첫 항목(할 일)이 강조 → 진행 중 → (검토 중 건너뜀) 완료
    await userEvent.keyboard("{ArrowDown}{ArrowDown}{Enter}");
    expect(onValueChange).toHaveBeenLastCalledWith(["done"]);
  });

  it("검색으로 거르고, 선택 수와 전체 해제를 제공한다", async () => {
    const onValueChange = vi.fn();
    render(
      <MultiSelect label="상태" options={OPTIONS} defaultValue={["todo", "doing"]} onValueChange={onValueChange} />,
    );
    await userEvent.click(screen.getByRole("combobox", { name: "상태" }));
    expect(screen.getByText("2개 선택")).toBeInTheDocument();
    await userEvent.type(screen.getByRole("combobox", { name: "상태 검색" }), "완");
    expect(screen.getAllByRole("option").map((o) => o.textContent)).toEqual(["완료"]);
    await userEvent.click(screen.getByRole("button", { name: "전체 해제" }));
    expect(onValueChange).toHaveBeenLastCalledWith([]);
    expect(screen.getByRole("button", { name: "전체 해제" })).toBeDisabled();
  });

  it("트리거는 maxChips개까지 칩으로, 나머지는 +N, 전체 목록은 설명으로 알린다", () => {
    render(<MultiSelect label="상태" options={OPTIONS} defaultValue={["todo", "doing", "done"]} maxChips={2} />);
    const trigger = screen.getByRole("combobox", { name: "상태" });
    expect(trigger).toHaveTextContent("+1");
    expect(trigger).toHaveAccessibleDescription("3개 선택: 할 일, 진행 중, 완료");
  });

  it("searchable=false면 목록이 포커스를 받고 Space로 켠다", async () => {
    const onValueChange = vi.fn();
    render(<MultiSelect label="상태" options={OPTIONS} searchable={false} onValueChange={onValueChange} />);
    await userEvent.click(screen.getByRole("combobox", { name: "상태" }));
    expect(screen.getByRole("listbox", { name: "상태" })).toHaveFocus();
    await userEvent.keyboard("[Space]");
    expect(onValueChange).toHaveBeenLastCalledWith(["todo"]);
  });

  it("Esc로 닫히고 포커스가 트리거로 돌아온다", async () => {
    render(<MultiSelect label="상태" options={OPTIONS} />);
    const trigger = screen.getByRole("combobox", { name: "상태" });
    await userEvent.click(trigger);
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("disabled면 트리거가 비활성이다", () => {
    render(<MultiSelect label="상태" options={OPTIONS} disabled />);
    expect(screen.getByRole("combobox", { name: "상태" })).toBeDisabled();
  });

  describe("비동기 후보(onSearchChange)", () => {
    const ALL = ["frontend", "backend", "infra", "front-office"];

    /** 검색어마다 서버가 거른 후보를 돌려주는 흉내 — 실제 화면처럼 options를 바꿔 끼운다 */
    function AsyncHarness(props: { creatable?: boolean; onValueChange?: (v: string[]) => void; loading?: boolean }) {
      const [opts, setOpts] = useState(ALL.map((l) => ({ value: l, label: l })));
      return (
        <MultiSelect
          label="라벨"
          options={opts}
          creatable={props.creatable}
          loading={props.loading}
          onValueChange={props.onValueChange}
          onSearchChange={(q) => setOpts(ALL.filter((l) => l.startsWith(q)).map((l) => ({ value: l, label: l })))}
        />
      );
    }

    it("검색어를 알리고, 후보가 바뀌어도 고른 값은 칩으로 남으며 값은 고른 순서다", async () => {
      const onValueChange = vi.fn();
      render(<AsyncHarness onValueChange={onValueChange} />);
      await userEvent.click(screen.getByRole("combobox", { name: "라벨" }));
      await userEvent.click(screen.getByRole("option", { name: "infra" }));
      const search = screen.getByRole("combobox", { name: "라벨 검색" });
      await userEvent.type(search, "fr");
      expect(screen.getAllByRole("option").map((o) => o.textContent)).toEqual(["frontend", "front-office"]);
      // 후보가 바뀐 뒤 Enter는 첫 후보를 고른다
      await userEvent.keyboard("{Enter}");
      expect(onValueChange).toHaveBeenLastCalledWith(["infra", "frontend"]);
      expect(screen.getByRole("combobox", { name: "라벨" })).toHaveAccessibleDescription("2개 선택: infra, frontend");
    });

    it("닫았다 다시 열면 빈 검색을 알려 지난 검색어의 후보가 남지 않는다", async () => {
      render(<AsyncHarness />);
      const trigger = screen.getByRole("combobox", { name: "라벨" });
      await userEvent.click(trigger);
      await userEvent.type(screen.getByRole("combobox", { name: "라벨 검색" }), "inf");
      expect(screen.getAllByRole("option")).toHaveLength(1);
      await userEvent.keyboard("{Escape}");
      await userEvent.click(trigger);
      expect(screen.getByRole("combobox", { name: "라벨 검색" })).toHaveValue("");
      expect(screen.getAllByRole("option")).toHaveLength(ALL.length);
      // 키보드(↓)로 다시 열어도 같다
      await userEvent.type(screen.getByRole("combobox", { name: "라벨 검색" }), "inf");
      await userEvent.keyboard("{Escape}");
      expect(trigger).toHaveFocus();
      await userEvent.keyboard("{ArrowDown}");
      expect(screen.getAllByRole("option")).toHaveLength(ALL.length);
    });

    it("후보 순서가 바뀌면 Enter는 새 첫 후보를 고르고, 기억한 선택과 같은 라벨은 추가로 띄우지 않는다", async () => {
      const onValueChange = vi.fn();
      function Reorder() {
        const [opts, setOpts] = useState([
          { value: "a", label: "Alice" },
          { value: "b", label: "Bob" },
        ]);
        return (
          <MultiSelect
            label="사람"
            options={opts}
            creatable
            onValueChange={onValueChange}
            onSearchChange={(q) =>
              setOpts(
                q === "" || q === "B"
                  ? [{ value: "a", label: "Alice" }, { value: "b", label: "Bob" }]
                  : q === "A"
                    ? [{ value: "b", label: "Bob" }, { value: "a", label: "Alice" }]
                    : [],
              )
            }
          />
        );
      }
      render(<Reorder />);
      await userEvent.click(screen.getByRole("combobox", { name: "사람" }));
      const search = screen.getByRole("combobox", { name: "사람 검색" });
      // 'A' 입력 순간엔 지난 후보 [Alice, Bob] 중 Alice가 강조되지만, 서버가 [Bob, Alice]로 돌려주면 강조는 새 첫 후보 Bob이다
      await userEvent.type(search, "A");
      await userEvent.keyboard("{Enter}");
      expect(onValueChange).toHaveBeenLastCalledWith(["b"]);
      // 서버가 같은 후보를 그대로 돌려줘도('B' → [Alice, Bob]) 지난 후보로 고른 강조(Bob)가 아니라 첫 후보다
      await userEvent.clear(search);
      await userEvent.type(search, "B");
      await userEvent.keyboard("{Enter}");
      expect(onValueChange).toHaveBeenLastCalledWith(["b", "a"]);
      await userEvent.click(screen.getByRole("option", { name: "Alice" }));
      expect(onValueChange).toHaveBeenLastCalledWith(["b"]);
      // Alice를 고른 뒤 후보에서 사라져도 "Alice" 검색은 추가 행이 아니라 그 선택을 보인다
      await userEvent.clear(search);
      await userEvent.click(screen.getByRole("option", { name: "Alice" }));
      await userEvent.type(search, "Alice");
      expect(screen.queryByRole("option", { name: '"Alice" 추가' })).not.toBeInTheDocument();
      expect(screen.getByRole("option", { name: "Alice" })).toHaveAttribute("aria-selected", "true");
    });

    it("loading이면 빈 목록 문구 대신 불러오는 중을 알린다", async () => {
      render(<AsyncHarness loading />);
      await userEvent.click(screen.getByRole("combobox", { name: "라벨" }));
      expect(screen.getByRole("status")).toHaveTextContent("불러오는 중…");
      // 받는 중에는 (지난 검색어의) 후보를 고를 수 없다
      expect(screen.queryAllByRole("option")).toHaveLength(0);
    });

    it("creatable이면 후보에 없는 검색어를 추가 항목으로 고를 수 있고, 같은 이름이 있으면 추가 항목이 없다", async () => {
      const onValueChange = vi.fn();
      render(<AsyncHarness creatable onValueChange={onValueChange} />);
      await userEvent.click(screen.getByRole("combobox", { name: "라벨" }));
      const search = screen.getByRole("combobox", { name: "라벨 검색" });
      await userEvent.type(search, "infra");
      expect(screen.queryByRole("option", { name: '"infra" 추가' })).not.toBeInTheDocument();
      await userEvent.clear(search);
      await userEvent.type(search, "새라벨");
      await userEvent.click(screen.getByRole("option", { name: '"새라벨" 추가' }));
      expect(onValueChange).toHaveBeenLastCalledWith(["새라벨"]);
      expect(screen.getByRole("combobox", { name: "라벨" })).toHaveAccessibleDescription("1개 선택: 새라벨");
      // 추가한 값은 더 이상 "추가" 행이 아니라 선택된 항목으로 보인다
      expect(screen.queryByRole("option", { name: '"새라벨" 추가' })).not.toBeInTheDocument();
      expect(screen.getByRole("option", { name: "새라벨" })).toHaveAttribute("aria-selected", "true");
    });
  });

  it("creatable이 아닌 정적 목록은 options에 없는 값을 선택으로 보지 않는다(예전 동작)", async () => {
    const onValueChange = vi.fn();
    render(<MultiSelect label="상태" options={OPTIONS} defaultValue={["gone", "done"]} onValueChange={onValueChange} />);
    expect(screen.getByRole("combobox", { name: "상태" })).toHaveAccessibleDescription("1개 선택: 완료");
    await userEvent.click(screen.getByRole("combobox", { name: "상태" }));
    await userEvent.click(screen.getByRole("option", { name: "할 일" }));
    expect(onValueChange).toHaveBeenLastCalledWith(["todo", "done"]);
  });

  it("정적 목록에서도 creatable 값은 옵션 순서 뒤에 남는다", async () => {
    const onValueChange = vi.fn();
    render(<MultiSelect label="상태" options={OPTIONS} creatable defaultValue={["done"]} onValueChange={onValueChange} />);
    await userEvent.click(screen.getByRole("combobox", { name: "상태" }));
    await userEvent.type(screen.getByRole("combobox", { name: "상태 검색" }), "보류");
    await userEvent.click(screen.getByRole("option", { name: '"보류" 추가' }));
    await userEvent.clear(screen.getByRole("combobox", { name: "상태 검색" }));
    await userEvent.click(screen.getByRole("option", { name: "할 일" }));
    expect(onValueChange).toHaveBeenLastCalledWith(["todo", "done", "보류"]);
  });
});
