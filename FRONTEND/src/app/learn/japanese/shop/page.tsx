import { LearnAppShell } from "@/components/learn/LearnAppShell";
import { ShopContent } from "@/components/learn/ShopContent";

export default function ShopPage() {
  return (
    <LearnAppShell activeNav="shop">
      <ShopContent />
    </LearnAppShell>
  );
}
