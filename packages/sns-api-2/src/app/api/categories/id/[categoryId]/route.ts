import { prisma } from '@/lib/prisma'
import { getPagination, getPaginationSrc } from '@/lib/util/pagination'

export const GET = async (
  request: Request,
  { params }: { params: { categoryId: string } },
) => {
  const { searchParams } = new URL(request.url)
  const page = Number(searchParams.get('page') || '1')
  const take = Number(searchParams.get('take') || '10')
  if (Number.isNaN(page) || Number.isNaN(take)) {
    return Response.json({ message: 'Invalid Params' }, { status: 400 })
  }
  const { skip, currentPage } = getPaginationSrc({ page, take })
  const category = await prisma.category.findUnique({
    where: { id: params.categoryId },
    include: {
      photos: { take, skip, orderBy: { createdAt: 'desc' } },
      _count: { select: { photos: true } },
    },
  })
  if (!category) {
    return Response.json({ message: 'Not Found' }, { status: 404 })
  }
  console.log(
    `GET: /api/categories/${params.categoryId} ${new Date().toISOString()}`,
  )
  return Response.json({
    category: category,
    ...getPagination({
      take,
      skip,
      currentPage,
      hitCount: category?._count.photos,
    }),
  })
}
