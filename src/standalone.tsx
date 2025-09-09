import React from "react";
import ReactDOM from "react-dom/client";
import App from "./app";
import "./style.css"
import { ContentTypes } from "./utility/mockData";
import { BenchScene as SceneData, BenchTopic as TopicData } from "./utility/mockData";

import("../dev/scss/style.scss");
import("@fortawesome/fontawesome-free/css/all.min.css");

ReactDOM.createRoot(document.getElementById("arpas-root") as HTMLElement).render(
    <React.StrictMode>
        <App content_types={ContentTypes} scene={SceneData} topic={TopicData} />
    </React.StrictMode>
);
