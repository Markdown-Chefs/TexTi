import { useEffect, useState, useCallback } from "react";
import { updateNoteContent, onPublishNote, onUnpublishNote } from "../../api/notes";
import { debounce } from "lodash";
import Split from 'react-split';

// for markdown preview
import { Marked } from "marked";
import { markedHighlight } from "marked-highlight";
import hljs from "highlight.js";
import parse from "html-react-parser"; // avoid using dangerouslySetInnerHTML
import "highlight.js/styles/stackoverflow-light.css";
// import "highlight.js/styles/atom-one-dark.css";
import katex from "katex";
import 'katex/dist/katex.min.css';
import mermaid from 'mermaid';

// for editor
import CodeMirror from '@uiw/react-codemirror';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { EditorView } from "@codemirror/view";
import AppBar from "../../components/appbar/editorNavbar"
import { exportMarkdown, exportPDF, exportStyledHTML, exportRawHTML } from "../../components/exportNote";
import './editor.css'
import FloatingButton from "../../components/floatingButton/floatingButton";
import Alert from "../../components/alert/alert";
import ConfirmPrompt from "../../components/customPrompt/confirmPrompt";


// GFM alert
const preprocessMarkdown = (mdString) => {
    const alertTypes = {
        note: {
            className: 'alert-note',
            icon: '<i class="fas fa-info-circle"></i>' 
        },
        tip: {
            className: 'alert-tip',
            icon: '<i class="fas fa-lightbulb"></i>'
        },
        important: {
            className: 'alert-important',
            icon: '<i class="fas fa-exclamation-circle"></i>'
        },
        warning: {
            className: 'alert-warning',
            icon: '<i class="fas fa-exclamation-triangle"></i>' 
        },
        caution: {
            className: 'alert-caution',
            icon: '<i class="fas fa-exclamation"></i>' 
        }
    };

    for (const [type, { className, icon }] of Object.entries(alertTypes)) {
        const regex = new RegExp(`^>\\s*\\[!${type.toUpperCase()}\\]\\s*(.*)`, 'gm');
        mdString = mdString.replace(regex, (match, p1) => {
            return `<div class="${className}"><span class="alert-icon">${icon}</span><span class="alert-content"${p1.trim()}</span></div>`;
        });
    }

    return mdString;
};
    
    
function Editor({ noteID, noteTitle="", content="", canEdit, isOwner, isPublished, trial, fetchUserNotePermission}) {

    const [alertMessage, setAlertMessage] = useState('');
    const [alertType, setAlertType] = useState('');
    const [confirmPromptOpen, setConfirmPromptOpen] = useState(false);
    
    const marked = new Marked(
        markedHighlight({
            gfm: true,
            langPrefix: 'hljs language-',
            highlight(code, lang, info) {
                if (lang === "mermaid" || lang === "flowchart") {
                    return code;
                  }
                const language = hljs.getLanguage(lang) ? lang : 'plaintext';
                return hljs.highlight(code, { language }).value;
            }
        }),
    );

     // Custom renderer to support LaTeX
     const renderer = new marked.Renderer();

     renderer.code = function (code, lang, escaped) {
        if (lang === 'math' || lang === 'latex') {
            return `<div class="katex-block">${katex.renderToString(code, { throwOnError: false, displayMode: true })}</div>`;
        } else if (lang === 'mermaid') {
            if (code.trim() !== "") {
                return `<div class="mermaid">${code}</div>`;
            }
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

     
    marked.setOptions({
        renderer,
        highlight: function(code, lang) {
            const language = hljs.getLanguage(lang) ? lang : 'plaintext';
            return hljs.highlight(code, { language }).value;
        },
        gfm: true,
        breaks: false,
        smartLists: true,
        smartypants: true
    });


    marked.use({ renderer });
    
    const [mdString, setMdString] = useState(content);
    const [mode, setMode] = useState("both"); 
    const [isDirty, setIsDirty] = useState(false);

    const [isAPublicNote, setIsAPublicNote] = useState(isPublished);
    const [seePublishForm, setSeePublishForm] = useState(false);
    const [publishNoteData, setPublishNoteData] = useState({});

    const handleChange = (event) => {
        if (canEdit) {
            setMdString(event);
            setIsDirty(true);
        } 
    }

    const getMarkdownText = () => {
        const preprocessedMdString = preprocessMarkdown(mdString);
        const rawMarkup = marked.parse(preprocessedMdString);
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

    const handlePublishNote = () => {
        setSeePublishForm(true);
    }

    const closeForm = () => {
        setSeePublishForm(false);
    }

    const handlePublishNoteForm = async (e) => {
        e.preventDefault();
        const public_note_description = e.target.public_note_description.value;
        const public_note_tags_string = e.target.public_note_tags.value;
        const public_note_tags_array = public_note_tags_string.split(',').map(tag => tag.trim()).filter(Boolean).slice(0, 10);
        try {
            const response = await onPublishNote(noteID, public_note_description, public_note_tags_array);
            if (response.status === 200) {
                setSeePublishForm(false);
                setIsAPublicNote(true);
                setAlertMessage('Note is published.');
                setAlertType('success');
            }
        } catch (error) {
            console.log(error.response);
            setAlertMessage(error.response.data.errors[0].msg);
            setAlertType('error');
            console.log("Failed to published note.");
        }
    }

    const handleUnpublishNote = async () => {
        setConfirmPromptOpen(true);
    }

    const handleConfirmUnpublish = async () => {
        setConfirmPromptOpen(false);
        try {
            const response = await onUnpublishNote(noteID);
            if (response.status === 200) {
                setIsAPublicNote(false);
                setAlertMessage('Note is unpublished.');
                setAlertType('success');
            }
        } catch (error) {
            console.log(error.response);
            console.log("Failed to unpublished note.");
            setAlertMessage(error.response.data.errors[0].msg);
            setAlertType('error');
        }
    }

    const handleImageUpload = (url) => {
        const imageMarkdown = `![uploaded image](${url})`;
        setMdString(mdString + '\n' + imageMarkdown);
      };

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



    const renderMermaidDiagrams = () => {
        const mermaidElements = document.querySelectorAll('.mermaid');
        if (mermaidElements.length > 0) {
            mermaid.initialize({ startOnLoad: false });
            mermaidElements.forEach(element => {
                try {
                    mermaid.init(undefined, element);
                } catch (error) {
                    console.error("Mermaid initialization error:", error);
                    element.innerHTML = `<div class="mermaid-error">Syntax error in Mermaid diagram.</div>`;
                }
            });
        }
    };
    
    useEffect(() => {
        const timer = setTimeout(() => {
            renderMermaidDiagrams();
        }, 300); 
    
        return () => clearTimeout(timer);
    }, [mdString]);
    
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
        <AppBar noteTitle={noteTitle} setMode={setMode} trial = { trial } canEdit = {canEdit} isOwner = {isOwner} fetchUserNotePermission = {fetchUserNotePermission} handleExporting = {handleExporting} isAPublicNote={isAPublicNote} handlePublishNote={handlePublishNote} handleUnpublishNote={handleUnpublishNote} handleImageUpload={handleImageUpload} />
        {isOwner && !isAPublicNote && seePublishForm && 
            <div className="form">
                <form onSubmit={handlePublishNoteForm}  className="note-publish-form">
                    <div className="form-group">
                        <div className="form-header"> Publish Your Note </div>
                        <span className="close1" onClick={closeForm}>&times;</span>
                        <label htmlFor="public_note_description">Note's Description</label>
                        <input type="text" className="form-control" id="public_note_description" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="public_note_tags">Note's Tag (Optional)</label>
                        <input type="text" className="form-control" id="public_note_tags" placeholder='Up to 10, separate using ","' />
                    </div>
                    <button type="submit" className="btn submit-btn">Publish</button>
                </form>
            </div>
        }
        
        <FloatingButton/>
        <div style={{ display: "flex", overflow: "auto", height: "100vh", paddingTop: "60px" }}>
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
                            textAlign: "left",
                            width: "100%",
                            height: "auto",
                            overflowY: "auto",
                            padding: "20px",
                            margin: "20px auto",
                            marginLeft: "15vw",
                            marginRight: "15vw"
                        }}
                    >
                        {getMarkdownText()}
                    </div>
                )}
                {alertMessage && (
                <Alert 
                    message={alertMessage} 
                    type={alertType} 
                    onClose={() => setAlertMessage('')} 
                />
                )}
                <ConfirmPrompt 
                open={confirmPromptOpen} 
                onClose={() => setConfirmPromptOpen(false)} 
                onConfirm={handleConfirmUnpublish}
                child="Are you sure you want to unpublish this note?"
            />
        </div>
        </>
    );

}

export default Editor;