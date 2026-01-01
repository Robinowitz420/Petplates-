'use client';

import { debugEnabled } from '@/lib/utils/debugLog';

export default function ImageInversionDetector() {
  if (!debugEnabled) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-xl font-bold text-foreground">Diagnostics Disabled</h1>
          <p className="text-sm text-gray-500 mt-2">
            This diagnostics page is disabled in production. To enable it, set{' '}
            <code className="font-mono">NEXT_PUBLIC_ENABLE_DEBUG=true</code>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      margin: 0,
      padding: '20px',
      background: '#0a0a0a',
      fontFamily: 'monospace',
      color: 'white',
      minHeight: '100vh'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ color: '#60a5fa' }}>🔍 Image Color Inversion Detector</h1>
        <p style={{ color: '#9ca3af', marginBottom: '20px' }}>
          This tool scans your page for CSS that inverts image colors (common in dark mode implementations)
        </p>

        <div style={{ marginBottom: '20px' }}>
          <button
            onClick={() => {
              if (typeof window !== 'undefined' && (window as any).scanPage) {
                (window as any).scanPage();
              }
            }}
            style={{
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              marginRight: '10px'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#2563eb'}
            onMouseOut={(e) => e.currentTarget.style.background = '#3b82f6'}
          >
            🔎 Scan Page
          </button>
          <button
            onClick={() => {
              if (typeof window !== 'undefined' && (window as any).highlightIssues) {
                (window as any).highlightIssues();
              }
            }}
            style={{
              background: '#ef4444',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              marginRight: '10px'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#dc2626'}
            onMouseOut={(e) => e.currentTarget.style.background = '#ef4444'}
          >
            🎯 Highlight Affected Images
          </button>
          <button
            onClick={() => {
              if (typeof window !== 'undefined' && (window as any).fixIssues) {
                (window as any).fixIssues();
              }
            }}
            style={{
              background: '#10b981',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#059669'}
            onMouseOut={(e) => e.currentTarget.style.background = '#10b981'}
          >
            🔧 Auto-Fix (Temporary)
          </button>
        </div>

        <div id="stats" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '20px'
        }}></div>
        <div id="results" style={{
          background: '#1a1a1a',
          border: '2px solid #333',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '20px'
        }}></div>
      </div>

      <script
        dangerouslySetInnerHTML={{
          __html: `
            function scanPage() {
              const results = document.getElementById('results');
              const stats = document.getElementById('stats');
              results.innerHTML = '<h2>Scanning...</h2>';
              
              const issues = [];
              const affectedImages = [];
              
              // Check all images
              const allImages = document.querySelectorAll('img');
              console.log(\`Found \${allImages.length} images\`);
              
              allImages.forEach((img, index) => {
                const computedStyle = window.getComputedStyle(img);
                const filter = computedStyle.filter;
                
                // Check for invert filter
                if (filter && filter !== 'none' && filter.includes('invert')) {
                  issues.push({
                    type: 'Image has invert filter',
                    element: img,
                    selector: getSelector(img),
                    filter: filter,
                    src: img.src,
                    alt: img.alt || 'no alt',
                    severity: 'high'
                  });
                  affectedImages.push(img);
                }
                
                // Check parent elements for dark mode classes
                let parent = img.parentElement;
                let depth = 0;
                while (parent && depth < 10) {
                  const parentStyle = window.getComputedStyle(parent);
                  const parentFilter = parentStyle.filter;
                  
                  if (parentFilter && parentFilter !== 'none' && parentFilter.includes('invert')) {
                    issues.push({
                      type: 'Parent element has invert filter',
                      element: parent,
                      imageElement: img,
                      selector: getSelector(parent),
                      filter: parentFilter,
                      src: img.src,
                      alt: img.alt || 'no alt',
                      severity: 'high'
                    });
                    affectedImages.push(img);
                    break;
                  }
                  
                  parent = parent.parentElement;
                  depth++;
                }
              });
              
              // Check global CSS rules
              const stylesheets = Array.from(document.styleSheets);
              let cssRulesWithInvert = [];
              
              stylesheets.forEach(sheet => {
                try {
                  const rules = Array.from(sheet.cssRules || []);
                  rules.forEach(rule => {
                    if (rule.style && rule.style.filter && rule.style.filter !== 'none' && rule.style.filter.includes('invert')) {
                      cssRulesWithInvert.push({
                        selector: rule.selectorText,
                        filter: rule.style.filter,
                        sheet: sheet.href || 'inline'
                      });
                    }
                  });
                } catch (e) {
                  // Cross-origin stylesheets might throw errors
                  console.warn('Could not access stylesheet:', e);
                }
              });
              
              // Display stats
              stats.innerHTML = \`
                <div style="background: #1a1a1a; border: 2px solid #333; border-radius: 8px; padding: 16px; text-align: center;">
                  <div style="font-size: 32px; font-weight: bold; color: #60a5fa;">\${allImages.length}</div>
                  <div style="color: #9ca3af; margin-top: 8px;">Total Images</div>
                </div>
                <div style="background: #1a1a1a; border: 2px solid #333; border-radius: 8px; padding: 16px; text-align: center;">
                  <div style="font-size: 32px; font-weight: bold; color: \${affectedImages.length > 0 ? '#ef4444' : '#10b981'}">\${affectedImages.length}</div>
                  <div style="color: #9ca3af; margin-top: 8px;">Affected Images</div>
                </div>
                <div style="background: #1a1a1a; border: 2px solid #333; border-radius: 8px; padding: 16px; text-align: center;">
                  <div style="font-size: 32px; font-weight: bold; color: #60a5fa">\${cssRulesWithInvert.length}</div>
                  <div style="color: #9ca3af; margin-top: 8px;">CSS Rules with Invert</div>
                </div>
              \`;
              
              // Display results
              let html = '<h2 style="color: #34d399; font-size: 18px; margin-top: 20px;">Scan Results</h2>';
              
              if (issues.length === 0 && cssRulesWithInvert.length === 0) {
                html += '<div style="background: #152d15; border-left: 4px solid #10b981; padding: 12px; margin: 8px 0; border-radius: 4px;">✅ No color inversion issues found!</div>';
              } else {
                // Show affected images
                if (issues.length > 0) {
                  html += '<h2 style="color: #34d399; font-size: 18px; margin-top: 20px;">🚨 Affected Images</h2>';
                  issues.forEach((issue, i) => {
                    html += \`
                      <div style="background: #2d1515; border-left: 4px solid #ef4444; padding: 12px; margin: 8px 0; border-radius: 4px;">
                        <strong>\${issue.type}</strong><br>
                        Selector: <code style="background: #000; padding: 4px; border-radius: 4px; color: #60a5fa;">\${issue.selector}</code><br>
                        Filter: <code style="background: #000; padding: 4px; border-radius: 4px; color: #60a5fa;">\${issue.filter}</code><br>
                        Image: <code style="background: #000; padding: 4px; border-radius: 4px; color: #60a5fa;">\${issue.src.split('/').pop()}</code><br>
                        Alt: <code style="background: #000; padding: 4px; border-radius: 4px; color: #60a5fa;">\${issue.alt}</code>
                        <div style="background: #000; padding: 8px; border-radius: 4px; margin-top: 8px; overflow-x: auto; font-size: 12px; color: #60a5fa;">
                          // To fix, add this CSS:<br>
                          \${issue.selector} {<br>
                          &nbsp;&nbsp;filter: none !important;<br>
                          &nbsp;&nbsp;-webkit-filter: none !important;<br>
                          }
                        </div>
                      </div>
                    \`;
                  });
                }
                
                // Show CSS rules
                if (cssRulesWithInvert.length > 0) {
                  html += '<h2 style="color: #34d399; font-size: 18px; margin-top: 20px;">📋 CSS Rules Using Invert Filter</h2>';
                  cssRulesWithInvert.forEach(rule => {
                    html += \`
                      <div style="background: #2d1515; border-left: 4px solid #ef4444; padding: 12px; margin: 8px 0; border-radius: 4px;">
                        <strong>Rule found in: \${rule.sheet}</strong><br>
                        Selector: <code style="background: #000; padding: 4px; border-radius: 4px; color: #60a5fa;">\${rule.selector}</code><br>
                        Filter: <code style="background: #000; padding: 4px; border-radius: 4px; color: #60a5fa;">\${rule.filter}</code>
                        <div style="background: #000; padding: 8px; border-radius: 4px; margin-top: 8px; overflow-x: auto; font-size: 12px; color: #60a5fa;">
                          // This rule might be affecting images.<br>
                          // Consider excluding images from this rule or adding filter: none !important to images.
                        </div>
                      </div>
                    \`;
                  });
                }
                
                // Common fixes
                html += \`
                  <h2 style="color: #34d399; font-size: 18px; margin-top: 20px;">🔧 Common Fixes</h2>
                  <div style="background: #152d15; border-left: 4px solid #10b981; padding: 12px; margin: 8px 0; border-radius: 4px;">
                    <strong>Method 1: Exclude images from dark mode inversion</strong>
                    <div style="background: #000; padding: 8px; border-radius: 4px; margin-top: 8px; overflow-x: auto; font-size: 12px; color: #60a5fa;">
/* In your global CSS */<br>
img, picture, video {<br>
&nbsp;&nbsp;filter: none !important;<br>
}<br>
<br>
/* Or for specific dark mode implementations */<br>
.dark img, [data-theme="dark"] img {<br>
&nbsp;&nbsp;filter: none !important;<br>
}
                    </div>
                  </div>
                  <div style="background: #152d15; border-left: 4px solid #10b981; padding: 12px; margin: 8px 0; border-radius: 4px; margin-top: 12px;">
                    <strong>Method 2: Add a class to images that should NOT be inverted</strong>
                    <div style="background: #000; padding: 8px; border-radius: 4px; margin-top: 8px; overflow-x: auto; font-size: 12px; color: #60a5fa;">
.no-invert {<br>
&nbsp;&nbsp;filter: none !important;<br>
}<br>
<br>
// Then add to your images:<br>
&lt;img className="no-invert" src="..." /&gt;
                    </div>
                  </div>
                \`;
              }
              
              results.innerHTML = html;
              
              // Store for other functions
              window.affectedImages = affectedImages;
              window.cssRulesWithInvert = cssRulesWithInvert;
            }
            
            function getSelector(element) {
              if (element.id) return \`#\${element.id}\`;
              if (element.className) {
                const classes = element.className.split(' ').filter(c => c).join('.');
                if (classes) return \`\${element.tagName.toLowerCase()}.\${classes}\`;
              }
              return element.tagName.toLowerCase();
            }
            
            function highlightIssues() {
              if (!window.affectedImages) {
                alert('Please run scan first!');
                return;
              }
              
              window.affectedImages.forEach(img => {
                img.style.outline = '4px solid red';
                img.style.outlineOffset = '2px';
              });
              
              setTimeout(() => {
                window.affectedImages.forEach(img => {
                  img.style.outline = '';
                });
              }, 3000);
            }
            
            function fixIssues() {
              if (!window.affectedImages) {
                alert('Please run scan first!');
                return;
              }
              
              let fixed = 0;
              window.affectedImages.forEach(img => {
                img.style.filter = 'none';
                img.style.webkitFilter = 'none';
                fixed++;
              });
              
              alert(\`Temporarily fixed \${fixed} images. Add permanent CSS fix to your stylesheet!\`);
            }
            
            // Auto-run on load
            if (typeof window !== 'undefined') {
              window.addEventListener('load', () => {
                setTimeout(scanPage, 500);
              });
            }
          `
        }}
      />
    </div>
  );
}

// Client-side functions
if (typeof window !== 'undefined') {
  (window as any).scanPage = function() {
    const results = document.getElementById('results');
    const stats = document.getElementById('stats');
    if (!results || !stats) return;
    
    results.innerHTML = '<h2>Scanning...</h2>';
    
    const issues: any[] = [];
    const affectedImages: HTMLImageElement[] = [];
    
    // Check all images
    const allImages = document.querySelectorAll('img');
    console.log(`Found ${allImages.length} images`);
    
    allImages.forEach((img) => {
      const computedStyle = window.getComputedStyle(img);
      const filter = computedStyle.filter;
      
      // Check for invert filter
      if (filter && filter !== 'none' && filter.includes('invert')) {
        issues.push({
          type: 'Image has invert filter',
          element: img,
          selector: getSelector(img),
          filter: filter,
          src: img.src,
          alt: img.alt || 'no alt',
          severity: 'high'
        });
        affectedImages.push(img);
      }
      
      // Check parent elements
      let parent = img.parentElement;
      let depth = 0;
      while (parent && depth < 10) {
        const parentStyle = window.getComputedStyle(parent);
        const parentFilter = parentStyle.filter;
        
        if (parentFilter && parentFilter !== 'none' && parentFilter.includes('invert')) {
          issues.push({
            type: 'Parent element has invert filter',
            element: parent,
            imageElement: img,
            selector: getSelector(parent),
            filter: parentFilter,
            src: img.src,
            alt: img.alt || 'no alt',
            severity: 'high'
          });
          affectedImages.push(img);
          break;
        }
        
        parent = parent.parentElement;
        depth++;
      }
    });
    
    // Check global CSS rules
    const stylesheets = Array.from(document.styleSheets);
    const cssRulesWithInvert: any[] = [];
    
    stylesheets.forEach(sheet => {
      try {
        const rules = Array.from(sheet.cssRules || []);
        rules.forEach(rule => {
          const cssRule = rule as CSSStyleRule;
          if (cssRule.style && cssRule.style.filter && cssRule.style.filter !== 'none' && cssRule.style.filter.includes('invert')) {
            cssRulesWithInvert.push({
              selector: cssRule.selectorText,
              filter: cssRule.style.filter,
              sheet: sheet.href || 'inline'
            });
          }
        });
      } catch (e) {
        console.warn('Could not access stylesheet:', e);
      }
    });
    
    // Display stats
    stats.innerHTML = `
      <div style="background: #1a1a1a; border: 2px solid #333; border-radius: 8px; padding: 16px; text-align: center;">
        <div style="font-size: 32px; font-weight: bold; color: #60a5fa;">${allImages.length}</div>
        <div style="color: #9ca3af; margin-top: 8px;">Total Images</div>
      </div>
      <div style="background: #1a1a1a; border: 2px solid #333; border-radius: 8px; padding: 16px; text-align: center;">
        <div style="font-size: 32px; font-weight: bold; color: ${affectedImages.length > 0 ? '#ef4444' : '#10b981'}">${affectedImages.length}</div>
        <div style="color: #9ca3af; margin-top: 8px;">Affected Images</div>
      </div>
      <div style="background: #1a1a1a; border: 2px solid #333; border-radius: 8px; padding: 16px; text-align: center;">
        <div style="font-size: 32px; font-weight: bold; color: #60a5fa">${cssRulesWithInvert.length}</div>
        <div style="color: #9ca3af; margin-top: 8px;">CSS Rules with Invert</div>
      </div>
    `;
    
    // Display results
    let html = '<h2 style="color: #34d399; font-size: 18px; margin-top: 20px;">Scan Results</h2>';
    
    if (issues.length === 0 && cssRulesWithInvert.length === 0) {
      html += '<div style="background: #152d15; border-left: 4px solid #10b981; padding: 12px; margin: 8px 0; border-radius: 4px;">✅ No color inversion issues found!</div>';
    } else {
      if (issues.length > 0) {
        html += '<h2 style="color: #34d399; font-size: 18px; margin-top: 20px;">🚨 Affected Images</h2>';
        issues.forEach((issue) => {
          html += `
            <div style="background: #2d1515; border-left: 4px solid #ef4444; padding: 12px; margin: 8px 0; border-radius: 4px;">
              <strong>${issue.type}</strong><br>
              Selector: <code style="background: #000; padding: 4px; border-radius: 4px; color: #60a5fa;">${issue.selector}</code><br>
              Filter: <code style="background: #000; padding: 4px; border-radius: 4px; color: #60a5fa;">${issue.filter}</code><br>
              Image: <code style="background: #000; padding: 4px; border-radius: 4px; color: #60a5fa;">${issue.src.split('/').pop()}</code><br>
              Alt: <code style="background: #000; padding: 4px; border-radius: 4px; color: #60a5fa;">${issue.alt}</code>
              <div style="background: #000; padding: 8px; border-radius: 4px; margin-top: 8px; overflow-x: auto; font-size: 12px; color: #60a5fa;">
                // To fix, add this CSS:<br>
                ${issue.selector} {<br>
                &nbsp;&nbsp;filter: none !important;<br>
                &nbsp;&nbsp;-webkit-filter: none !important;<br>
                }
              </div>
            </div>
          `;
        });
      }
      
      if (cssRulesWithInvert.length > 0) {
        html += '<h2 style="color: #34d399; font-size: 18px; margin-top: 20px;">📋 CSS Rules Using Invert Filter</h2>';
        cssRulesWithInvert.forEach(rule => {
          html += `
            <div style="background: #2d1515; border-left: 4px solid #ef4444; padding: 12px; margin: 8px 0; border-radius: 4px;">
              <strong>Rule found in: ${rule.sheet}</strong><br>
              Selector: <code style="background: #000; padding: 4px; border-radius: 4px; color: #60a5fa;">${rule.selector}</code><br>
              Filter: <code style="background: #000; padding: 4px; border-radius: 4px; color: #60a5fa;">${rule.filter}</code>
              <div style="background: #000; padding: 8px; border-radius: 4px; margin-top: 8px; overflow-x: auto; font-size: 12px; color: #60a5fa;">
                // This rule might be affecting images.<br>
                // Consider excluding images from this rule or adding filter: none !important to images.
              </div>
            </div>
          `;
        });
      }
    }
    
    results.innerHTML = html;
    (window as any).affectedImages = affectedImages;
    (window as any).cssRulesWithInvert = cssRulesWithInvert;
  };
  
  (window as any).highlightIssues = function() {
    const affectedImages = (window as any).affectedImages;
    if (!affectedImages || affectedImages.length === 0) {
      alert('Please run scan first!');
      return;
    }
    
    affectedImages.forEach((img: HTMLImageElement) => {
      img.style.outline = '4px solid red';
      img.style.outlineOffset = '2px';
    });
    
    setTimeout(() => {
      affectedImages.forEach((img: HTMLImageElement) => {
        img.style.outline = '';
      });
    }, 3000);
  };
  
  (window as any).fixIssues = function() {
    const affectedImages = (window as any).affectedImages;
    if (!affectedImages || affectedImages.length === 0) {
      alert('Please run scan first!');
      return;
    }
    
    let fixed = 0;
    affectedImages.forEach((img: HTMLImageElement) => {
      img.style.filter = 'none';
      img.style.webkitFilter = 'none';
      fixed++;
    });
    
    alert(`Temporarily fixed ${fixed} images. Add permanent CSS fix to your stylesheet!`);
  };
}

function getSelector(element: Element): string {
  if (element.id) return `#${element.id}`;
  if (element.className) {
    const classes = element.className.toString().split(' ').filter(c => c).join('.');
    if (classes) return `${element.tagName.toLowerCase()}.${classes}`;
  }
  return element.tagName.toLowerCase();
}

