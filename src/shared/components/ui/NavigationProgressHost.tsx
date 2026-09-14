import { Suspense } from "react";
import { NavigationProgress } from "./NavigationProgress";

export function NavigationProgressHost() {
  return (
    <Suspense fallback={null}>
      <NavigationProgress />
    </Suspense>
  );
}
