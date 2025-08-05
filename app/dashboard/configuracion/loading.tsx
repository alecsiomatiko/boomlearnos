import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex flex-col space-y-2">
        <Skeleton className="h-10 w-[250px]" />
        <Skeleton className="h-4 w-[350px]" />
      </div>

      <div className="space-y-6">
        <Skeleton className="h-10 w-full max-w-3xl" />

        <div className="space-y-6">
          <Skeleton className="h-[300px] w-full rounded-lg" />
          <Skeleton className="h-[150px] w-full rounded-lg" />
          <Skeleton className="h-[120px] w-full rounded-lg" />
        </div>
      </div>
    </div>
  )
}
