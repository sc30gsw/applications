import { prisma } from '@/lib/prisma'

export const GET = async () => {
  // ★: Category テーブルのレコードを全て取得する
  const categories = await prisma.category.findMany({
    include: { _count: { select: { photos: true } } },
  })
  console.log(`GET: /api/categories ${new Date().toISOString()}`)
  return Response.json({
    categories: categories.map(({ _count, ...category }) => ({
      ...category,
      totalPhotoCount: _count.photos,
    })),
  })
}
