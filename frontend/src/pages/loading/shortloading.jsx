import "./loading.css"
import LoadingGif from "../../components/assets/loading.gif"

function ShortLoading() {
    return (
        <div className="loading-page">
            <img src={LoadingGif} alt="Loading Gif" className="short-loading-gif"/>
        </div>
    )
}

export default ShortLoading