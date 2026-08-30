import { AppHeader } from "@/components/layout/app-header";

export default function ResultLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <AppHeader />
      {children}
    </>
  );
}
