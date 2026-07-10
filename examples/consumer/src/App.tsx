import { useState } from "react";
import {
  Badge,
  Button,
  Lozenge,
  TextArea,
  TextField,
  ToastProvider,
  useToast,
} from "@chanho/react";
import { palette } from "@chanho/tokens";

function Demo() {
  const toast = useToast();
  return (
    <main style={{ maxWidth: 480, margin: "40px auto", display: "grid", gap: 16 }}>
      <h1 style={{ fontFamily: "var(--chanho-font-family-sans)" }}>
        consumer check <Badge appearance="brand">0.1.0</Badge>
      </h1>
      <p>
        브랜드 컬러 <code>{palette.blue[500]}</code> <Lozenge appearance="success">설치 성공</Lozenge>
      </p>
      <TextField label="이메일" description="배포 산출물로 렌더링됨" />
      <TextArea label="TextArea 스모크" description="0.2.0 tarball 검증" />
      <Button onClick={() => toast({ title: "동작 확인", appearance: "success" })}>
        토스트 발생
      </Button>
    </main>
  );
}

export function App() {
  const [dark, setDark] = useState(false);
  return (
    <ToastProvider>
      <div
        style={{
          minHeight: "100vh",
          background: "var(--chanho-color-background-default)",
          color: "var(--chanho-color-text-default)",
        }}
      >
        <Button
          variant="subtle"
          onClick={() => {
            const next = !dark;
            setDark(next);
            document.documentElement.dataset.theme = next ? "dark" : "light";
          }}
        >
          {dark ? "라이트로" : "다크로"}
        </Button>
        <Demo />
      </div>
    </ToastProvider>
  );
}
