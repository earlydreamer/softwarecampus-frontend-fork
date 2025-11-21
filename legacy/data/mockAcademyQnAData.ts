import { AcademyQnA } from '../types';

export const mockAcademyQnAs: Record<number, AcademyQnA[]> = {
  1: [ // 한국소프트웨어인재개발원
    {
      id: 1,
      academyId: 1,
      question: '비전공자도 수강 가능한가요?',
      answer: '네, 가능합니다. 저희 교육과정은 비전공자도 쉽게 따라올 수 있도록 기초부터 차근차근 진행됩니다. 실제로 수강생의 약 40%가 비전공자이며, 높은 취업률을 보이고 있습니다.',
      author: {
        id: 101,
        name: '김철수',
        avatar: undefined
      },
      createdAt: '2025-01-15T10:30:00Z',
      updatedAt: '2025-01-15T14:20:00Z',
      answeredAt: '2025-01-15T14:20:00Z'
    },
    {
      id: 2,
      academyId: 1,
      question: '수료 후 취업 지원은 어떻게 이루어지나요?',
      answer: '수료 후 6개월간 취업 지원 서비스를 제공합니다. 이력서 첨삭, 모의 면접, 기업 매칭 등 체계적인 취업 지원이 이루어지며, 취업 성공 시까지 지속적으로 케어해 드립니다.',
      author: {
        id: 102,
        name: '이영희',
        avatar: undefined
      },
      createdAt: '2025-01-20T09:15:00Z',
      updatedAt: '2025-01-20T16:45:00Z',
      answeredAt: '2025-01-20T16:45:00Z'
    },
    {
      id: 3,
      academyId: 1,
      question: '교육 시간은 어떻게 되나요?',
      author: {
        id: 103,
        name: '박민수',
        avatar: undefined
      },
      createdAt: '2025-01-22T11:00:00Z',
      updatedAt: '2025-01-22T11:00:00Z'
    }
  ],
  2: [ // 멋쟁이사자처럼
    {
      id: 4,
      academyId: 2,
      question: '프로젝트 중심 교육인가요?',
      answer: '네, 저희는 실무 프로젝트 중심의 교육을 진행합니다. 이론 학습 후 바로 프로젝트에 적용하며, 총 3개의 팀 프로젝트를 완성하게 됩니다.',
      author: {
        id: 104,
        name: '정수진',
        avatar: undefined
      },
      createdAt: '2025-01-18T13:20:00Z',
      updatedAt: '2025-01-18T17:30:00Z',
      answeredAt: '2025-01-18T17:30:00Z'
    }
  ],
  3: [ // 팀스파르타
    {
      id: 5,
      academyId: 3,
      question: '온라인 과정의 경우 질문은 어떻게 하나요?',
      answer: '슬랙(Slack) 채널을 통해 24시간 질문이 가능하며, 튜터가 실시간으로 답변드립니다. 또한 주 2회 온라인 멘토링 세션이 진행됩니다.',
      author: {
        id: 105,
        name: '최지훈',
        avatar: undefined
      },
      createdAt: '2025-01-25T10:00:00Z',
      updatedAt: '2025-01-25T11:30:00Z',
      answeredAt: '2025-01-25T11:30:00Z'
    }
  ]
};
