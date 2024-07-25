import React, { useState, useEffect } from 'react';
import './floatingButton.css';
import searchIcon from "./../assets/search.png"
import lightBulb from "./../assets/lightbulb.png"

const FloatingButton = () => {
  const [position, setPosition] = useState('left');
  const [dragging, setDragging] = useState(false);
  const [showTabs, setShowTabs] = useState(false);
  const [activeTab, setActiveTab] = useState('markdown');
  const [searchTerm, setSearchTerm] = useState('');
  const [buttonStyle, setButtonStyle] = useState({ left: '0' });

  useEffect(() => {
    const handleMouseUp = () => {
      setDragging(false);

      const pageWidth = document.documentElement.clientWidth;
      const buttonLeft = buttonStyle.left !== undefined ? parseInt(buttonStyle.left) : pageWidth - parseInt(buttonStyle.right);
      if (buttonLeft < pageWidth / 2) {
        setButtonStyle({ ...buttonStyle, left: '0', right: 'auto' });
        setPosition('left');
      } else {
        setButtonStyle({ ...buttonStyle, left: 'auto', right: '0' });
        setPosition('right');
      }
    };

    const handleMouseMove = (e) => {
      if (!dragging) return;

      const newStyle = { left: `${e.clientX}px`, top: `${e.clientY}px`, transform: 'none' };
      setButtonStyle(newStyle);
    };

    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [dragging, buttonStyle]);


  const syntax = {
    markdown: [
      { feature: 'Heading', syntax: '# H1 ; ## H2 ; ### H3', example: '# Heading 1' },
      { feature: 'Bold', syntax: '**bold text**', example: '**bold text**' },
      { feature: 'Italic', syntax: '*italic text*', example: '*italic text*' },
      { feature: 'Strikethrough', syntax: '~~strikethrough~~', example: '~~strikethrough~~' },
      { feature: 'Ordered List', syntax: '1. Item 1 `2. Item 2`', example: '1. Item 1\n2. Item 2' },
      { feature: 'Unordered List', syntax: '- Item 1 `- Item 2`', example: '- Item 1\n- Item 2' },
      { feature: 'Link', syntax: '[title](https://example.com)', example: '[title](https://example.com)' },
      { feature: 'Image', syntax: '![alt text](image.jpg)', example: '![alt text](image.jpg)' },
      { feature: 'Blockquote', syntax: '> blockquote', example: '> blockquote' },
      { feature: 'Note Alert', syntax: '> [!NOTE]', example: '> ![NOTE] This is a note'},
      { feature: 'Tip Alert', syntax: '> [!TIP]', example: '> ![TIP] This is a tip'},
      { feature: 'Important Alert', syntax: '> [!IMPORTANT]', example: '> ![IMPORTANT] This is a important'},
      { feature: 'Warning Alert', syntax: '> [!WARNING]', example: '> ![WARNING] This is a warning'},
      { feature: 'Caution Alert', syntax: '> [!CAUTION]', example: '> ![CAUTION] This is a caution'},
      { feature: 'Inline Code', syntax: '`code`', example: '`code`' },
      { feature: 'Code Block', syntax: '```\ncode block\n```', example: '```\ncode block\n```' },
      { feature: 'Horizontal Rule', syntax: '---', example: '---' },
      { feature: 'Table', syntax: '| Header | Header |\n|--------|--------|\n| Cell   | Cell   |', example: '| Header | Header |\n|--------|--------|\n| Cell   | Cell   |' },
    ],

    html: [
        { feature: 'Paragraph', syntax: '<p>Paragraph text</p>', example: '<p>Paragraph text</p>' },
        { feature: 'Heading', syntax: '<h1>Heading 1</h1> <h2>Heading 2</h2>', example: '<h1>Heading 1</h1><h2>Heading 2</h2>' },
        { feature: 'Bold', syntax: '<strong>bold text</strong>', example: '<strong>bold text</strong>' },
        { feature: 'Italic', syntax: '<em>italic text</em>', example: '<em>italic text</em>' },
        { feature: 'Strikethrough', syntax: '<s>strikethrough</s>', example: '<s>strikethrough</s>' },
        { feature: 'Ordered List', syntax: '<ol><li>Item 1</li><li>Item 2</li></ol>', example: '<ol><li>Item 1</li><li>Item 2</li></ol>' },
        { feature: 'Unordered List', syntax: '<ul><li>Item 1</li><li>Item 2</li></ul>', example: '<ul><li>Item 1</li><li>Item 2</li></ul>' },
        { feature: 'Link', syntax: '<a href="https://example.com">title</a>', example: '<a href="https://example.com">title</a>' },
        { feature: 'Image', syntax: '<img src="image.jpg" alt="alt text">', example: '<img src="image.jpg" alt="alt text">' },
        { feature: 'Table', syntax: '<table><tr><th>Header</th></tr><tr><td>Cell</td></tr></table>', example: '<table><tr><th>Header</th></tr><tr><td>Cell</td></tr></table>' },
      ],

    latex: [
      { feature: 'Inline Math', syntax: '$ math $', example: '$ a^2 + b^2 = c^2 $' },
      { feature: 'Display Math', syntax: '$$ math $$', example: '$$ \int_{a}^{b} x \, dx $$' },
      { feature: 'Fraction', syntax: '\\frac{a}{b}', example: '\\frac{1}{2}' },
      { feature: 'Square Root', syntax: '\\sqrt{a}', example: '\\sqrt{2}' },
      { feature: 'Exponent', syntax: 'a^{b}', example: 'x^{y}' },
      { feature: 'Subscript', syntax: 'a_{b}', example: 'x_{i}' },
      { feature: 'Integral', syntax: '\\int_{a}^{b} x \\, dx', example: '\\int_{0}^{1} x \\, dx' },
      { feature: 'Matrix', syntax: '\\begin{matrix} a & b \\\\ c & d \\end{matrix}', example: '\\begin{matrix} 1 & 2 \\\\ 3 & 4 \\end{matrix}' },
      { feature: 'Align Environment', syntax: '\\begin{align} a &= b \\\\ c &= d \\end{align}', example: '\\begin{align} x &= y \\\\ a &= b \\end{align}' },
      { feature: 'Greek Letters', syntax: '\\alpha \\beta \\gamma', example: '\\alpha \\beta \\gamma' },
      { feature: 'Text Formatting', syntax: '\\textbf{text} \\textit{text}', example: '\\textbf{bold} \\textit{italic}' },
      { feature: 'Equations', syntax: '\\begin{equation} E = mc^2 \\end{equation}', example: '\\begin{equation} E = mc^2 \\end{equation}' },
    ],
  };

  const filteredMarkdown = syntax.markdown.filter((item) =>
    item.feature.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.syntax.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredHtml = syntax.html.filter((item) =>
    item.feature.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.syntax.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredLatex = syntax.latex.filter((item) =>
    item.feature.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.syntax.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
    <div
      className={`floating-button ${position} ${dragging ? 'dragging' : ''} ${showTabs ? 'active' : ''}`}
      style={buttonStyle}
      onMouseDown={() => setDragging(true)}
      onClick={() => setShowTabs(!showTabs)}
    >
      <img src={lightBulb} alt="Quick Syntax Reference"/>
      <div className="tooltipp">Quick Syntax Reference</div>
    </div>

    <div className={`tab-container ${position} ${showTabs ? 'show' : ''}`}>
        <div className="tab-header">
          <h2>Quick Syntax Reference</h2>
          <span className="close" onClick={() => setShowTabs(false)}>&times;</span>
        </div>
        <div className="tab-buttons">
          <button
            className={`tab-button ${activeTab === 'markdown' ? 'active' : ''}`}
            onClick={() => setActiveTab('markdown')}
          >
            Markdown
          </button>
          <button
            className={`tab-button ${activeTab === 'html' ? 'active' : ''}`}
            onClick={() => setActiveTab('html')}
          >
            HTML
          </button>
          <button
            className={`tab-button ${activeTab === 'latex' ? 'active' : ''}`}
            onClick={() => setActiveTab('latex')}
          >
            LaTeX
          </button>
        </div>
        <div className="search-container">
            <input 
                type="text" 
                placeholder="Search..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)} 
                className="search-input syntax"
            />
            <img src={searchIcon} alt="Search Icon"></img>
        </div>
        <div className={`tab-content ${activeTab === 'markdown' ? 'active' : ''}`}>
          <h2>Markdown Syntax</h2>
          <ul className="syntax-list">
            {filteredMarkdown.map((item, index) => (
              <li key={index}><strong>{item.feature}</strong>: {item.syntax}</li>
            ))}
          </ul>
        </div>
        <div className={`tab-content ${activeTab === 'html' ? 'active' : ''}`}>
          <h2>HTML Syntax</h2>
          <ul className="syntax-list">
            {filteredHtml.map((item, index) => (
              <li key={index}><strong>{item.feature}</strong>: {item.syntax}</li>
            ))}
          </ul>
        </div>
        <div className={`tab-content ${activeTab === 'latex' ? 'active' : ''}`}>
          <h2>LaTeX Syntax</h2>
          <ul className="syntax-list">
          {filteredLatex.map((item, index) => (
              <li key={index}><strong>{item.feature}</strong>: {item.syntax}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
);
};

export default FloatingButton;
