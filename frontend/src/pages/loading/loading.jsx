import LoadingGif from "./../../components/assets/loading2.gif"
import "./loading.css"


function Loading() {
    return (
        <div className="loading-page">
            <img src={LoadingGif} alt="Loading Gif" className="loading-gif"/>
            <p className="loading-text"> Loading... If this takes longer than 30 seconds, please refresh the page.</p>
        </div>
    )
}

export default Loading