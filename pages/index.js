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
    setApiOutput('');
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userInput: prompt }),
    });
    if (!response.ok) {
      return;
    }
    setIsGenerating(false);
    const data = response.body;
    if (!data) {
      return;
    }
    const reader = data.getReader();
    const decoder = new TextDecoder();
    let done = false;

    while (!done) {
      const {value, done: readDone} = await reader.read()
      done = readDone
      const chunkValue = decoder.decode(value);
      setApiOutput((prev) => prev + chunkValue);
    }

  };

  const handleKeyDown = async (e) => {
    if (e.keyCode === 13 && !e.shiftKey) {
      e.preventDefault();
      await handleGenerate();
    }
  }

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
              Write a concept you want explained to you in the simplest terms. Literally, like you're 5.
            </h2>
          </div>
        </div>
      </div>
      <div className='prompt-container'>
        <textarea
          className='prompt-box'
          placeholder='start typing here..'
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
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
        {apiOutput && !isGenerating && (
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
