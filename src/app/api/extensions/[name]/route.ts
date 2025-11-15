import { NextRequest, NextResponse } from 'next/server';
import { Prisma, PrismaClient } from '@prisma/client';
import { ApiResponse } from '../route';
const prisma = new PrismaClient();

// DELETE /api/extensions/[name] - 확장자 삭제
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ name: string }> }
) {
  try {
    const { name } = await context.params;
    const extensionName = name.toLowerCase();

    // 존재 여부 확인 후 삭제
    const deletedExtension = await prisma.extensions.delete({
      where: {
        extension_name: extensionName,
      },
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      message: `'${extensionName}'가 제거되었습니다.`,
      data: deletedExtension,
    });
  } catch (error) {
    console.error('Extensions DELETE error:', error);

    // 데이터 없음 에러 처리
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return NextResponse.json<ApiResponse>(
          {
            success: false,
            message: '존재하지 않는 확장자입니다.',
          },
          { status: 404 }
        );
      }
    }

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        message: '확장자 삭제에 실패했습니다.',
      },
      { status: 500 }
    );
  }
}