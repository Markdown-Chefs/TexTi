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

// for editor
import CodeMirror from '@uiw/react-codemirror';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { EditorView } from "@codemirror/view";
import AppBar from "../../components/appbar/editorNavbar"
import { exportMarkdown, exportPDF, exportStyledHTML, exportRawHTML } from "../../components/exportNote";
import './editor.css'


// TODO: use highlightJS instead for codemirror
// TODO: markedJS:
    // hide meta info
    // support for image render
    // support for latex
    // support for GFM alerts


function Editor({ noteID, noteTitle="", content="", canEdit, isOwner, isPublished, trial, fetchUserNotePermission}) {

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
    
    const [mdString, setMdString] = useState(content);
    const [mode, setMode] = useState("both"); 
    const [isDirty, setIsDirty] = useState(false);

    const [isAPublicNote, setIsAPublicNote] = useState(isPublished);
    const [seePublishForm, setSeePublishForm] = useState(false);
    const [publishNoteData, setPublishNoteData] = useState({

    });

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

    const handlePublishNote = () => {
        if (window.confirm('Are you sure you want to publish this note?')) {
            setSeePublishForm(true);
        }
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
            }
        } catch (error) {
            console.log(error.response);
            console.log("Failed to published note.");
        }
    }

    const handleUnpublishNote = async () => {
        if (window.confirm('Are you sure you want to unpublish this note? \nNote: This action is not immediate.')) {
            try {
                const response = await onUnpublishNote(noteID);
                if (response.status === 200) {
                    setIsAPublicNote(false);
                }
            } catch (error) {
                console.log(error.response);
                console.log("Failed to unpublished note.");
            }
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
        {isOwner && !isAPublicNote && <button type="button" className="btn btn-outline-primary" onClick={handlePublishNote}>Publish Note</button>}
        {isOwner && isAPublicNote && <button type="button" className="btn btn-outline-primary" onClick={handleUnpublishNote}>Unpublish Note</button>}
        {isOwner && !isAPublicNote && seePublishForm && 
            <form onSubmit={handlePublishNoteForm}>
                <div className="form-group">
                    <label htmlFor="public_note_description">Note's Description</label>
                    <input type="text" className="form-control" id="public_note_description" />
                </div>
                <div className="form-group">
                    <label htmlFor="public_note_tags">Note's Tag (Optional)</label>
                    <input type="text" className="form-control" id="public_note_tags" placeholder='Up to 10, seperate using ","' />
                </div>
                <button type="submit" className="btn btn-primary">Submit</button>
            </form>
        }
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