import { LmlChromeLayout } from "@/components/lab/LmlChromeLayout";

export default function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <LmlChromeLayout theme="light">{children}</LmlChromeLayout>;
}
