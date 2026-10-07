import { useState, useEffect } from 'react';
import { PromptInput } from './components/PromptInput';
import { ComponentCard } from './components/ComponentCard';
import { Window } from './components/Window';
import { useComponentGenerator } from './hooks/useComponentGenerator';
import type { Provider } from './types';
import './App.css';

const PROVIDER_CONFIG = {
  anthropic: { label: 'Anthropic', placeholder: 'sk-ant-...' },
  google: { label: 'Google', placeholder: 'AIza...' },
} as const;

function App() {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [provider, setProvider] = useState<Provider>('google');
  const [envKeys, setEnvKeys] = useState<Record<Provider, boolean>>({
    anthropic: false,
    google: false,
  });
  const { components, isLoading, error, generate, removeComponent, clearAll } =
    useComponentGenerator();

  useEffect(() => {
    fetch('/api/config')
      .then((res) => res.json())
      .then((data) => setEnvKeys(data.envKeys))
      .catch(() => {});
  }, []);

  const hasEnvKey = envKeys[provider];

  const handleGenerate = (prompt: string) => {
    if (!apiKey.trim() && !hasEnvKey) {
      alert(`${PROVIDER_CONFIG[provider].label} API 키를 입력하거나 .env에 설정해주세요.`);
      return;
    }
    generate(prompt, apiKey || undefined, provider);
  };

  const handleProviderChange = (newProvider: Provider) => {
    setProvider(newProvider);
    setApiKey('');
  };

  const activeProvider = PROVIDER_CONFIG[provider].label;

  return (
    <div className="app">
      <header className="menubar">
        <div className="menubar-brand">
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            shapeRendering="crispEdges"
            aria-hidden="true"
          >
            <rect x="1" y="2" width="14" height="12" fill="#000" />
            <rect x="2" y="3" width="12" height="10" fill="#e8e8e8" />
            <rect x="3" y="4" width="10" height="1" fill="#000" />
            <rect x="3" y="6" width="10" height="1" fill="#000" />
            <rect x="2" y="8" width="12" height="1" fill="#000" />
            <rect x="3" y="9" width="10" height="3" fill="#ffc933" />
          </svg>
          <h1>컴포넌트 생성기</h1>
        </div>
        <div className="menubar-status" aria-label="현재 작업 상태">
          <span>AI 제공자 {activeProvider}</span>
          <span className="menubar-count">만든 컴포넌트 {components.length}개</span>
        </div>
      </header>

      <main className="desk">
        <div className="workspace">
          <Window title="새 컴포넌트">
            <PromptInput onGenerate={handleGenerate} isLoading={isLoading} />
          </Window>

          <Window title="실행 설정">
            <div className="field">
              <label htmlFor="provider">AI 제공자</label>
              <select
                id="provider"
                className="control control-select"
                value={provider}
                onChange={(e) => handleProviderChange(e.target.value as Provider)}
              >
                {Object.entries(PROVIDER_CONFIG).map(([key, { label }]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="api-key">API 키</label>
              <div className="key-row">
                <input
                  id="api-key"
                  className="control control-mono"
                  type={showKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={
                    hasEnvKey ? '서버 키 사용 중' : PROVIDER_CONFIG[provider].placeholder
                  }
                />
                <button className="btn" onClick={() => setShowKey(!showKey)} type="button">
                  {showKey ? '숨기기' : '보기'}
                </button>
              </div>
              <p className={`key-status ${hasEnvKey ? 'key-status--ready' : ''}`}>
                {hasEnvKey
                  ? '.env 키가 연결되어 있어요. 직접 입력하면 그 키를 우선 사용합니다.'
                  : '키를 직접 입력하거나 서버 환경변수에 설정하세요.'}
              </p>
            </div>
          </Window>
        </div>

        {error && (
          <div className="alert" role="alert">
            <span className="alert-icon" aria-hidden="true">
              !
            </span>
            <div>
              <p className="alert-title">생성하지 못했습니다</p>
              <p>{error}</p>
            </div>
          </div>
        )}

        {components.length > 0 && (
          <div className="results-bar">
            <h2>생성된 컴포넌트 {components.length}개</h2>
            <button className="btn btn-danger" onClick={clearAll}>
              전체 삭제
            </button>
          </div>
        )}

        {components.length === 0 && !isLoading && (
          <Window title="빈 폴더" className="window--open">
            <div className="empty-body">
              <svg
                width="96"
                height="78"
                viewBox="0 0 16 13"
                shapeRendering="crispEdges"
                aria-hidden="true"
              >
                <path d="M0 1h6v1h1v1h9v10H0z" fill="#000" />
                <path d="M1 2h4v1h1v1h9v8H1z" fill="#ffc933" />
                <path d="M1 6h14v1H1z" fill="#000" />
              </svg>
              <div>
                <h2>아직 만든 컴포넌트가 없어요</h2>
                <p>프롬프트를 입력하고 '컴포넌트 생성'을 누르면 결과가 새 창으로 열립니다.</p>
              </div>
            </div>
          </Window>
        )}

        {isLoading && (
          <Window title="생성 중" className="window--open">
            <div className="loading-body">
              <p className="loading-text">컴포넌트를 생성하고 있습니다</p>
              <div className="progress" role="progressbar" aria-label="생성 진행 중">
                <div className="progress-fill" />
              </div>
            </div>
          </Window>
        )}

        <div className="results-grid">
          {components.map((component) => (
            <ComponentCard
              key={component.id}
              component={component}
              onRemove={removeComponent}
              onRegenerate={handleGenerate}
              isLoading={isLoading}
            />
          ))}
        </div>
      </main>
    </div>
  );
}

export default App;
