import { ReactNode } from "react";

import { MarketingLayout } from "@/components/layout/marketing-layout";

export default function SiteGroupLayout({ children }: { children: ReactNode }) {
  return <MarketingLayout>{children}</MarketingLayout>;
}
