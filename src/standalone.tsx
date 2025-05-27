import React from "react";
import ReactDOM from "react-dom/client";
import App from "./app";
import "./style.css"
import { BenchScene, BenchTopic } from "./utility/mockData";
import { MinioMockData } from "./utility/minioData";

import("../dev/scss/style.scss");
import("@fortawesome/fontawesome-free/css/all.min.css");

ReactDOM.createRoot(document.getElementById("arpas-root") as HTMLElement).render(
    <React.StrictMode>
        <App minioData={MinioMockData} scene={BenchScene} topic={BenchTopic} />
    </React.StrictMode>
);
