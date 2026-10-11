import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';

const config = [
  ...nextVitals,
  ...nextTypescript,
  {
    rules: {
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/refs': 'warn',
      'react-hooks/purity': 'warn',
      '@next/next/no-location-assign-relative-destination': 'off',
    },
  },
  { ignores: ['.next/**', '.next-*/**', 'node_modules/**', 'app/zoui.css'] },
];

export default config;
