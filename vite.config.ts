import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(() => {
  const repository = process.env.GITHUB_REPOSITORY
  const repositoryName = repository?.split('/')[1]
  const isGithubActions = process.env.GITHUB_ACTIONS === 'true'
  const base = isGithubActions && repositoryName ? `/${repositoryName}/` : '/'

  return {
    base,
    plugins: [react()],
    resolve: {
      dedupe: ['react', 'react-dom'],
    },
  }
})
