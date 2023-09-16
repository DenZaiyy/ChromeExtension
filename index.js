let myLeads = [];

const nameEl = document.getElementById("name-el");
const linkEl = document.getElementById("link-el");
const inputBtn = document.getElementById("input-btn");
const ulEl = document.getElementById("ul-el");
const deleteBtn = document.getElementById("delete-btn");
const tabBtn = document.getElementById("tab-btn");

const leadsFromLocalStorage = JSON.parse(localStorage.getItem("myLeads"));

if (leadsFromLocalStorage) {
    myLeads = leadsFromLocalStorage;
    render(myLeads);
}

async function getFavicon(url) {
    const newUrl = url.split("/")[2];

    try {
        const response = await fetch(
            `http://favicongrabber.com/api/grab/${newUrl}`
        ).then((res) => res.json());

        if (response) {
            return response.icons["0"].src;
        }
    } catch (error) {
        console.error("Erreur lors de la récupération de l'icône :", error);
    }
    return null;
}

tabBtn.addEventListener("click", function () {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        myLeads.push({
            name: tabs[0].title,
            link: tabs[0].url,
            icon: tabs[0].favIconUrl,
        });
        localStorage.setItem("myLeads", JSON.stringify(myLeads));
        render(myLeads);
    });
});

function render(leads) {
    let listItems = "";
    for (let i = 0; i < leads.length; i++) {
        listItems += `
            <li>
                <a href='${leads[i]["link"]}' target='_blank'>
                ${
                    leads[i]["icon"]
                        ? `<img src="${leads[i]["icon"]}" alt="icon for ${leads[i]["name"]} tab" width="16" height="16"/>`
                        : ""
                }
                    ${leads[i]["name"]}
                </a>
                <div class="actions">
                    <i class="fa-solid fa-pen-to-square fa-xl edit-icon" data-index="${i}"></i>
                    <i class="fa-solid fa-trash-can fa-xl del-icon" data-index="${i}"></i>
                </div>
            </li>
        `;
    }

    ulEl.innerHTML = listItems;

    // Ajoutez un gestionnaire d'événements aux icônes d'édition & de suppression
    const editIcons = document.querySelectorAll(".edit-icon");
    const deleteIcons = document.querySelectorAll(".del-icon");

    editIcons.forEach((icon) => {
        icon.addEventListener("click", handleEditClick);
    });

    deleteIcons.forEach((icon) => {
        icon.addEventListener("click", handleDeleteClick);
    });
}

function handleEditClick(event) {
    const index = event.target.getAttribute("data-index");
    const newName = prompt("Nouveau nom :");
    if (newName !== null) {
        myLeads[index]["name"] = newName;
        localStorage.setItem("myLeads", JSON.stringify(myLeads));
        render(myLeads);
    }
}

function handleDeleteClick(event) {
    const index = event.target.getAttribute("data-index");
    myLeads.splice(index, 1);
    localStorage.setItem("myLeads", JSON.stringify(myLeads));
    render(myLeads);
}

deleteBtn.addEventListener("dblclick", function () {
    localStorage.clear();
    myLeads = [];
    render(myLeads);
});

inputBtn.addEventListener("click", async function () {
    const name = nameEl.value;
    const link = linkEl.value;
    const icon = await getFavicon(link);
    myLeads.push({ name, link, icon });
    nameEl.value = "";
    linkEl.value = "";
    localStorage.setItem("myLeads", JSON.stringify(myLeads));
    render(myLeads);
});
