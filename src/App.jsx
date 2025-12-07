import { useState } from 'react'
import './App.css'

// Importar imagens PNG
import campo1Img from './assets/images/tiff images/Campo 1.png'
import campo2Img from './assets/images/tiff images/Campo 2.png'
import campo3Img from './assets/images/tiff images/Campo 3.png'
import campo3RImg from './assets/images/tiff images/Campo 3R.png'

// Imagens disponíveis
const images = [
  { name: 'Campo 1', file: 'Campo 1.tif', preview: campo1Img },
  { name: 'Campo 2', file: 'Campo 2.tif', preview: campo2Img },
  { name: 'Campo 3', file: 'Campo 3.tif', preview: campo3Img },
  { name: 'Campo 3R', file: 'Campo 3R.tif', preview: campo3RImg },
]

function App() {
  const [selectedImage, setSelectedImage] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const API_BASE_URL = 'https://nuclei-segmentation-ai-f7f3adfgb6ethuby.canadacentral-01.azurewebsites.net';

  const handleImageSelect = (imageName) => {
    setSelectedImage(imageName)
    setResult(null)
    setError(null)
  }

  const handleSubmit = async () => {
    if (!selectedImage) {
      setError('Por favor, selecione uma imagem primeiro.')
      return
    }

    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch(`${API_BASE_URL}/api/segment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image_name: selectedImage }),
      })

      if (!response.ok) {
        throw new Error('Erro ao processar a imagem')
      }

      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError(err.message || 'Erro ao conectar com o servidor')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="app-container">
      <header className="header">
        <h1>🔬 Nuclei-Segmentation with AI</h1>
        <p className="subtitle">Selecione uma imagem para análise de segmentação de núcleos</p>
      </header>

      <main className="main-content">
        <section className="image-selection">
          <h2>Selecione uma Imagem</h2>
          <div className="image-buttons">
            {images.map((img) => (
              <button
                key={img.name}
                className={`image-btn ${selectedImage === img.name ? 'selected' : ''}`}
                onClick={() => handleImageSelect(img.name)}
                disabled={isLoading}
              >
                <img src={img.preview} alt={img.name} className="preview-image" />
                <span className="image-name">{img.name}</span>
              </button>
            ))}
          </div>

          {selectedImage && (
            <p className="selected-info">
              Imagem selecionada: <strong>{selectedImage}</strong>
            </p>
          )}

          <button
            className="submit-btn"
            onClick={handleSubmit}
            disabled={!selectedImage || isLoading}
          >
            {isLoading ? 'Processando...' : 'Enviar para Análise'}
          </button>
        </section>

        {isLoading && (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Processando imagem...</p>
            <p className="loading-hint">Isso pode levar alguns segundos</p>
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
            <h2>Resultados da Análise</h2>
            
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
              <h3>📊 Estatísticas</h3>
              <div className="stats-cards">
                <div className="stat-card">
                  <span className="stat-label">Área Média</span>
                  <span className="stat-value">{result.statistics.mean_area.toFixed(2)}</span>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Área Mediana</span>
                  <span className="stat-value">{result.statistics.median_area.toFixed(2)}</span>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Área Mínima</span>
                  <span className="stat-value">{result.statistics.min_area}</span>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Área Máxima</span>
                  <span className="stat-value">{result.statistics.max_area}</span>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Desvio Padrão</span>
                  <span className="stat-value">{result.statistics.std_area.toFixed(2)}</span>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Diâmetro Médio</span>
                  <span className="stat-value">{result.statistics.mean_diameter.toFixed(2)}</span>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Solidez Média</span>
                  <span className="stat-value">{result.statistics.mean_solidity.toFixed(4)}</span>
                </div>
              </div>
            </div>

            <div className="images-result">
              <div className="result-image-container">
                <h3>🖼️ Imagem Segmentada</h3>
                <img
                  src={`${API_BASE_URL}${result.result_image_url}`}
                  alt="Resultado da segmentação"
                  className="result-image"
                />
              </div>
              <div className="result-image-container">
                <h3>📈 Histograma</h3>
                <img
                  src={`${API_BASE_URL}${result.histogram_url}`}
                  alt="Histograma"
                  className="result-image"
                />
              </div>
            </div>
          </section>
        )}
      </main>

      <footer className="footer">
        <p>Nuclei-Segmentation with AI © 2024</p>
      </footer>
    </div>
  )
}

export default App
