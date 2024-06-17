import { Marked } from "marked";
import { markedHighlight } from "marked-highlight";
import hljs from "highlight.js";
import jsPDF from "jspdf";

function handleExport(noteTitle, blob, noteFormat) {
    if (!noteTitle) {
        noteTitle = 'TexTi'
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = noteTitle + '.' + noteFormat;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

export function exportMarkdown(noteTitle, noteContent) {
    const blob = new Blob([noteContent], { type: 'text/markdown' });
    handleExport(noteTitle, blob, 'md')
}

export function exportStyledHTML(noteTitle, noteContent) {
    const marked = new Marked(
        markedHighlight({
            gfm: true,
            langPrefix: 'hljs language-',
            highlight(code, lang, info) {
                const language = hljs.getLanguage(lang) ? lang : 'plaintext';
                return hljs.highlight(code, { language }).value;
            }
        }),
    );

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
    <head>
    <link
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
        rel="stylesheet"
        integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH"
        crossorigin="anonymous"
    />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/a11y-light.min.css">
    <script type="module">
        import hljs from 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/es/highlight.min.js';
    </script>
    <title>${noteTitle}</title>
</head>
<body>
    ${marked.parse(noteContent)}
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    handleExport(noteTitle, blob, 'html')
}

export function exportRawHTML(noteTitle, noteContent) {
    const marked = new Marked();

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
    <head>
    <title>${noteTitle}</title>
</head>
<body>
    ${marked.parse(noteContent)}
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    handleExport(noteTitle, blob, 'html')
}

export async function exportPDF(noteTitle, noteContent) {
    const marked = new Marked(
        markedHighlight({
            gfm: true,
            langPrefix: 'hljs language-',
            highlight(code, lang, info) {
                const language = hljs.getLanguage(lang) ? lang : 'plaintext';
                return hljs.highlight(code, { language }).value;
            }
        }),
    );

    const doc = new jsPDF({
        orientation: 'p',
        unit: 'pt',
        format: 'a4',
        margins: { top: 10, bottom: 10, left: 10, right: 10 }
    });

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <title>${noteTitle}</title>
</head>
<body>
    <style>
        body { font-family: Arial, sans-serif; font-size: 12px; }
        pre, code {
            font-family: monospace;
            width: 570px;
        }
     </style>
    ${marked.parse(noteContent)}
</body>
</html>`;

    doc.setDocumentProperties({
        title: noteTitle,
    });

    await doc.html(htmlContent, {
        callback: function (doc) {
            doc.save(`${noteTitle}.pdf`);
        },
        x: 10,
        y: 10,
        // windowWidth: 800
    });
}