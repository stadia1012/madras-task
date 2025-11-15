'use server'
import { NextRequest, NextResponse } from 'next/server';
import { Prisma, PrismaClient, extensions } from '@prisma/client';
const prisma = new PrismaClient();

// 타입 정의
export interface CreateExtensionRequest {
  extension_name: string;
}
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

// 최대 차단 개수
const maxLength = 200;
// 고정 확장자 목록
const fixedExtensions = ['bat', 'cmd', 'com', 'cpl', 'exe', 'scr', 'js'];

// GET /api/extensions - 전체 확장자 목록 조회
export async function GET() {
  try {
    const extensions = await prisma.extensions.findMany({
      orderBy: {
        extension_name: 'asc',
      },
    });

    return NextResponse.json<ApiResponse<extensions[]>>({
      success: true,
      message: '조회 성공',
      data: extensions,
    });
  } catch (error) {
    console.error('Extensions GET error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        message: '확장자 목록 조회에 실패했습니다.',
      },
      { status: 500 }
    );
  }
}

// POST /api/extensions - 확장자 추가
export async function POST(request: NextRequest) {
  let newExtName = ''; // 에러 처리용으로 스코프 밖에 선언
  
  try {
    const body: CreateExtensionRequest = await request.json();
    const { extension_name } = body;

    // 입력값 검증
    if (!extension_name || typeof extension_name !== 'string') {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: '확장자를 입력해주세요.',
        },
        { status: 400 }
      );
    }

    newExtName = extension_name.trim().toLowerCase();

    // 유효성 검증 (영문 + 숫자, 1-20자)
    const extRegex = /^[a-z0-9]{1,20}$/;
    if (!extRegex.test(newExtName)) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: '확장자는 영문과 숫자만 1-20자 이내로 입력해주세요.',
        },
        { status: 400 }
      );
    }

    // 커스텀 최대 개수 체크
    const totalCount = await prisma.extensions.count({
      where: {
        extension_name: {
          notIn: fixedExtensions
        }
      }
    });
    
    if (totalCount >= maxLength) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: `커스텀 확장자는 ${maxLength}개를 초과할 수 없습니다.`,
        },
        { status: 400 }
      );
    }

    // 확장자 추가
    const newExtension = await prisma.extensions.create({
      data: {
        extension_name: newExtName,
      },
    });

    return NextResponse.json<ApiResponse<extensions>>(
      {
        success: true,
        message: `'${newExtName}'가 등록되었습니다.`,
        data: newExtension,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Extensions POST error:', error);

    // 데이터 중복 에러 처리
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return NextResponse.json<ApiResponse>(
          {
            success: false,
            message: `'${newExtName}'는 이미 등록된 확장자입니다.`,
          },
          { status: 409 }
        );
      }
    }

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        message: '확장자 등록에 실패했습니다.',
      },
      { status: 500 }
    );
  }
}