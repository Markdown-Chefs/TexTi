import { useEffect, useState, useCallback } from "react";
import { updateNoteContent } from "../api/notes";
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
        <div style={{ display: "flex", overflow: "hidden", height: "100vh" }}>
            <div style={{ width: "50%", height: "100%", flex: 1, overflowY: "auto" }}>
                <CodeMirror
                    id="editor"
                    // minHeight="100vh"
                    // height="auto"
                    theme={"dark"}
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
            <div id="previewer" style={{width: "50%", height: "100%", margin: "10px", flex: 1, overflowY: "auto"}}>
                {getMarkdownText()}
            </div>
        </div>
        </>
    );

}

export default Editor;