import { useCmsPage } from "@/hooks/useCmsPage";
import { ReactNode, useId } from "react";

interface CmsRendererProps {
  slug: string;
  fallback: ReactNode;
  className?: string;
}

const CmsRenderer = ({ slug, fallback, className }: CmsRendererProps) => {
  const { html, css, hasCmsContent, isLoading } = useCmsPage(slug);
  const scopeId = useId().replace(/:/g, "");

  if (isLoading) return <>{fallback}</>;
  if (!hasCmsContent) return <>{fallback}</>;

  return (
    <div className={className} id={`cms-${scopeId}`}>
      {css && (
        <style dangerouslySetInnerHTML={{ __html: css.replace(/body/g, `#cms-${scopeId}`) }} />
      )}
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
};

export default CmsRenderer;
