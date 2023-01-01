import { useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import buildspaceLogo from '../assets/buildspace-logo.png';

const Home = () => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [apiOutput, setApiOutput] = useState('');

  const handleGenerate = async () => {
    if (!prompt) return;
    setIsGenerating(true);
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userInput: prompt }),
    });
    setIsGenerating(false);
    const data = await response.json();
    const { output } = data;
    setApiOutput(`${output.text}`);
  };

  return (
    <div className='root'>
      <Head>
        <title>GPT-3 Writer | buildspace</title>
      </Head>
      <div className='container'>
        <div className='header'>
          <div className='header-title'>
            <h1>ELI5 (Explain like I'm 5)</h1>
          </div>
          <div className='header-subtitle'>
            <h2>
              Write a concept you want explained to you in the simplest terms
            </h2>
          </div>
        </div>
      </div>
      <div className='prompt-container'>
        <textarea
          className='prompt-box'
          placeholder='start typing here..'
          onChange={(e) => setPrompt(e.target.value)}
          value={prompt}
        ></textarea>
        <div className='prompt-buttons'>
          <a className='generate-button' onClick={handleGenerate}>
            <div className='generate'>
              {isGenerating ? (
                <span className='loader'></span>
              ) : (
                <p>Generate</p>
              )}
            </div>
          </a>
        </div>
        {apiOutput && (
          <div className='output'>
            <div className='output-header-container'>
              <div className='output-header'>
                <h3>Output</h3>
              </div>
            </div>
            <div className='output-content'>
              <p>{apiOutput}</p>
            </div>
          </div>
        )}
      </div>
      <div>
        <div className='badge-container grow'>
          <div className='download'>
            Like this tool?{' '}
            <a
              href='https://github.com/neddinn/eli5-chrome-extension/archive/refs/heads/main.zip'
              download
            >
              {' '}
              Download the Extension
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
