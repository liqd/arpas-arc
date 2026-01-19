import React from "react";
import ReactDOM from "react-dom/client";
import App from "./app";
import "./style.css"
import { ContentTypes } from "./data/mockData";
import { MockScene as SceneData, MockTopic as TopicData } from "./data/mockData";
import { MinioMockData as MinioData } from "./data/minioData";

import("../dev/scss/style.scss");
import("@fortawesome/fontawesome-free/css/all.min.css");

ReactDOM.createRoot(document.getElementById("arpas-root") as HTMLElement).render(
    <React.StrictMode>
        <App content_types={ContentTypes} scene={SceneData} topic={TopicData} minioData={MinioData} />
    </React.StrictMode>
);