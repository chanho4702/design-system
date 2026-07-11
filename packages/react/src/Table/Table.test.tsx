import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Table } from "./Table";
import type { TableColumn } from "./Table";

interface Row {
  id: string;
  name: string;
  age: number;
}

const columns: TableColumn<Row>[] = [
  { key: "name", header: "이름", sortable: true },
  { key: "age", header: "나이", align: "right" },
];

const rows: Row[] = [
  { id: "1", name: "김철수", age: 30 },
  { id: "2", name: "이영희", age: 25 },
];

describe("Table", () => {
  it("헤더와 셀 값을 렌더링한다", () => {
    render(<Table aria-label="사용자" columns={columns} rows={rows} />);
    expect(screen.getByText("이름")).toBeInTheDocument();
    expect(screen.getByText("나이")).toBeInTheDocument();
    expect(screen.getByText("김철수")).toBeInTheDocument();
    expect(screen.getByText("25")).toBeInTheDocument();
  });

  it("aria-label로 테이블을 찾을 수 있다", () => {
    render(<Table aria-label="사용자" columns={columns} rows={rows} />);
    expect(screen.getByRole("table", { name: "사용자" })).toBeInTheDocument();
  });

  it("render 함수가 있으면 커스텀 셀을 렌더링한다", () => {
    const cols: TableColumn<Row>[] = [
      { key: "name", header: "이름", render: (row) => <em>{row.name}님</em> },
    ];
    render(<Table aria-label="사용자" columns={cols} rows={rows} />);
    expect(screen.getByText("김철수님")).toBeInTheDocument();
  });

  it("정렬 가능한 헤더 클릭 시 onSort가 해당 키로 호출된다", async () => {
    const onSort = vi.fn();
    render(<Table aria-label="사용자" columns={columns} rows={rows} onSort={onSort} />);
    await userEvent.click(screen.getByRole("button", { name: /이름/ }));
    expect(onSort).toHaveBeenCalledWith("name");
  });

  it("정렬 중인 열에 aria-sort가 적용된다", () => {
    render(
      <Table
        aria-label="사용자"
        columns={columns}
        rows={rows}
        sortKey="name"
        sortDirection="asc"
      />,
    );
    expect(screen.getAllByRole("columnheader")[0]).toHaveAttribute("aria-sort", "ascending");
  });

  it("행 클릭 시 onRowClick이 해당 행으로 호출된다", async () => {
    const onRowClick = vi.fn();
    render(<Table aria-label="사용자" columns={columns} rows={rows} onRowClick={onRowClick} />);
    await userEvent.click(screen.getByText("이영희"));
    expect(onRowClick).toHaveBeenCalledWith(rows[1]);
  });

  it("소비자 className이 루트 래퍼에 병합된다", () => {
    const { container } = render(
      <Table aria-label="사용자" columns={columns} rows={rows} className="custom" />,
    );
    expect(container.firstChild).toHaveClass("custom");
  });
});
