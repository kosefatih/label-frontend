import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

export function LoadingButton({ isLoading, loadingText, children, disabled, ...props }) {
  return (
    <Button disabled={isLoading || disabled} {...props}>
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {loadingText || "Yükleniyor..."}
        </>
      ) : (
        children
      )}
    </Button>
  )
}
