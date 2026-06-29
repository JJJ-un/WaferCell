import { screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

describe('Vitest 환경 테스트', () => {
  it('1 + 1은 2여야 합니다.', () => {
    expect(1 + 1).toBe(2);
  });

  it('DOM 렌더링 테스트', () => {
    const div = document.createElement('div');
    div.innerHTML = '<h1>Hello Vitest</h1>';
    document.body.appendChild(div);

    expect(screen.getByText('Hello Vitest')).toBeInTheDocument();
  });
});
