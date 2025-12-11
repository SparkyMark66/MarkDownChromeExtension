// Get references to UI elements
const downloadBtn = document.getElementById('downloadBtn');
const statusDiv = document.getElementById('status');

// Function to show status messages
function showStatus(message, type) {
  statusDiv.textContent = message;
  statusDiv.className = type;
  statusDiv.style.display = 'block';
}

// Function to sanitize filename
function sanitizeFilename(filename) {
  // Remove invalid characters for filenames
  return filename.replace(/[<>:"/\\|?*\x00-\x1F]/g, '_')
                 .replace(/\s+/g, '_')
                 .substring(0, 200); // Limit length
}

// Main download handler
downloadBtn.addEventListener('click', async () => {
  try {
    // Disable button and show processing status
    downloadBtn.disabled = true;
    showStatus('Converting page to Markdown...', 'processing');

    // Get the active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab || !tab.id) {
      throw new Error('No active tab found');
    }

    // Check if the URL is valid for content scripts
    if (tab.url.startsWith('chrome://') || 
        tab.url.startsWith('chrome-extension://') ||
        tab.url.startsWith('edge://') ||
        tab.url.startsWith('about:')) {
      throw new Error('Cannot access browser internal pages');
    }

    // Inject the content script to extract page content
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: extractPageContent
    });

    if (!results || !results[0] || !results[0].result) {
      throw new Error('Failed to extract page content');
    }

    const { title, content, url } = results[0].result;

    // Create markdown content
    const markdown = generateMarkdown(title, url, content);

    // Generate filename
    const filename = sanitizeFilename(title || 'page') + '.md';

    // Create blob and download
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const urlBlob = URL.createObjectURL(blob);

    // Trigger download with save dialog
    await chrome.downloads.download({
      url: urlBlob,
      filename: filename,
      saveAs: true // This prompts the user to choose location
    });

    // Show success message
    showStatus('✓ Download started successfully!', 'success');

    // Re-enable button after a short delay
    setTimeout(() => {
      downloadBtn.disabled = false;
    }, 1000);

  } catch (error) {
    console.error('Error:', error);
    showStatus(`Error: ${error.message}`, 'error');
    downloadBtn.disabled = false;
  }
});

// Function to generate markdown from extracted content
function generateMarkdown(title, url, content) {
  let markdown = '';
  
  // Add title
  if (title) {
    markdown += `# ${title}\n\n`;
  }
  
  // Add source URL
  if (url) {
    markdown += `**Source:** ${url}\n\n`;
    markdown += `**Downloaded:** ${new Date().toLocaleString()}\n\n`;
    markdown += '---\n\n';
  }
  
  // Add content
  markdown += content;
  
  return markdown;
}

// This function runs in the page context to extract content
function extractPageContent() {
  try {
    // Get page title
    const title = document.title;
    const url = window.location.href;

    // Helper function to make URLs absolute
    function makeAbsoluteUrl(urlString) {
      try {
        return new URL(urlString, window.location.href).href;
      } catch {
        return urlString;
      }
    }

    // Helper function to extract YouTube video ID
    function getYouTubeId(url) {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = url.match(regExp);
      return (match && match[2].length === 11) ? match[2] : null;
    }

    // Function to handle iframe content
    function processIframe(iframe) {
      const src = iframe.getAttribute('src');
      const title = iframe.getAttribute('title') || 'Embedded Content';
      
      if (!src) {
        return `\n> **[Embedded Content]**: ${title}\n\n`;
      }

      const absoluteSrc = makeAbsoluteUrl(src);
      
      // Check for specific types of embeds
      if (absoluteSrc.includes('youtube.com') || absoluteSrc.includes('youtu.be')) {
        const videoId = getYouTubeId(absoluteSrc);
        return `\n**[📹 Video]**: [${title}](${absoluteSrc})${videoId ? `\n- YouTube ID: ${videoId}` : ''}\n\n`;
      } else if (absoluteSrc.includes('vimeo.com')) {
        return `\n**[📹 Video]**: [${title}](${absoluteSrc})\n\n`;
      } else if (absoluteSrc.includes('maps.google.com') || absoluteSrc.includes('google.com/maps')) {
        return `\n**[🗺️ Map]**: [${title}](${absoluteSrc})\n\n`;
      } else if (absoluteSrc.includes('twitter.com') || absoluteSrc.includes('x.com')) {
        return `\n**[🐦 Tweet]**: [${title}](${absoluteSrc})\n\n`;
      } else if (absoluteSrc.includes('instagram.com')) {
        return `\n**[📷 Instagram Post]**: [${title}](${absoluteSrc})\n\n`;
      } else {
        return `\n**[🔗 Embedded Content]**: [${title}](${absoluteSrc})\n\n`;
      }
    }

    // Function to handle video elements
    function processVideo(video) {
      const sources = video.querySelectorAll('source');
      let markdown = '\n**[📹 Video]**';
      
      if (video.hasAttribute('src')) {
        const src = makeAbsoluteUrl(video.getAttribute('src'));
        markdown += `: [Video Link](${src})`;
      } else if (sources.length > 0) {
        markdown += ':\n';
        sources.forEach(source => {
          const src = makeAbsoluteUrl(source.getAttribute('src'));
          const type = source.getAttribute('type') || 'video';
          markdown += `- [${type}](${src})\n`;
        });
      } else {
        markdown += ': (embedded video - no source available)';
      }
      
      return markdown + '\n\n';
    }

    // Function to handle audio elements
    function processAudio(audio) {
      const sources = audio.querySelectorAll('source');
      let markdown = '\n**[🔊 Audio]**';
      
      if (audio.hasAttribute('src')) {
        const src = makeAbsoluteUrl(audio.getAttribute('src'));
        markdown += `: [Audio Link](${src})`;
      } else if (sources.length > 0) {
        markdown += ':\n';
        sources.forEach(source => {
          const src = makeAbsoluteUrl(source.getAttribute('src'));
          const type = source.getAttribute('type') || 'audio';
          markdown += `- [${type}](${src})\n`;
        });
      } else {
        markdown += ': (embedded audio - no source available)';
      }
      
      return markdown + '\n\n';
    }

    // Function to handle SVG elements
    function processSvg(svg) {
      let markdown = '\n';
      
      // Try to get SVG title or description
      const titleElem = svg.querySelector('title');
      const descElem = svg.querySelector('desc');
      const svgTitle = titleElem ? titleElem.textContent : 'SVG Graphic';
      const svgDesc = descElem ? descElem.textContent : '';
      
      // Check if SVG has a link to external source
      const use = svg.querySelector('use');
      if (use && use.hasAttribute('href')) {
        const href = makeAbsoluteUrl(use.getAttribute('href'));
        markdown += `**[📊 ${svgTitle}]**: [View SVG](${href})\n`;
      } else {
        markdown += `**[📊 SVG Graphic]**: ${svgTitle}\n`;
      }
      
      if (svgDesc) {
        markdown += `> ${svgDesc}\n`;
      }
      
      // Include inline SVG code for compatibility
      markdown += '\n<details>\n<summary>SVG Code (click to expand)</summary>\n\n```svg\n';
      markdown += svg.outerHTML.substring(0, 5000); // Limit size
      if (svg.outerHTML.length > 5000) {
        markdown += '\n... (truncated)';
      }
      markdown += '\n```\n\n</details>\n\n';
      
      return markdown;
    }

    // Function to handle canvas elements
    function processCanvas(canvas) {
      const width = canvas.width;
      const height = canvas.height;
      const id = canvas.id || 'canvas';
      
      return `\n**[🎨 Canvas Graphics]**: ${id} (${width}x${height})\n> Interactive or dynamic graphic content (cannot be captured)\n\n`;
    }

    // Function to extract data from charts (common libraries)
    function processChart(element) {
      let markdown = '\n**[📊 Chart/Graph]**\n';
      
      // Try to find associated data
      const dataScript = element.querySelector('script');
      if (dataScript) {
        const scriptContent = dataScript.textContent;
        
        // Try to extract data arrays (simple pattern matching)
        const dataMatch = scriptContent.match(/data\s*:\s*\[([\d\s,.\-]+)\]/);
        const labelsMatch = scriptContent.match(/labels\s*:\s*\[([\s\S]*?)\]/);
        
        if (dataMatch || labelsMatch) {
          markdown += '\nExtracted Data:\n';
          if (labelsMatch) {
            markdown += `- Labels: ${labelsMatch[1].trim()}\n`;
          }
          if (dataMatch) {
            markdown += `- Values: ${dataMatch[1].trim()}\n`;
          }
          markdown += '\n';
        }
      }
      
      // Check for aria-label or title
      const ariaLabel = element.getAttribute('aria-label');
      const titleAttr = element.getAttribute('title');
      
      if (ariaLabel) {
        markdown += `> ${ariaLabel}\n`;
      } else if (titleAttr) {
        markdown += `> ${titleAttr}\n`;
      } else {
        markdown += '> Dynamic chart or graph (data not extractable)\n';
      }
      
      return markdown + '\n';
    }

    // Function to handle downloadable files
    function processDownloadLink(link) {
      const href = link.getAttribute('href');
      const download = link.getAttribute('download');
      const linkText = link.textContent.trim() || 'Download';
      
      if (!href) return '';
      
      const absoluteHref = makeAbsoluteUrl(href);
      const fileName = download || href.split('/').pop() || 'file';
      
      // Detect file type from extension
      let fileIcon = '📎';
      const extension = fileName.split('.').pop().toLowerCase();
      
      if (['pdf'].includes(extension)) fileIcon = '📄';
      else if (['doc', 'docx', 'txt', 'rtf'].includes(extension)) fileIcon = '📝';
      else if (['xls', 'xlsx', 'csv'].includes(extension)) fileIcon = '📊';
      else if (['zip', 'rar', '7z', 'tar', 'gz'].includes(extension)) fileIcon = '🗜️';
      else if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg'].includes(extension)) fileIcon = '🖼️';
      else if (['mp4', 'avi', 'mov', 'wmv', 'flv'].includes(extension)) fileIcon = '🎬';
      else if (['mp3', 'wav', 'ogg', 'flac'].includes(extension)) fileIcon = '🎵';
      
      return `**[${fileIcon} Download]**: [${linkText}](${absoluteHref}) (${fileName})`;
    }

    // Function to convert HTML element to markdown
    function elementToMarkdown(element, depth = 0) {
      if (!element) return '';

      const tagName = element.tagName ? element.tagName.toLowerCase() : '';
      let markdown = '';

      // Skip script, style, and other non-content elements
      if (['script', 'style', 'noscript'].includes(tagName)) {
        return '';
      }

      // Handle special embedded content first
      if (tagName === 'iframe') {
        return processIframe(element);
      }
      
      if (tagName === 'video') {
        return processVideo(element);
      }
      
      if (tagName === 'audio') {
        return processAudio(element);
      }
      
      if (tagName === 'svg') {
        return processSvg(element);
      }
      
      if (tagName === 'canvas') {
        return processCanvas(element);
      }

      // Check for chart containers (common class names)
      if (element.classList && (
          element.classList.contains('chart') ||
          element.classList.contains('graph') ||
          element.classList.contains('plotly') ||
          element.classList.contains('chartjs') ||
          element.getAttribute('role') === 'img'
      )) {
        return processChart(element);
      }

      // Handle different elements
      switch (tagName) {
        case 'h1':
          markdown = `# ${element.textContent.trim()}\n\n`;
          break;
        case 'h2':
          markdown = `## ${element.textContent.trim()}\n\n`;
          break;
        case 'h3':
          markdown = `### ${element.textContent.trim()}\n\n`;
          break;
        case 'h4':
          markdown = `#### ${element.textContent.trim()}\n\n`;
          break;
        case 'h5':
          markdown = `##### ${element.textContent.trim()}\n\n`;
          break;
        case 'h6':
          markdown = `###### ${element.textContent.trim()}\n\n`;
          break;
        case 'p':
          const pText = element.textContent.trim();
          if (pText) {
            markdown = `${pText}\n\n`;
          }
          break;
        case 'a':
          const href = element.getAttribute('href');
          const linkText = element.textContent.trim();
          
          // Check if it's a download link
          if (element.hasAttribute('download') || 
              (href && /\.(pdf|doc|docx|xls|xlsx|zip|rar)$/i.test(href))) {
            markdown = processDownloadLink(element);
          } else if (href && linkText) {
            const absoluteHref = makeAbsoluteUrl(href);
            markdown = `[${linkText}](${absoluteHref})`;
          } else {
            markdown = linkText;
          }
          break;
        case 'img':
          const src = element.getAttribute('src');
          const alt = element.getAttribute('alt') || 'Image';
          const imgTitle = element.getAttribute('title');
          
          if (src) {
            const absoluteSrc = makeAbsoluteUrl(src);
            markdown = `![${alt}](${absoluteSrc})`;
            if (imgTitle) {
              markdown += ` *${imgTitle}*`;
            }
            markdown += '\n\n';
          }
          break;
        case 'ul':
        case 'ol':
          Array.from(element.children).forEach((li, index) => {
            const bullet = tagName === 'ul' ? '-' : `${index + 1}.`;
            const liText = li.textContent.trim();
            if (liText) {
              markdown += `${bullet} ${liText}\n`;
            }
          });
          markdown += '\n';
          break;
        case 'blockquote':
          const quoteText = element.textContent.trim();
          if (quoteText) {
            markdown = `> ${quoteText}\n\n`;
          }
          break;
        case 'code':
          markdown = `\`${element.textContent}\``;
          break;
        case 'pre':
          const codeBlock = element.textContent.trim();
          if (codeBlock) {
            markdown = `\`\`\`\n${codeBlock}\n\`\`\`\n\n`;
          }
          break;
        case 'strong':
        case 'b':
          markdown = `**${element.textContent.trim()}**`;
          break;
        case 'em':
        case 'i':
          markdown = `*${element.textContent.trim()}*`;
          break;
        case 'hr':
          markdown = '---\n\n';
          break;
        case 'br':
          markdown = '\n';
          break;
        case 'table':
          markdown = convertTableToMarkdown(element);
          break;
        case 'figure':
          // Handle figure elements (often contain images with captions)
          const figImg = element.querySelector('img');
          const figCaption = element.querySelector('figcaption');
          
          if (figImg) {
            const src = makeAbsoluteUrl(figImg.getAttribute('src'));
            const alt = figImg.getAttribute('alt') || 'Figure';
            markdown = `![${alt}](${src})\n`;
            
            if (figCaption) {
              markdown += `*${figCaption.textContent.trim()}*\n`;
            }
            markdown += '\n';
          } else {
            markdown = elementToMarkdown(element, depth + 1);
          }
          break;
        case 'object':
        case 'embed':
          const objSrc = element.getAttribute('src') || element.getAttribute('data');
          if (objSrc) {
            const absoluteObjSrc = makeAbsoluteUrl(objSrc);
            markdown = `\n**[📎 Embedded Object]**: [View Resource](${absoluteObjSrc})\n\n`;
          }
          break;
        default:
          // For other elements, recursively process children
          if (element.children && element.children.length > 0) {
            Array.from(element.children).forEach(child => {
              markdown += elementToMarkdown(child, depth + 1);
            });
          } else if (element.textContent) {
            const text = element.textContent.trim();
            if (text && !element.closest('ul, ol')) {
              markdown = `${text}\n\n`;
            }
          }
      }

      return markdown;
    }

    // Function to convert HTML table to Markdown
    function convertTableToMarkdown(table) {
      let markdown = '\n';
      const rows = table.querySelectorAll('tr');
      
      if (rows.length === 0) return '';

      rows.forEach((row, rowIndex) => {
        const cells = row.querySelectorAll('th, td');
        const cellContents = Array.from(cells).map(cell => 
          cell.textContent.trim().replace(/\|/g, '\\|')
        );
        
        markdown += '| ' + cellContents.join(' | ') + ' |\n';
        
        // Add separator after header row
        if (rowIndex === 0) {
          markdown += '| ' + cellContents.map(() => '---').join(' | ') + ' |\n';
        }
      });
      
      return markdown + '\n';
    }

    // Get main content
    let content = '';
    
    // Try to find main content area
    const mainContent = document.querySelector('main, article, [role="main"], .content, #content, .main, #main');
    
    if (mainContent) {
      content = elementToMarkdown(mainContent);
    } else {
      // Fallback to body
      content = elementToMarkdown(document.body);
    }

    // Clean up excessive newlines
    content = content.replace(/\n{3,}/g, '\n\n').trim();

    return {
      title: title,
      url: url,
      content: content
    };

  } catch (error) {
    throw new Error(`Content extraction failed: ${error.message}`);
  }
}
