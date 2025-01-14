﻿"use strict";

var logTypes = ["Creation", "Modification", "Deletion", "Warning"];
var connection = new signalR.HubConnectionBuilder().withUrl("/logs").withAutomaticReconnect().build();


function createTblEntry(time, type, content) {
    const tr = document.createElement("tr");
    const tdTime = document.createElement("td");
    const tdType = document.createElement("td");
    const spanType = document.createElement("span");
    const tdContent = document.createElement("td");

    tdTime.innerHTML = time + ' <span class="text-success">NEW</span>';
    spanType.classList.add("badge", getBadgeForLogType(type));
    spanType.innerHTML = type;
    tdType.appendChild(spanType);
    tdContent.innerHTML = content;

    tr.style.opacity = 0;
    tr.appendChild(tdTime);
    tr.appendChild(tdType);
    tr.appendChild(tdContent);

    return tr;
}

function getBadgeForLogType(type) {
    switch (type) {
        case 'Creation':
            return "badge-success";
            break;
        case 'Modification':
            return "badge-info";
            break;
        case 'Deletion':
            return "badge-danger";
        default:
            return "badge-warning";
    }
}

if (new URLSearchParams(window.location.search).get("LogSync")?.toLowerCase() != "false") {
    connection.start().then(function () {
        const connectedToast = createToast("ETour Web", "now", "Connected to log server");
        scheduleToast(connectedToast);

        const urlParams = new URLSearchParams(window.location.search);
        let Type = urlParams.get('Type');

        Type = Type ? Type : "All";

        connection.invoke("Subscribe", Type).then(() => {
            const typeRepr = Type == "All" ? Type : logTypes[parseInt(Type)];
            const subscribedToast = createToast("ETour Web", "now", `Listening for ${typeRepr} logs`);
            scheduleToast(subscribedToast);
        }).catch(err => {
            const errorConnectionToast = createToast("ETour Web", "now", `Failed to subscribe to ${Type} logs`, "❌", "danger");
            scheduleToast(errorConnectionToast);
        });

    }).catch(function (err) {
        const errorConnectionToast = createToast("ETour Web", "now", "Failed to log server", "❌", "danger");
        scheduleToast(errorConnectionToast);
    });

    connection.on("ReceiveLog", function (time, type, content) {

        let tblBody = document.getElementById("logTblBody");

        let tr = createTblEntry(time, type, content);

        if (tblBody.children.length == 20) {
            tblBody.removeChild(tblBody.children[tblBody.children.length - 1]);
        }

        if (tblBody.children.length == 0) {
            tblBody.appendChild(tr);
        } else {
            tblBody.insertBefore(tr, tblBody.children[0]);
        }

        $(tr).animate({
            opacity: 1,
        }, 250);
    });
}