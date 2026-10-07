import { useState } from 'react';

interface PromptInputProps {
  onGenerate: (prompt: string) => void;
  isLoading: boolean;
}

const EXAMPLES = [
  'SaaS 관리자용 KPI 카드 3개. 매출, 활성 사용자, 전환율을 비교 가능한 형태로 표시',
  '설정 페이지의 알림 토글 패널. 이메일, 슬랙, 주간 리포트 옵션 포함',
  '검색 필터 바. 상태, 담당자, 날짜 범위를 선택하고 결과 수를 보여주는 UI',
  '온보딩 체크리스트. 5단계 진행률과 완료/대기 상태를 보여주는 카드',
  '요금제 비교 카드 3개. 추천 플랜을 강조하고 CTA 버튼 포함',
  '테이블 행 상세보기 패널. 선택한 고객의 기본 정보와 최근 활동 표시',
];

export function PromptInput({ onGenerate, isLoading }: PromptInputProps) {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && !isLoading) {
      onGenerate(prompt.trim());
    }
  };

  const handleExampleClick = (example: string) => {
    setPrompt(example);
  };

  return (
    <div className="prompt-section">
      <div className="prompt-heading">
        <h2>무엇을 만들까요?</h2>
        <p>만들고 싶은 UI를 설명하면 미리보기와 코드가 새 창으로 열립니다.</p>
      </div>
      <form onSubmit={handleSubmit} className="prompt-form">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="예: 고객 목록 테이블 위에 들어갈 검색 필터 바를 만들어줘. 상태, 담당자, 날짜 범위 필터가 필요해."
          className="control prompt-textarea"
          rows={4}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              handleSubmit(e);
            }
          }}
        />
        <div className="prompt-actions">
          <span className="prompt-hint">Ctrl + Enter로 바로 생성</span>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={!prompt.trim() || isLoading}
          >
            {isLoading ? (
              <span className="loading-spinner">생성 중...</span>
            ) : (
              '컴포넌트 생성'
            )}
          </button>
        </div>
      </form>
      <div className="examples">
        <span className="examples-label" id="examples-label">
          예시 프롬프트
        </span>
        <div className="listbox" role="group" aria-labelledby="examples-label">
          {EXAMPLES.map((example) => (
            <button
              key={example}
              className="example-row"
              onClick={() => handleExampleClick(example)}
              title={example}
              type="button"
            >
              <span className="doc-icon" aria-hidden="true" />
              <span className="example-text">{example}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
