// Variables
let lastDogHolder = document.querySelector("#lastDogHolder");
let listParent = document.querySelector("ul");
let checkboxes = [];
let parentBreedindices = [];
let subBreedCounts = [];
let searchButton = document.querySelector("#search");
let numberOfDogs = document.querySelector("#numberOfDogsInput");
let content = document.querySelector("#content");

numberOfDogs.min = 1;
numberOfDogs.max = 50;
numberOfDogs.step = 1;
numberOfDogs.placeholder = "Number 1-50";
numberOfDogs.value = "";

const breedsURL = "https://dog.ceo/api/breeds/list/all";
const randomDogURL = "https://dog.ceo/api/breeds/image/random";
let searching = false;

window.onload = () => {
    LoadCornerDog();
    fetch(breedsURL)
        .then(response => {
            return response.json();
        })
        .then(data => {
            LoadFilters(data);
        })
        .catch(error => {
            console.error("Breeds API error!", error);
            listParent.innerHTML = `
                <li>Something went wrong, please try again later!</li>
                <li>(${error.message})</li>`;
        })
}

const UpperFirstLowerLast = (word) => {
    return word.charAt(0).toUpperCase() + word.slice(1)
}

const SelectAll = (value) => {
    for (let i = 0; i < checkboxes.length; i++) {
        checkboxes[i].checked = value;
    }
}

const ParentCheckboxHit = (index, count) => {
    let value = checkboxes[index].checked;
    for (let i = index + 1; i < index + 1 + count; i++) {
        checkboxes[i].checked = value;
    }
}

const ChildCheckboxHit = (parentIndex, count) => {
    for (let i = 0; i < count; i++) {
        if (checkboxes[parentIndex + 1 + i].checked) {
            checkboxes[parentIndex].checked = true;
            return;
        }
    }
    checkboxes[parentIndex].checked = false;
}

const QuantityUpdated = () => {
    let value = numberOfDogs.value;
    if (value > 1 && value <= 50 && !isNaN(value)) {
        search.innerHTML = `Find ${value} dogs!`;
    }
    else {
        numberOfDogs.value = 1;
        search.innerHTML = "Find a dog!";
    }
}

const LoadDogs = (data, breed, subBreed) => {
    console.log(data);
    let newHTML = `
        <h2 id="breedName">${breed}</h2>
        <div class="line"></div>`;
    if (subBreed != "") {
        newHTML += `
        <h3 id="subBreedName">${subBreed}</h3>
        <div class="line"></div>`;
    }
    newHTML += `<div id="dogGrid">`;
    localStorage.setItem("cornerDog", data.message[Math.floor(Math.random() * data.message.length)]);
    for (let i = 0; i < data.message.length; i++) {
        newHTML += `<img src="${data.message[i]}" alt="A dog"></img>`;
    }
    newHTML += `</div>`;
    content.innerHTML = newHTML;
    let dogGrid = document.querySelector("#dogGrid");
    dogGrid.style.maxWidth = `calc(300px * ${data.message.length} + 50px)`;
    searching = false;
}

const LoadCornerDog = () => {
    let cornerDog = localStorage.getItem("cornerDog");
    if (cornerDog == null) {
        fetch(randomDogURL)
            .then(response => {
                return response.json();
            })
            .then(data => {
                cornerDog = data.message;
                lastDogHolder.innerHTML = `<img src="${cornerDog}" alt="The last dog viewed" id="savedDog">`
            })
            .catch(error => {
                console.error("Random dog API error!", error);
            })
    }
    else {
        lastDogHolder.innerHTML = `<img src="${cornerDog}" alt="The last dog viewed" id="savedDog">`;
    }
}

const Search = () => {
    if (!searching) {
        searching = true;
        let url = "https://dog.ceo/api/breed/";
        let selectedBreeds = [];
        let lastParent = 0;
        for (let i = 0; i < checkboxes.length; i++) {
            if (checkboxes[i].checked) {
                for (let j = 0; j < parentBreedindices.length; j++) {
                    if (i == parentBreedindices[j]) {
                        // Parent
                        lastParent = selectedBreeds.length;
                        selectedBreeds.push({
                            name: checkboxes[i].name,
                            subBreeds: []
                        });
                        break;
                    }
                    else if (i > parentBreedindices[j] && i <= parentBreedindices[j] + subBreedCounts[j]) {
                        // Child
                        selectedBreeds[lastParent].subBreeds.push(checkboxes[i].name);
                        break;
                    }
                    else if (i < parentBreedindices[j]) {
                        // Unique
                        selectedBreeds.push({
                            name: checkboxes[i].name
                        });
                        break;
                    }
                }
            }
        }
        if (selectedBreeds.length > 0) {
            let randomIndex = Math.floor(Math.random() * selectedBreeds.length);
            let breed = selectedBreeds[randomIndex];
            url += breed.name;
            let breedName = UpperFirstLowerLast(breed.name);
            let subBreedName = "";
            if ("subBreeds" in breed && breed.subBreeds.length > 0) {
                let subBreed = breed.subBreeds[Math.floor(Math.random() * breed.subBreeds.length)];
                url += `/${subBreed}`;
                subBreedName = UpperFirstLowerLast(subBreed);
            }
            let quantity = 1;
            if (!isNaN(numberOfDogs.value) && numberOfDogs.value >= 1 && numberOfDogs.value <= 50) {
                quantity = numberOfDogs.value;
            }
            url += `/images/random/${quantity}`;
            content.innerHTML = `<img src="src/loading.png" alt="Logo of a dog face, with loading text below it" id="loadingImage"></img>`;
            fetch(url)
                .then(response => {
                    return response.json();
                })
                .then(data => {
                    LoadDogs(data, breedName, subBreedName);
                })
                .catch(error => {
                    console.error("Search API error!", error);
                    content.innerHTML = `<h1>Something went wrong, please try again later!<br><br>(${error.message})</h1>`;
                    searching = false;
                })
        }
        else {
            console.log("Nothing is selected - Random dog!");
            searching = false;
            SelectAll(true);
            Search();
            SelectAll(false);
        }
    }
}

const LoadFilters = (data) => {
    let newHTML = "";
    let breeds = Object.keys(data.message);
    let currentIndex = 0;
    for (let i = 0; i < breeds.length; i++) {
        let breedName = breeds[i].toString();
        newHTML += `
            <li>
                <input type="checkbox" id="breed${i}" name="${breedName}" value="${breedName}">
                <label for="breed${i}">${UpperFirstLowerLast(breedName)}</label>
            </li>`;
        let subBreeds = data.message[breeds[i]];
        if (subBreeds.length > 0) {
            parentBreedindices.push(currentIndex);
            subBreedCounts.push(subBreeds.length);
            currentIndex++;
            newHTML += `<ul>`;
            for (let j = 0; j < subBreeds.length; j++) {
                let subBreedName = subBreeds[j].toString();
                newHTML += `
                    <li>
                        <input type="checkbox" id="subBreed${j}:${breedName}" name="${subBreedName}" value="${subBreedName}">
                        <label for="subBreed${j}:${breedName}" class="subBreed">${UpperFirstLowerLast(subBreedName)}</label>
                    </li>`;
                currentIndex++;
            }
            newHTML += `</ul>`;
        }
        else {
            currentIndex++;
        }
    }
    listParent.innerHTML = newHTML;
    // Getting elements
    checkboxes = document.querySelectorAll("input");
    // Setting events
    document.querySelector("#selectAll").addEventListener("click", function () { SelectAll(true) });
    document.querySelector("#unselectAll").addEventListener("click", function () { SelectAll(false) });
    for (let i = 0; i < parentBreedindices.length; i++) {
        checkboxes[parentBreedindices[i]].addEventListener("change", function () { ParentCheckboxHit(parentBreedindices[i], subBreedCounts[i]) });
        for (let j = 0; j < subBreedCounts[i]; j++) {
            checkboxes[parentBreedindices[i] + j + 1].addEventListener("change", function () { ChildCheckboxHit(parentBreedindices[i], subBreedCounts[i]) });
        }
    }
    numberOfDogs.addEventListener("change", function () { QuantityUpdated() });
    document.querySelector("#search").addEventListener("click", function () { Search() });
}