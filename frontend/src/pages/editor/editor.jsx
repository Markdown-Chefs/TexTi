import { useEffect, useState, useCallback } from "react";
import { updateNoteContent } from "../../api/notes";
import { debounce } from "lodash";

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

// TODO: use highlightJS instead for codemirror
// TODO: markedJS:
    // hide meta info
    // support for image render
    // support for latex
    // support for GFM alerts

function Editor({ noteID, content="" }) {
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

    const handleChange = (event) => {
        setMdString(event);
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
    }));

    // initialise content from database
    useEffect(() => {
        setMdString(content)
    }, [content]);

    // save content to database
    useEffect(() => {
        saveUserNoteContent();
    }, [mdString, saveUserNoteContent]);

    return (
        <>
        <AppBar setMode={setMode} />
        <div style={{ display: "flex", overflow: "hidden", height: "100vh" }}>
            {mode !== "preview" && (
                <div style={{ width: "50%", height: "100%", flex: 1, overflowY: "auto"}}>
                    <CodeMirror
                        id="editor"
                        // minHeight="100vh"
                        // height="auto"
                        theme={"light"}
                        value={mdString}
                        basicSetup={{
                            tabSize: 4,
                            // searchKeymap: false,
                            // history: true,                
                        }}
                        onChange={handleChange}
                        extensions={[
                            markdown({ base: markdownLanguage }),
                            EditorView.lineWrapping,
                            EditorView.theme({
                                "&": {
                                    fontSize: "12pt",
                                    border: "1px solid #c0c0c0"
                                },
                                ".cm-content": {
                                    fontFamily: "Menlo, Monaco, Lucida Console, monospace",
                                    minHeight: "200px"
                                },
                                ".cm-scroller": {
                                    overflow: "auto",
                                    minHeight: "100vh",
                                }
                            }),
                        ]}
                    />
                </div>
            )}
            {mode !== "edit" && (
                <div
                    id="previewer"
                    style={{
                        textAlign: mode === "preview" ? "center" : "left",
                        width: mode === "preview" ? "100%" : "50%",
                        height: "100%",
                        flex: 1,
                        overflowY: "auto",
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