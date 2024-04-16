import { prisma } from '@/lib/prisma'
import { getPagination, getPaginationSrc } from '@/lib/util/pagination'
import type { NextRequest } from 'next/server'

export const GET = async (request: NextRequest) => {
  const { searchParams } = new URL(request.url)
  const page = Number(searchParams.get('page') || '1')
  const take = Number(searchParams.get('take') || '10')
  const authorId = searchParams.get('authorId')
  if (Number.isNaN(page) || Number.isNaN(take)) {
    return Response.json({ message: 'Invalid Params' }, { status: 4000 })
  }
  const { skip, currentPage } = getPaginationSrc({ page, take })
  // FYI: https://github.com/prisma/prisma/discussions/3087#discussioncomment-39983
  const [hitCount, photos] = await Promise.all([
    prisma.photo.count({ ...(authorId && { where: { authorId } }) }),
    prisma.photo.findMany({
      ...(authorId && { where: { authorId } }),
      take,
      skip,
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { likes: true } } },
    }),
  ])
  console.log(
    `GET: /api/photos?${searchParams.toString()} ${new Date().toISOString()}`,
  )
  return Response.json({
    photos: photos.map(({ _count, ...photo }) => ({
      ...photo,
      likedCount: _count.likes,
    })),
    ...getPagination({
      take,
      skip,
      currentPage,
      hitCount,
    }),
  })
}

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json()
    const photo = await prisma.photo.create({
      data: {
        title: body.title,
        description: body.description,
        imageUrl: body.imageUrl,
        authorId: body.userId,
        categoryId: body.categoryId,
      },
    })
    return Response.json({ photo }, { status: 201 })
  } catch (err) {
    return Response.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}
