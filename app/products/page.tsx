
export default function ProductsPage({
  searchParams,
}: {
  searchParams: { category?: string; sort?: string }
}) {
  const category = searchParams.category || "all"
  const sort = searchParams.sort || "newest"

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold mb-6">Бүх бараа</h1>
    </div>
  )
}