import { useState, useEffect } from 'react'
import './App.css'
import ImageUpload from './components/ImageUpload'
import Login from './components/Login'

// Importar imagens PNG das amostras
import campo1Img from './assets/images/tiff images/Campo 1.png'
import campo2Img from './assets/images/tiff images/Campo 2.png'
import campo3Img from './assets/images/tiff images/Campo 3.png'
import campo3RImg from './assets/images/tiff images/Campo 3R.png'

// Imagens disponíveis para teste predefinidas
const presetImages = [
  { name: 'Campo 1', file: 'Campo 1.tif', preview: campo1Img },
  { name: 'Campo 2', file: 'Campo 2.tif', preview: campo2Img },
  { name: 'Campo 3', file: 'Campo 3.tif', preview: campo3Img },
  { name: 'Campo 3R', file: 'Campo 3R.tif', preview: campo3RImg },
]

function App() {
  const [authToken, setAuthToken] = useState(() => localStorage.getItem('nuclei_auth_token'))
  const [activeTab, setActiveTab] = useState('upload') // 'upload' ou 'presets'
  const [selectedPreset, setSelectedPreset] = useState(null)
  const [uploadedFile, setUploadedFile] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ||
    'https://nuclei-segmentation-ai-f7f3adfgb6ethuby.canadacentral-01.azurewebsites.net'

  const handleLoginSuccess = (token) => {
    localStorage.setItem('nuclei_auth_token', token)
    setAuthToken(token)
    setError(null)
  }

  const handleLogout = () => {
    localStorage.removeItem('nuclei_auth_token')
    setAuthToken(null)
    setResult(null)
    setError(null)
    setSelectedPreset(null)
    setUploadedFile(null)
  }

  // Verifica se o token salvo ainda é aceito pelo backend
  useEffect(() => {
    if (authToken) {
      fetch(`${API_BASE_URL}/api/verify-token`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })
        .then((res) => {
          if (res.status === 401) {
            handleLogout()
          }
        })
        .catch(() => {
          // Em caso de erro de rede, mantem o token local
        })
    }
  }, [authToken, API_BASE_URL])

  const getFullUrl = (urlPath) => {
    if (!urlPath) return ''
    if (urlPath.startsWith('http://') || urlPath.startsWith('https://')) {
      return urlPath
    }
    const cleanPath = urlPath.startsWith('/') ? urlPath : `/${urlPath}`
    return `${API_BASE_URL}${cleanPath}`
  }

  const handlePresetSelect = (imageName) => {
    setSelectedPreset(imageName)
    setResult(null)
    setError(null)
  }

  const handleFileSelect = (file) => {
    setUploadedFile(file)
    setResult(null)
    setError(null)
  }

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    setError(null)
  }

  const handleDownload = (url, filename) => {
    if (!url) return
    const fullUrl = getFullUrl(url)
    const link = document.createElement('a')
    link.href = fullUrl
    link.setAttribute('download', filename || 'download')
    link.target = '_blank'
    link.rel = 'noopener noreferrer'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleSubmit = async () => {
    if (activeTab === 'presets' && !selectedPreset) {
      setError('Por favor, selecione uma imagem de amostra primeiro.')
      return
    }

    if (activeTab === 'upload' && !uploadedFile) {
      setError('Por favor, faça o upload de uma imagem primeiro.')
      return
    }

    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      let response
      if (activeTab === 'presets') {
        response = await fetch(`${API_BASE_URL}/api/segment`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({ image_name: selectedPreset }),
        })
      } else {
        const formData = new FormData()
        formData.append('file', uploadedFile)

        response = await fetch(`${API_BASE_URL}/api/upload-and-segment`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
          body: formData,
        })
      }

      if (response.status === 401) {
        handleLogout()
        throw new Error('Sua sessão expirou ou a senha foi alterada. Faça login novamente.')
      }

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Erro ao processar a imagem')
      }

      setResult(data)
    } catch (err) {
      setError(err.message || 'Erro ao conectar com o servidor')
    } finally {
      setIsLoading(false)
    }
  }

  // Se o usuário não estiver autenticado, exibe a tela de login
  if (!authToken) {
    return <Login onLoginSuccess={handleLoginSuccess} apiBaseUrl={API_BASE_URL} />
  }

  const canSubmit =
    !isLoading &&
    ((activeTab === 'presets' && selectedPreset) || (activeTab === 'upload' && uploadedFile))

  return (
    <div className="app-container">
      <header className="header">
        <div className="header-top-bar">
          <span className="header-badge">Sessão Autenticada 🔒</span>
          <button
            type="button"
            className="logout-btn"
            onClick={handleLogout}
            title="Encerrar sessão"
          >
            Sair 🚪
          </button>
        </div>
        <h1>🔬 Nuclei-Segmentation with AI</h1>
        <p className="subtitle">
          Segmentação de núcleos em imagens microscópicas com Deep Learning (StarDist)
        </p>
      </header>

      <main className="main-content">
        <section className="image-selection">
          {/* Navegação por Abas */}
          <div className="tab-navigation">
            <button
              className={`tab-btn ${activeTab === 'upload' ? 'active' : ''}`}
              onClick={() => handleTabChange('upload')}
              type="button"
            >
              📤 Fazer Upload de Imagem
            </button>
            <button
              className={`tab-btn ${activeTab === 'presets' ? 'active' : ''}`}
              onClick={() => handleTabChange('presets')}
              type="button"
            >
              📁 Imagens de Teste
            </button>
          </div>

          {/* Conteúdo da Aba: Upload */}
          {activeTab === 'upload' && (
            <div className="tab-content">
              <ImageUpload
                selectedFile={uploadedFile}
                onFileSelect={handleFileSelect}
                disabled={isLoading}
              />
            </div>
          )}

          {/* Conteúdo da Aba: Imagens Predefinidas */}
          {activeTab === 'presets' && (
            <div className="tab-content">
              <div className="image-buttons">
                {presetImages.map((img) => (
                  <button
                    key={img.name}
                    className={`image-btn ${selectedPreset === img.name ? 'selected' : ''}`}
                    onClick={() => handlePresetSelect(img.name)}
                    disabled={isLoading}
                    type="button"
                  >
                    <img src={img.preview} alt={img.name} className="preview-image" />
                    <span className="image-name">{img.name}</span>
                  </button>
                ))}
              </div>

              {selectedPreset && (
                <p className="selected-info">
                  Amostra selecionada: <strong>{selectedPreset}</strong>
                </p>
              )}
            </div>
          )}

          {/* Botão de Envio */}
          <button
            className="submit-btn"
            onClick={handleSubmit}
            disabled={!canSubmit}
            type="button"
          >
            {isLoading ? 'Processando com IA...' : 'Executar Segmentação'}
          </button>
        </section>

        {isLoading && (
          <div className="loading-container">
            <div className="spinner"></div>
            <p className="loading-title">Analisando imagem com StarDist...</p>
            <p className="loading-hint">
              A segmentação em alta resolução pode levar entre 30 a 90 segundos. Por favor, aguarde.
            </p>
          </div>
        )}

        {error && (
          <div className="error-container">
            <span className="error-icon">⚠️</span>
            <p>{error}</p>
          </div>
        )}

        {result && result.success && (
          <section className="results-section">
            <div className="results-title-bar">
              <h2>Resultados da Análise</h2>
              {/* Barra de Ações / Downloads */}
              <div className="download-actions">
                {result.csv_download_url && (
                  <button
                    className="download-btn csv-btn"
                    onClick={() =>
                      handleDownload(
                        result.csv_download_url,
                        `${result.image_name || 'nuclei'}_metricas.csv`
                      )
                    }
                    title="Baixar planilha completa com todos os núcleos"
                    type="button"
                  >
                    📥 Baixar Dados (.CSV)
                  </button>
                )}
                {result.result_image_url && (
                  <button
                    className="download-btn"
                    onClick={() =>
                      handleDownload(
                        result.result_image_url,
                        `${result.image_name || 'segmentacao'}_resultado.png`
                      )
                    }
                    title="Baixar imagem com overlay de núcleos"
                    type="button"
                  >
                    🖼️ Baixar Segmentação
                  </button>
                )}
                {result.histogram_url && (
                  <button
                    className="download-btn"
                    onClick={() =>
                      handleDownload(
                        result.histogram_url,
                        `${result.image_name || 'histograma'}_areas.png`
                      )
                    }
                    title="Baixar gráfico do histograma"
                    type="button"
                  >
                    📊 Baixar Histograma
                  </button>
                )}
              </div>
            </div>

            <div className="result-header">
              <div className="nuclei-count">
                <span className="count-label">Núcleos Detectados</span>
                <span className="count-value">{result.nuclei_count}</span>
              </div>
              <div className="image-analyzed">
                <span className="analyzed-label">Imagem Analisada</span>
                <span className="analyzed-value">{result.image_name}</span>
              </div>
            </div>

            <div className="statistics-grid">
              <h3>📊 Morfometria Celular</h3>
              <div className="stats-cards">
                <div className="stat-card">
                  <span className="stat-label">Área Média</span>
                  <span className="stat-value">{result.statistics.mean_area.toFixed(2)} px²</span>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Área Mediana</span>
                  <span className="stat-value">{result.statistics.median_area.toFixed(2)} px²</span>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Área Mínima</span>
                  <span className="stat-value">{result.statistics.min_area} px²</span>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Área Máxima</span>
                  <span className="stat-value">{result.statistics.max_area} px²</span>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Desvio Padrão</span>
                  <span className="stat-value">{result.statistics.std_area.toFixed(2)}</span>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Diâmetro Médio</span>
                  <span className="stat-value">{result.statistics.mean_diameter.toFixed(2)} px</span>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Solidez Média</span>
                  <span className="stat-value">{result.statistics.mean_solidity.toFixed(4)}</span>
                </div>
              </div>
            </div>

            <div className="images-result">
              <div className="result-image-container">
                <h3>🖼️ Imagem Segmentada (Overlay)</h3>
                <img
                  src={getFullUrl(result.result_image_url)}
                  alt="Resultado da segmentação"
                  className="result-image"
                />
              </div>
              <div className="result-image-container">
                <h3>📈 Distribuição de Áreas (Histograma)</h3>
                <img
                  src={getFullUrl(result.histogram_url)}
                  alt="Histograma"
                  className="result-image"
                />
              </div>
            </div>
          </section>
        )}
      </main>

      <footer className="footer">
        <p>Nuclei-Segmentation with AI © 2026 • StarDist & Azure Cloud</p>
      </footer>
    </div>
  )
}

export default App
