import { useState } from 'react';
import type { GeneratedComponent } from '../types';
import { LivePreview } from './LivePreview';
import { CodeView } from './CodeView';
import { Window } from './Window';

interface ComponentCardProps {
  component: GeneratedComponent;
  onRemove: (id: string) => void;
  onRegenerate: (prompt: string) => void;
  isLoading: boolean;
}

type Tab = 'preview' | 'code';

export function ComponentCard({ component, onRemove, onRegenerate, isLoading }: ComponentCardProps) {
  const [activeTab, setActiveTab] = useState<Tab>('preview');
  const [previewKey, setPreviewKey] = useState(0);
  const createdAt = component.createdAt.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Window
      title={`컴포넌트 ${createdAt}`}
      className="window--open"
      flush
      onClose={() => onRemove(component.id)}
      closeLabel="이 컴포넌트 삭제"
    >
      <div className="card-toolbar">
        <p className="card-prompt">{component.prompt}</p>
        <div className="card-actions">
          <button className="btn" onClick={() => setPreviewKey((k) => k + 1)}>
            새로고침
          </button>
          <button
            className="btn"
            onClick={() => onRegenerate(component.prompt)}
            disabled={isLoading}
          >
            {isLoading ? '생성 중...' : '재생성'}
          </button>
        </div>
      </div>
      <div className="tab-strip" role="tablist">
        <button
          className={`tab ${activeTab === 'preview' ? 'tab--active' : ''}`}
          role="tab"
          aria-selected={activeTab === 'preview'}
          onClick={() => setActiveTab('preview')}
        >
          미리보기
        </button>
        <button
          className={`tab ${activeTab === 'code' ? 'tab--active' : ''}`}
          role="tab"
          aria-selected={activeTab === 'code'}
          onClick={() => setActiveTab('code')}
        >
          코드
        </button>
      </div>
      <div className="card-content" role="tabpanel">
        {activeTab === 'preview' ? (
          <LivePreview key={previewKey} code={component.code} />
        ) : (
          <CodeView code={component.code} />
        )}
      </div>
    </Window>
  );
}
