import LoadingGif from "./../../components/assets/loading2.gif"
import "./loading.css"


function Loading() {
    return (
        <div className="loading-page">
            <img src={LoadingGif} alt="Loading Gif" className="loading-gif"/>
        </div>
    )
}

export default Loading