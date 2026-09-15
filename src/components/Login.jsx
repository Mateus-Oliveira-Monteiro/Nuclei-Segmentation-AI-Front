import { useState } from 'react'

export default function Login({ onLoginSuccess, apiBaseUrl }) {
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!password.trim()) {
      setError('Por favor, digite sua senha de acesso.')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`${apiBaseUrl}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Senha incorreta. Tente novamente.')
      }

      onLoginSuccess(data.token)
    } catch (err) {
      setError(err.message || 'Erro ao conectar ao servidor')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <div className="login-header">
          <div className="login-badge">🔬 ACESSO SEGURO</div>
          <h2>Nuclei-Segmentation AI</h2>
          <p className="login-subtitle">
            Ambiente restrito de segmentação e morfometria celular com StarDist.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <label htmlFor="password-input">Senha de Acesso</label>
            <div className="password-input-container">
              <input
                id="password-input"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite a senha de administrador..."
                autoFocus
                disabled={isLoading}
              />
              <button
                type="button"
                className="toggle-password-btn"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? 'Ocultar senha' : 'Ver senha'}
                tabIndex={-1}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          {error && (
            <div className="login-error">
              <span>⚠️</span> {error}
            </div>
          )}

          <button
            type="submit"
            className="login-submit-btn"
            disabled={isLoading || !password.trim()}
          >
            {isLoading ? 'Verificando senha...' : 'Entrar no Sistema →'}
          </button>
        </form>

        <div className="login-footer">
          <p>Protegido por autenticação criptográfica • StarDist AI</p>
        </div>
      </div>
    </div>
  )
}
