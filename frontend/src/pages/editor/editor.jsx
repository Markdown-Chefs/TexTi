import { useEffect, useState, useCallback } from "react";
import { updateNoteContent } from "../../api/notes";
import { debounce } from "lodash";
import Split from 'react-split';

// for markdown preview
import { Marked } from "marked";
import { markedHighlight } from "marked-highlight";
import hljs from "highlight.js";
import parse from "html-react-parser"; // avoid using dangerouslySetInnerHTML
import "highlight.js/styles/stackoverflow-light.css";
// import "highlight.js/styles/atom-one-dark.css";

// for editor
import CodeMirror from '@uiw/react-codemirror';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { EditorView } from "@codemirror/view";
import AppBar from "../../components/appbar/editorNavbar"
import { exportMarkdown, exportPDF, exportStyledHTML, exportRawHTML } from "../../components/exportNote";
import './editor.css'
import katex from "katex";
import 'katex/dist/katex.min.css';


// TODO: use highlightJS instead for codemirror
// TODO: markedJS:
    // hide meta info
    // support for image render
    // support for latex
    // support for GFM alerts


function Editor({ noteID, noteTitle="", content="", canEdit, isOwner, trial, fetchUserNotePermission}) {

    const marked = new Marked(
        markedHighlight({
            gfm: true,
            langPrefix: 'hljs language-',
            // renderer: renderer,
            highlight(code, lang, info) {
                const language = hljs.getLanguage(lang) ? lang : 'plaintext';
                return hljs.highlight(code, { language }).value;
            }
        }),
    );

    marked.setOptions({
        renderer: new marked.Renderer(),
        highlight: function(code, lang) {
            const language = hljs.getLanguage(lang) ? lang : 'plaintext';
            return hljs.highlight(code, { language }).value;
        },
        gfm: true,
        breaks: false,
        smartLists: true,
        smartypants: true
    });

    // Custom renderer to support LaTeX
    const renderer = new marked.Renderer();

    
    renderer.code = function (code, lang, escaped) {
        if (lang === 'math' || lang === 'latex') {
            return `<div class="katex-block">${katex.renderToString(code, { throwOnError: false, displayMode: true })}</div>`;
        }
        return marked.Renderer.prototype.code.apply(this, arguments);
    };
    
    renderer.paragraph = function (text) {
        const inlineLatex = /\$(.+?)\$/g;
        const blockLatex = /\$\$([\s\S]+?)\$\$/g;
    
        // Handle block LaTeX
        if (blockLatex.test(text)) {
            return text.replace(blockLatex, (match, p1) => {
                return `<div class="katex-block">${katex.renderToString(p1, { throwOnError: false, displayMode: true })}</div>`;
            });
        }
    
        // Handle inline LaTeX
        if (inlineLatex.test(text)) {
            text = text.replace(inlineLatex, (match, p1) => {
                return katex.renderToString(p1, { throwOnError: false });
            });
        }
    
        return `<p>${text}</p>`;
    };

   
    
    

    marked.use({ renderer });
    
    const [mdString, setMdString] = useState(content);
    const [mode, setMode] = useState("both"); 
    const [isDirty, setIsDirty] = useState(false);

    const handleChange = (event) => {
        if (canEdit) {
            setMdString(event);
            setIsDirty(true);
        } 
    }

    const getMarkdownText = () => {
        const rawMarkup = marked.parse(mdString);
        return parse(rawMarkup);
    };

    const saveUserNoteContent = useCallback(debounce(async () => {
        try {
            const response = await updateNoteContent(noteID, mdString);
        } catch (error) {
            console.log(error.response);
            console.log("Failed to save note.");
        }
    }, 300));


    const handleExporting = (format) => {
        if (format === "markdown") {
            exportMarkdown(noteTitle, mdString);
        } else if (format === "styledhtml") {
            exportStyledHTML(noteTitle, mdString);
        } else if (format === "rawhtml") {
            exportRawHTML(noteTitle, mdString);
        } else {
            exportPDF(noteTitle, mdString);
        }

    }

    useEffect(() => {
        document.title = noteTitle + ' - TexTi';
    });

    // initialise content from database
    useEffect(() => {
        
        setMdString(content)
    }, [content]);

    // save content to database
    useEffect(() => {
        if (canEdit) {
            saveUserNoteContent();
        }
    }, [mdString]);
    

    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (isDirty) {
                e.preventDefault();
                e.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        }
    }, [isDirty]);

    const editorExtensions = [
        markdown({ base: markdownLanguage }),
        EditorView.lineWrapping,
        EditorView.theme({
            "&": {
                fontSize: "12pt",
                border: "1px solid #c0c0c0",
                height: "100%"
            },
            ".cm-content": {
                fontFamily: "Menlo, Monaco, Lucida Console, monospace",
                minHeight: "200px"
            },
            ".cm-scroller": {
                overflow: "auto",
                height: "100%",
            }
        })
    ];

    if (!trial) canEdit = true;

    if (!canEdit) {
        editorExtensions.push(EditorView.editable.of(false)); // Add the read-only extension conditionally
    }


    return (
        <>
        <AppBar noteTitle={noteTitle} setMode={setMode} trial = { trial } canEdit = {canEdit} isOwner = {isOwner} fetchUserNotePermission = {fetchUserNotePermission} handleExporting = {handleExporting}/>
        <div style={{ display: "flex", overflow: "hidden", height: "100vh" }}>
        {mode === "both" ? (
                     <Split sizes={[50, 50]} minSize={100} gutterSize={10} direction="horizontal" className="split" style={{ display: 'flex', width: '100%' }}gutter={(index, direction) => {
                        const gutterElement = document.createElement('div');
                        gutterElement.className = `gutter gutter-${direction}`;
                        return gutterElement;
                    }}>
                     <div style={{ width: "100%", height: "100%", overflow: "hidden" }}>
                         <CodeMirror
                             id="editor"
                             theme={"light"}
                             value={mdString}
                             basicSetup={{
                                 tabSize: 4,
                             }}
                             onChange={handleChange}
                             extensions={editorExtensions}
                             style={{ height: '100%', width: '100%' }}
                         />
                     </div>
                     <div
                         id="previewer"
                         style={{
                             textAlign: "left",
                             width: "100%",
                             height: "100%",
                             overflowY: "auto",
                             padding: "10px",
                             margin: "10px"
                         }}
                     >
                         {getMarkdownText()}
                     </div>
                 </Split>
                ) : mode === "edit" ? (
                    <div style={{ width: "100%", height: "100%", overflow: "auto" }}>
                        <CodeMirror
                            id="editor"
                            theme={"light"}
                            value={mdString}
                            basicSetup={{
                                tabSize: 4,
                            }}
                            onChange={handleChange}
                            extensions={editorExtensions}
                        />
                    </div>
                ) : (
                    <div
                        id="previewer"
                        style={{
                            textAlign: "center",
                            width: "100%",
                            height: "100%",
                            overflowY: "auto",
                            padding: "10px",
                            margin: "10px"
                        }}
                    >
                        {getMarkdownText()}
                    </div>
                )}
        </div>
        </>
    );

}

export default Editor;