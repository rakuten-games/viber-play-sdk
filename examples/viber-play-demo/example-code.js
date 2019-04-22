
// Code example feature
const runJs = (code) => {
  const script = document.createElement('script');
  script.textContent = `(()=>{try{${code}}catch(e){console.warn(\`Runtime error:\n\n\${e.stack || JSON.stringify(e)}\`);}})();`;
  document.body.appendChild(script);
};

window.addEventListener('unhandledrejection', (e) => {
  console.warn(`Unhandled rejection:\n\n${e.stack || JSON.stringify(e.reason)}`);
});

const init = () => {
  document.querySelectorAll('script.example-code').forEach((script) => {
    const div = document.createElement('div');
    div.classList.add('compiled-example-code');

    script.parentNode.insertBefore(div, script);

    const textarea = document.createElement('textarea');
    textarea.textContent = script.textContent.trim();
    const run = document.createElement('button');
    run.textContent = 'Run';
    const reset = document.createElement('button');
    reset.textContent = 'Reset';

    div.appendChild(textarea);
    div.appendChild(run);
    div.appendChild(reset);

    const editor = CodeMirror.fromTextArea(textarea, {
      lineNumbers: true,
      mode: 'javascript',
      theme: 'monokai',
    });

    run.addEventListener('click', () => {
      runJs(editor.getValue());
    });

    reset.addEventListener('click', () => {
      editor.setValue(script.textContent.trim());
    });
  });
};

init();
